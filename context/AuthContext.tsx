import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { supabase } from "../lib/supabaseClient";

// This is the User object that will be stored in our context
export interface User {
  role: "admin" | "voter";
  regNumber: string;
  hasVoted?: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Expose setUser for the login page
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This hook is the key. It checks for a real Supabase session on app load.
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If a Supabase session exists, we know it's an admin.
      if (session?.user) {
        const adminUser: User = {
          regNumber: session.user.email!,
          role: "admin",
        };
        setUser(adminUser);
        sessionStorage.setItem("user", JSON.stringify(adminUser));
      } else {
        // If no Supabase session, check if a voter was logged in from a previous session.
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          // Ensure we don't accidentally load a stale admin session
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role === "voter") {
            setUser(parsedUser);
          }
        }
      }
      setLoading(false);
    };

    getSession();

    // This listens for Supabase login/logout events and updates the state.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const supabaseUser = session?.user;
        if (supabaseUser) {
          const adminUser: User = {
            regNumber: supabaseUser.email!,
            role: "admin",
          };
          setUser(adminUser);
          sessionStorage.setItem("user", JSON.stringify(adminUser));
        } else {
          // If a Supabase user logs out, clear everything.
          setUser(null);
          sessionStorage.removeItem("user");
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // The logout function now signs out of Supabase.
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error);
    // The onAuthStateChange listener will handle setting the user to null.
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

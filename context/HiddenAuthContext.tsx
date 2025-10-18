
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface HiddenUser {
  username: 'real';
}

interface HiddenAuthContextType {
  hiddenUser: HiddenUser | null;
  login: (username: string, pin: string) => Promise<void>;
  logout: () => void;
}

const HiddenAuthContext = createContext<HiddenAuthContextType | undefined>(undefined);

// --- CONFIGURATION FOR HIDDEN ADMIN ---
// To change the hidden credentials, modify the values below.
const HIDDEN_USERNAME = 'real';
const HIDDEN_PIN = 'result';
// --- END CONFIGURATION ---

export const HiddenAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hiddenUser, setHiddenUser] = useState<HiddenUser | null>(null);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('hiddenUser');
      if (storedUser) {
        setHiddenUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse hidden user from session storage", error);
      sessionStorage.removeItem('hiddenUser');
    }
  }, []);

  const login = (username: string, pin: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (username === HIDDEN_USERNAME && pin === HIDDEN_PIN) {
        const user: HiddenUser = { username: 'real' };
        setHiddenUser(user);
        sessionStorage.setItem('hiddenUser', JSON.stringify(user));
        resolve();
      } else {
        reject(new Error('Invalid Credentials'));
      }
    });
  };

  const logout = () => {
    setHiddenUser(null);
    sessionStorage.removeItem('hiddenUser');
  };

  return (
    <HiddenAuthContext.Provider value={{ hiddenUser, login, logout }}>
      {children}
    </HiddenAuthContext.Provider>
  );
};

export const useHiddenAuth = () => {
  const context = useContext(HiddenAuthContext);
  if (context === undefined) {
    throw new Error('useHiddenAuth must be used within a HiddenAuthProvider');
  }
  return context;
};

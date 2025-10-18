import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, User } from "../context/AuthContext";
import { useData } from "../context/DataContext"; // We need this to check voters
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient"; // ADD THIS IMPORT

const LoginPage: React.FC = () => {
  const [regNumber, setRegNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get the simple setUser function from AuthContext
  const { setUser } = useAuth();
  // Get the list of voters from DataContext
  const { voters } = useData();
  const navigate = useNavigate();

  const ADMIN_USERNAME = "1ogidifavour@gmail.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let loggedInUser: User | null = null;

    try {
      // --- THE LOGIN LOGIC FORK ---
      if (regNumber.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
        // Path 1: Attempt to log in as a Supabase admin.
        const { data, error } = await supabase.auth.signInWithPassword({
          email: regNumber,
          password: pin,
        });
        if (error) throw new Error("Invalid admin credentials.");
        if (data.user) {
          loggedInUser = { regNumber: data.user.email!, role: "admin" };
        }
      } else {
        // Path 2: Fallback to checking the voter list.
        const voter = voters.find((v) => v.regNumber === regNumber);
        if (voter && voter.pin === pin) {
          loggedInUser = {
            regNumber: voter.regNumber,
            role: "voter",
            hasVoted: voter.hasVoted,
          };
        }
      }
      // --- END OF FORK ---

      if (loggedInUser) {
        setUser(loggedInUser);
        sessionStorage.setItem("user", JSON.stringify(loggedInUser));

        if (loggedInUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/vote");
        }
      } else {
        throw new Error("Invalid Registration No. or Pin");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // The JSX for this component does not need to change.
  // Paste your existing JSX from your file here.
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 m-4">
        <Header />
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Log in:</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Reg. No."
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800 transition disabled:bg-gray-400"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

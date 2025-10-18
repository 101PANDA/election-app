import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResultsAuth } from "../context/ResultsAuthContext"; // We can reuse the same auth logic

const DiscreetLoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useResultsAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await login(username, password);
      // This page ONLY accepts MainAdmin
      if (role === "mainAdmin") {
        navigate("/admin/discreet-results"); // On success, go to the editor
      } else {
        throw new Error("Access Denied.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-red-700 mb-6">
          LOGIN PAGE
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? "..." : "Authenticate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscreetLoginPage;

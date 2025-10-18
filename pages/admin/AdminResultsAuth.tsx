import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResultsAuth } from "../../context/ResultsAuthContext";

const AdminResultsAuth: React.FC = () => {
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
      if (role === "mainAdmin") {
        navigate("/admin/discreet-results-display");
      } else {
        navigate("/admin/results");
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Results Access
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Please authenticate to view the election results.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Verifying..." : "Proceed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminResultsAuth;

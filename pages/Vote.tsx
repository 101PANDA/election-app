import React, { useState, useMemo, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { useNavigate, Navigate } from "react-router-dom";

const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

const VotePage: React.FC = () => {
  const { candidates, getPositions, election, castVote } = useData();
  const { user, logout } = useAuth();
  const [selectedCandidates, setSelectedCandidates] = useState<{
    [key: string]: string;
  }>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const positions = useMemo(() => getPositions(), [getPositions]);

  useEffect(() => {
    if (user && election.status !== "ongoing" && !user.hasVoted) {
      alert("The election is not currently active. You will be logged out.");
      logout();
      navigate("/login");
    }
  }, [election.status, user, logout, navigate]);

  const handleVoteChange = (position: string, candidateId: string) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [position]: candidateId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // THE FIX IS HERE: We now check if at least ONE candidate has been selected.
    if (Object.keys(selectedCandidates).length === 0) {
      setError("Please vote for at least one candidate.");
      return;
    }

    if (!user?.regNumber) {
      setError(
        "Could not identify the current voter. Please try logging in again."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to submit your vote? This action cannot be undone."
      )
    ) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      await castVote(user.regNumber, selectedCandidates);
      navigate("/confirmation");
    } catch (err: any) {
      if (err.message.includes("already cast their vote")) {
        setError("You have already voted. Your vote was not counted again.");
      } else {
        setError(
          err.message || "An unexpected error occurred while casting your vote."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (user?.hasVoted) {
    return <Navigate to="/confirmation" replace />;
  }

  if (election.status !== "ongoing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Header />
        <h1 className="text-3xl font-bold text-gray-800">
          Election Not Active
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <Header />
        <h2 className="text-center text-xl text-gray-700 mb-8">
          Kindly vote your candidate of choice.
        </h2>
        <form onSubmit={handleSubmit}>
          {positions.map((position) => (
            <div key={position} className="mb-10">
              <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">
                {position}:
              </h3>
              <div className="space-y-4">
                {candidates
                  .filter((c) => c.position === position)
                  .map((candidate) => (
                    <label
                      key={candidate.id}
                      className="flex items-center p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors duration-200 has-[:checked]:bg-emerald-100 has-[:checked]:border-emerald-400"
                    >
                      <img
                        src={candidate.image || DEFAULT_AVATAR}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full mr-4 object-cover bg-gray-200"
                      />
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-800">
                          {candidate.name}
                        </p>
                        <p className="text-gray-600">
                          Computer Science{" "}
                          <span className="inline-block bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">
                            {candidate.level}
                          </span>
                        </p>
                      </div>
                      <input
                        type="radio"
                        name={position}
                        value={candidate.id}
                        onChange={() =>
                          handleVoteChange(position, candidate.id)
                        }
                        className="form-radio h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  ))}
              </div>
            </div>
          ))}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={loading || Object.keys(selectedCandidates).length === 0} // Also disable button if no selection
              className="bg-green-800 text-white font-bold py-3 px-12 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800 transition disabled:bg-gray-400"
            >
              {loading ? "Submitting..." : "Submit Vote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VotePage;

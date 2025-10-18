import React, { useState } from "react";
import { useData } from "../../context/DataContext";

const AdminDashboard: React.FC = () => {
  const {
    election,
    updateElectionStatus,
    candidates,
    voters,
    restartElection,
  } = useData();
  const [isRestarting, setIsRestarting] = useState(false);

  const getStatusClasses = () => {
    switch (election.status) {
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "stopped":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // THE FIX: The handleRestart function is now async to properly call the new restartElection
  const handleRestart = async () => {
    setIsRestarting(true);
    try {
      await restartElection();
      // The page will reload on success, so we don't need to do anything else here.
    } catch (error: any) {
      // This will catch the "Election restart cancelled" message and prevent it from crashing.
      // We can show a small alert or just log it.
      alert(error.message);
      console.log(error.message);
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* MODIFIED: The grid is now 2 columns, and Total Votes is removed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-500">
            Total Candidates
          </h3>
          <p className="text-4xl font-bold text-gray-800">
            {candidates.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-500">
            Registered Voters
          </h3>
          <p className="text-4xl font-bold text-gray-800">{voters.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Election Control
        </h2>
        <div className="flex items-center space-x-4">
          <p className="text-lg text-gray-700">Current Status:</p>
          <span
            className={`px-4 py-1 rounded-full font-semibold text-lg capitalize ${getStatusClasses()}`}
          >
            {election.status}
          </span>
        </div>
        <div className="mt-6 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => updateElectionStatus("ongoing")}
            disabled={election.status === "ongoing"}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Start Election
          </button>
          <button
            onClick={() => updateElectionStatus("stopped")}
            disabled={election.status === "stopped"}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Stop Election
          </button>
          <button
            onClick={() => updateElectionStatus("pending")}
            disabled={election.status === "pending"}
            className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Set to Pending
          </button>

          {/* THE FIX: This button now calls handleRestart and uses the loading state */}
          <button
            onClick={handleRestart}
            disabled={isRestarting}
            className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-400"
          >
            {isRestarting ? "Restarting..." : "Restart Election"}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          "Restart Election" will permanently delete all votes and reset all
          voter statuses.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;

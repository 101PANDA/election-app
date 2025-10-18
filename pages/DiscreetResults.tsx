import React, { useState, useEffect } from "react";
import { useData, ElectionResult } from "../context/DataContext";

const DiscreetResultsPage: React.FC = () => {
  const { discreetResults, getPositions, saveDiscreetResults, candidates } =
    useData();
  const [editableResults, setEditableResults] = useState<ElectionResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const startingPoint =
      discreetResults && discreetResults.length > 0
        ? discreetResults
        : candidates.map((c) => ({ ...c, vote_count: 0 }));
    setEditableResults(JSON.parse(JSON.stringify(startingPoint)));
  }, [discreetResults, candidates]);

  const positions = getPositions();

  const handleVoteChange = (candidateId: string, newVotes: string) => {
    const voteCount = parseInt(newVotes, 10);
    if (isNaN(voteCount) || voteCount < 0) return;
    setEditableResults((prev) =>
      prev.map((r) =>
        r.id === candidateId ? { ...r, vote_count: voteCount } : r
      )
    );
  };

  const handleSaveChanges = async () => {
    if (
      !window.confirm("Are you sure you want to save these discreet results?")
    )
      return;
    setIsSaving(true);
    try {
      const resultsToSave = editableResults.map((r) => ({
        id: r.id,
        vote_count: r.vote_count,
      }));
      await saveDiscreetResults(resultsToSave);
      alert("Discreet results saved successfully!");
    } catch (error) {
      alert("Failed to save discreet results.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-700">
          Discreet Results Editor
        </h1>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
        >
          {isSaving ? "Saving..." : "Save Discreet Results"}
        </button>
      </div>
      {positions.map((position) => (
        <div key={position} className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">
            {position}
          </h2>
          <div className="space-y-4">
            {editableResults
              .filter((c) => c.position === position)
              .sort((a, b) => b.vote_count - a.vote_count)
              .map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex justify-between items-center"
                >
                  <p className="font-semibold text-lg text-gray-700">
                    {candidate.name}
                  </p>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={candidate.vote_count}
                      onChange={(e) =>
                        handleVoteChange(candidate.id, e.target.value)
                      }
                      className="w-24 text-right font-mono p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <span className="text-sm font-normal text-gray-500">
                      votes
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiscreetResultsPage;

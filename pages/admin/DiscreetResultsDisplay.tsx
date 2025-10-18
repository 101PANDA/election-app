import React from "react";
import { useData } from "../../context/DataContext";

const DiscreetResultsDisplay: React.FC = () => {
  const { discreetResults, getPositions } = useData();

  if (!discreetResults || discreetResults.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Discreet Results</h1>
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <p className="text-center text-gray-600">
            No discreet results have been saved yet. Use the editor to create
            them.
          </p>
        </div>
      </div>
    );
  }

  const totalVotes = discreetResults.reduce(
    (total, candidate) => total + candidate.vote_count,
    0
  );
  const positions = getPositions();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">RESULTS</h1>
        <div className="text-right">
          <p className="text-gray-600">Total Votes</p>
          <p className="text-4xl font-bold text-green-800">{totalVotes}</p>
        </div>
      </div>

      {positions.map((position) => (
        <div key={position} className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">
            {position}
          </h2>
          <div className="space-y-4">
            {discreetResults
              .filter((c) => c.position === position)
              .sort((a, b) => b.vote_count - a.vote_count)
              .map((candidate, index) => {
                const positionTotal = discreetResults
                  .filter((c) => c.position === position)
                  .reduce((sum, c) => sum + c.vote_count, 0);
                const percentage =
                  positionTotal > 0
                    ? ((candidate.vote_count / positionTotal) * 100).toFixed(1)
                    : 0;
                return (
                  <div key={candidate.id}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-lg text-gray-700">
                        {index + 1}. {candidate.name}
                      </p>
                      <p className="font-bold text-xl text-gray-800">
                        {candidate.vote_count}{" "}
                        <span className="text-sm font-normal text-gray-500">
                          votes
                        </span>
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-emerald-700 h-4 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm text-gray-500 mt-1">
                      {percentage}% of this position's votes
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiscreetResultsDisplay;

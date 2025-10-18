// import React, { useEffect } from "react";
// import { useData } from "../../context/DataContext";

// const AdminResults: React.FC = () => {
//   const { getPositions, electionResults, fetchResults } = useData();
//   const positions = getPositions();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchResults();
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [fetchResults]);

//   const totalVotes = electionResults.reduce(
//     (total, candidate) => total + candidate.vote_count,
//     0
//   );

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">
//           Live Election Results
//         </h1>
//         <button
//           onClick={fetchResults}
//           className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700 transition"
//         >
//           Refresh Now
//         </button>
//         <div className="text-right">
//           <p className="text-gray-600">Total Votes Cast</p>
//           <p className="text-4xl font-bold text-green-700">{totalVotes}</p>
//         </div>
//       </div>

//       {positions.map((position) => (
//         <div key={position} className="bg-white p-6 rounded-lg shadow mb-8">
//           <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">
//             {position}
//           </h2>
//           <div className="space-y-4">
//             {electionResults
//               .filter((c) => c.position === position)
//               .map((candidate, index) => {
//                 const positionTotal = electionResults
//                   .filter((c) => c.position === position)
//                   .reduce((sum, c) => sum + c.vote_count, 0);
//                 const percentage =
//                   positionTotal > 0
//                     ? ((candidate.vote_count / positionTotal) * 100).toFixed(1)
//                     : 0;
//                 return (
//                   <div key={candidate.id}>
//                     <div className="flex justify-between items-center mb-1">
//                       <p className="font-semibold text-lg text-gray-700">
//                         {index + 1}. {candidate.name}
//                       </p>
//                       <p className="font-bold text-xl text-gray-800">
//                         {candidate.vote_count}{" "}
//                         <span className="text-sm font-normal text-gray-500">
//                           votes
//                         </span>
//                       </p>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-4">
//                       <div
//                         className="bg-emerald-600 h-4 rounded-full"
//                         style={{ width: `${percentage}%` }}
//                       ></div>
//                     </div>
//                     <p className="text-right text-sm text-gray-500 mt-1">
//                       {percentage}% of this position's votes
//                     </p>
//                   </div>
//                 );
//               })}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AdminResults;

import React, { useEffect, useState } from "react";
import { useData } from "../../context/DataContext";
const AdminResults: React.FC = () => {
  // THE FIX: We now also get the main 'voters' list from the context.
  const { getPositions, electionResults, fetchResults, voters } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const positions = getPositions();
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchResults();
    } catch (error) {
      console.error("Failed to refresh results", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // THE FIX: We calculate the number of voters who have voted.
  const votersWhoVoted = voters.filter((voter) => voter.hasVoted).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Live Election Results
        </h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700 transition disabled:bg-gray-400"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Now"}
        </button>
        {/* <div className="text-right">
          <p className="text-gray-600">Total Voters Voted</p>
          <p className="text-4xl font-bold text-green-700">{votersWhoVoted}</p>
        </div> */}
      </div>

      {positions.map((position) => (
        <div key={position} className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">
            {position}
          </h2>
          <div className="space-y-4">
            {electionResults
              .filter((c) => c.position === position)
              .sort((a, b) => b.vote_count - a.vote_count)
              .map((candidate, index) => {
                const positionTotal = electionResults
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
                        className="bg-emerald-600 h-4 rounded-full"
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
export default AdminResults;

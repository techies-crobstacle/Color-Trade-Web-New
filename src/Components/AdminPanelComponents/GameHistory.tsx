import React, { useState, useEffect } from "react";

interface GameResult {
  number: number | null;
  color: string[] | null;
  size: string | null;
}

interface GameHistoryEntry {
  period: string;
  duration: string;
  scheduledAt: string;
  status: string;
  result: GameResult | null;
  // Extended fields (may be present in detail view)
  _id?: string;
  totalBets?: number;
  totalPayouts?: number;
  systemProfit?: number;
  adminSelected?: boolean;
  gameDuration?: number;
}

export default function GameHistory() {
  const [games, setGames] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("default");
  const [gameFilter, setGameFilter] = useState<"1m" | "3m" | "5m" | "10m">("1m");
  const [selectedGame, setSelectedGame] = useState<GameHistoryEntry | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://ctbackend.crobstacle.com/api/game/history?duration=${gameFilter}&page=1&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status === 401) {
          throw new Error("Unauthorized. Please log in to access game history.");
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }

        const json = await res.json();

        // Handle multiple possible response shapes from the API
        let records: GameHistoryEntry[] = [];
        if (Array.isArray(json?.data?.data)) {
          records = json.data.data;
        } else if (Array.isArray(json?.data)) {
          records = json.data;
        } else if (Array.isArray(json)) {
          records = json;
        } else {
          throw new Error("Unexpected response format");
        }

        setGames(records);
      } catch (err: unknown) {
        console.error("Failed to fetch game history:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameFilter]);

  // Filter games based on search query
  const filtered = (games ?? []).filter((g) => {
    const period = g.period ?? "";
    const matchesSearch = period.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGameType = period.startsWith(`${gameFilter}-`);
    return matchesSearch && matchesGameType;
  });

  // Sort by scheduledAt date
  const sorted = [...filtered];
  if (sortOrder === "asc") {
    sorted.sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  } else if (sortOrder === "desc") {
    sorted.sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  }

  const totalPages = Math.ceil(sorted.length / entriesPerPage);
  const startIdx = (currentPage - 1) * entriesPerPage;
  const displayed = sorted.slice(startIdx, startIdx + entriesPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatColors = (colors: string[] | null | undefined) => {
    if (!colors || colors.length === 0) return "—";
    return colors.join(", ");
  };

  const getGameLabel = (duration: string) => {
    switch (duration) {
      case "1m": return "1 Min Game";
      case "3m": return "3 Min Game";
      case "5m": return "5 Min Game";
      case "10m": return "10 Min Game";
      default: return `${duration} Game`;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString(),
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-10">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Game
              </label>
              <select
                value={gameFilter}
                onChange={(e) => {
                  setGameFilter(e.target.value as "1m" | "3m" | "5m" | "10m");
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1m">1 Min Game</option>
                <option value="3m">3 Min Game</option>
                <option value="5m">5 Min Game</option>
                <option value="10m">10 Min Game</option>
              </select>
            </div>

            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by Period"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entries
              </label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[3, 5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by Date
              </label>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "default" | "asc" | "desc")
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="default">Default</option>
                <option value="asc">Oldest First</option>
                <option value="desc">Newest First</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ←
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex gap-4 mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Total Games: {sorted.length}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Completed: {sorted.filter((g) => g.status === "completed").length}
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Scheduled: {sorted.filter((g) => g.status === "scheduled").length}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Period</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Game Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Winning Number</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Color</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Size</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Scheduled At</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayed.length > 0 ? (
                displayed.map((g, index) => {
                  const scheduled = formatDate(g.scheduledAt);
                  return (
                    <tr
                      key={g.period || String(index)}
                      className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{g.period}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-indigo-100 text-indigo-800 px-4 py-1 text-xs font-medium rounded-full border border-indigo-200">
                          {getGameLabel(g.duration)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(g.status)}`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {g.result ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full border border-green-200">
                            {g.result.number ?? "—"}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {g.result ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full border border-blue-200">
                            {formatColors(g.result.color)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {g.result ? (
                          <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full border border-red-200">
                            {g.result.size ?? "—"}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{scheduled.date}</div>
                        <div className="text-xs text-gray-500">{scheduled.time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedGame(g)}
                          className="bg-blue-600 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No history found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Game Details</h2>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Period:</span>
                  <span className="text-gray-900">{selectedGame.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Game Type:</span>
                  <span className="text-gray-900">{getGameLabel(selectedGame.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedGame.status)}`}>
                    {selectedGame.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Scheduled At:</span>
                  <span className="text-gray-900 text-sm">
                    {new Date(selectedGame.scheduledAt).toLocaleString()}
                  </span>
                </div>

                {/* Result Section */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="font-semibold text-gray-700 mb-2">Result</p>
                  {selectedGame.result ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Winning Number:</span>
                        <span className="text-gray-900">{selectedGame.result.number ?? "—"}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="font-medium text-gray-700">Winning Color:</span>
                        <span className="text-gray-900">{formatColors(selectedGame.result.color)}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="font-medium text-gray-700">Size:</span>
                        <span className="text-gray-900">{selectedGame.result.size ?? "—"}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No result yet (game is scheduled or pending).</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedGame(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// import React, { useState, useEffect } from "react";

// interface GameHistoryEntry {
//   _id: string;
//   period: string;
//   winningNumber: number | null;
//   color: string[] | null;
//   size: string | null;
//   totalBets: number;
//   totalPayouts: number;
//   systemProfit: number;
//   adminSelected: boolean;
//   createdAt: string;
//   status: string;
//   gameDuration: number;
//   scheduledAt: string;
// }

// export default function GameHistory() {
//   const [games, setGames] = useState<GameHistoryEntry[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("default");
//   const [gameFilter, setGameFilter] = useState<"1m" | "3m" | "5m" | "10m">("3m");
//   const [selectedGame, setSelectedGame] = useState<GameHistoryEntry | null>(null);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       setLoading(true);
//       setError(null);

//       try {

//         // Uncomment this for real API call:

//         const token = localStorage.getItem("token");
//         const res = await fetch("https://ctbackend.crobstacle.com/api/game/history", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (res.status === 401) {
//           throw new Error("Unauthorized. Please log in to access game history.");
//         }

//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status} - ${res.statusText}`);
//         }

//         const json = await res.json();

//         if (!json.data || !Array.isArray(json.data)) {
//           throw new Error('Unexpected response format');
//         }

//         setGames(json.data);
//       } catch (err: unknown) {
//         console.error("Failed to fetch game history:", err);
//         if (err instanceof Error) {
//           setError(err.message);
//         } else {
//           setError("Unknown error occurred.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   // Filter games based on search query and game type
//   const filtered = (games ?? []).filter((g) => {
//     const matchesSearch = g._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          g.period.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesGameType = g.period.includes(`${gameFilter}-`);

//     return matchesSearch && matchesGameType;
//   });

//   // Sort by date
//   if (sortOrder === "asc") {
//     filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
//   } else if (sortOrder === "desc") {
//     filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//   }

//   const totalPages = Math.ceil(filtered.length / entriesPerPage);
//   const startIdx = (currentPage - 1) * entriesPerPage;
//   const displayed = filtered.slice(startIdx, startIdx + entriesPerPage);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed': return 'bg-green-100 text-green-800 border-green-200';
//       case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const formatColors = (colors: string[] | null) => {
//     if (!colors || colors.length === 0) return "—";
//     return colors.join(", ");
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center p-10">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         <span className="ml-2">Loading...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center p-10">
//         <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
//           Error: {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 bg-gray-50">
//       <div className="bg-white rounded-lg shadow-sm">

//         {/* Controls */}
//         <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
//           <div className="flex flex-wrap gap-4">
//             <div className="min-w-48">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Select Game</label>
//               <select
//                 value={gameFilter}
//                 onChange={(e) => {
//                   setGameFilter(e.target.value as "1m" | "3m" | "5m" | "10m");
//                   setCurrentPage(1);
//                 }}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="1m">1st Color Trade</option>
//                 <option value="3m">2nd Color Trade</option>
//                 <option value="5m">3rd Color Trade</option>
//                 <option value="10m">4th Color Trade</option>
//               </select>
//             </div>

//             <div className="min-w-48">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
//               <input
//                 type="text"
//                 placeholder="Search by ID or Period"
//                 value={searchQuery}
//                 onChange={(e) => {
//                   setSearchQuery(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Entries</label>
//               <select
//                 value={entriesPerPage}
//                 onChange={(e) => {
//                   setEntriesPerPage(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//                 className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 {[3, 5, 10, 20].map((n) => (
//                   <option key={n} value={n}>{n}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Sort by Date</label>
//               <select
//                 value={sortOrder}
//                 onChange={(e) => setSortOrder(e.target.value as "default" | "asc" | "desc")}
//                 className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="default">Default</option>
//                 <option value="asc">Oldest First</option>
//                 <option value="desc">Newest First</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//             >
//               ←
//             </button>
//             <span className="text-sm text-gray-600">
//               Page {currentPage} of {totalPages || 1}
//             </span>
//             <button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages || totalPages === 0}
//               className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//             >
//               →
//             </button>
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="flex gap-4 mb-6">
//           <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//             Total Games: {filtered.length}
//           </span>
//           <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//             Completed: {filtered.filter(g => g.status === 'completed').length}
//           </span>
//           <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
//             Scheduled: {filtered.filter(g => g.status === 'scheduled').length}
//           </span>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 rounded-lg">
//             <thead className="bg-gray-900 text-white">
//               <tr>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Period</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Result</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Total Bets</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Total Payouts</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Profit</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Admin Selected</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Created At</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {displayed.length > 0 ? (
//                 displayed.map((g, index) => (
//                   <tr key={g._id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                     <td className="px-4 py-3">
//                       <div>
//                         <div className="font-medium text-gray-900">{g.period}</div>
//                         <div className="text-sm text-gray-500">ID: ...{g._id.slice(-8)}</div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(g.status)}`}>
//                         {g.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex flex-wrap gap-1">
//                         <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full border border-blue-200">
//                           {formatColors(g.color)}
//                         </span>
//                         <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full border border-green-200">
//                           {g.winningNumber ?? "—"}
//                         </span>
//                         <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full border border-red-200">
//                           {g.size ?? "—"}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`font-medium ${g.totalBets > 0 ? 'text-green-600' : 'text-gray-500'}`}>
//                         {g.totalBets}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`font-medium ${g.totalPayouts > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
//                         {g.totalPayouts}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`font-bold ${
//                         g.systemProfit > 0 ? 'text-green-600' :
//                         g.systemProfit < 0 ? 'text-red-600' : 'text-gray-500'
//                       }`}>
//                         {g.systemProfit}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
//                         g.adminSelected ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-gray-100 text-gray-800 border-gray-200'
//                       }`}>
//                         {g.adminSelected ? "Yes" : "No"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div>
//                         <div className="text-sm text-gray-900">{new Date(g.createdAt).toLocaleDateString()}</div>
//                         <div className="text-xs text-gray-500">{new Date(g.createdAt).toLocaleTimeString()}</div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <button
//                         onClick={() => setSelectedGame(g)}
//                         className="bg-blue-600 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
//                     No history found for the selected criteria.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Details Modal */}
//       {selectedGame && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto m-4">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h2 className="text-xl font-bold text-gray-900">Game Details</h2>
//             </div>

//             <div className="p-6">
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Session ID:</span>
//                       <span className="text-gray-900 font-mono text-sm">{selectedGame._id}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Period:</span>
//                       <span className="text-gray-900">{selectedGame.period}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Status:</span>
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedGame.status)}`}>
//                         {selectedGame.status}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Game Duration:</span>
//                       <span className="text-gray-900">{selectedGame.gameDuration}s</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Winning Colors:</span>
//                       <span className="text-gray-900">{formatColors(selectedGame.color)}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Winning Number:</span>
//                       <span className="text-gray-900">{selectedGame.winningNumber ?? "—"}</span>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Winning Size:</span>
//                       <span className="text-gray-900">{selectedGame.size ?? "—"}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Total Bets:</span>
//                       <span className="text-gray-900 font-medium">{selectedGame.totalBets}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Total Payouts:</span>
//                       <span className="text-gray-900 font-medium">{selectedGame.totalPayouts}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">System Profit:</span>
//                       <span className={`font-bold ${
//                         selectedGame.systemProfit > 0 ? 'text-green-600' :
//                         selectedGame.systemProfit < 0 ? 'text-red-600' : 'text-gray-500'
//                       }`}>
//                         {selectedGame.systemProfit}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Admin Selected:</span>
//                       <span className="text-gray-900">{selectedGame.adminSelected ? "Yes" : "No"}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="font-medium text-gray-700">Scheduled At:</span>
//                       <span className="text-gray-900 text-sm">{new Date(selectedGame.scheduledAt).toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <div className="flex justify-between">
//                     <span className="font-medium text-gray-700">Created At:</span>
//                     <span className="text-gray-900">{new Date(selectedGame.createdAt).toLocaleString()}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
//               <button
//                 onClick={() => setSelectedGame(null)}
//                 className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   TextField,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   Box,
//   CircularProgress,
//   Chip,
//   Stack,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Card,
//   CardContent,
//   Divider,
// } from "@mui/material";
// import { ArrowBack, ArrowForward } from "@mui/icons-material";

// interface GameHistoryEntry {
//   _id: string;
//   period: string;
//   winningNumber: number | null;
//   color: string | null;
//   size: string | null;
//   totalBets: number;
//   totalPayouts: number;
//   systemProfit: number;
//   adminSelected: boolean;
//   createdAt: string;
// }

// export default function GameHistory() {
//   const [games, setGames] = useState<GameHistoryEntry[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("desc");
//   const [gameFilter, setGameFilter] = useState<"1m" | "3m" | "5m" | "10m">("1m");
//   const [selectedGame, setSelectedGame] = useState<GameHistoryEntry | null>(null);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       setLoading(true);
//       setError(null);
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("No token found. Please log in.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await fetch("https://ctbackend.crobstacle.com/api/game/history", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (res.status === 401) throw new Error("Unauthorized. Please log in.");
//         if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

//         const json = await res.json();
//         if (!json?.data?.data) throw new Error("Invalid response format");

//         setGames(json.data.data);
//       } catch (err: any) {
//         console.error("Failed to fetch game history:", err);
//         setError(err.message || "Unknown error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   const filtered = games
//     .filter(
//       (g) =>
//         g._id.toLowerCase().includes(searchQuery.toLowerCase()) &&
//         g.period.endsWith(`-${gameFilter}`)
//     )
//     .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

//   const totalPages = Math.ceil(filtered.length / entriesPerPage);
//   const displayed = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

//   if (loading) {
//     return (
//       <Box className="flex justify-center p-10">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box className="flex justify-center p-10">
//         <Typography color="error">Error: {error}</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box className="space-y-6">
//       <Box className="flex flex-wrap gap-4 justify-between items-center">
//         <FormControl size="small">
//           <InputLabel>Select Game</InputLabel>
//           <Select
//             value={gameFilter}
//             label="Select Game"
//             onChange={(e) => {
//               setGameFilter(e.target.value as any);
//               setCurrentPage(1);
//             }}
//           >
//             <MenuItem value="1m">1min Color Trade</MenuItem>
//             <MenuItem value="3m">3min Color Trade</MenuItem>
//             <MenuItem value="5m">5min Color Trade</MenuItem>
//             <MenuItem value="10m">10min Color Trade</MenuItem>
//           </Select>
//         </FormControl>

//         <TextField
//           variant="outlined"
//           size="small"
//           label="Search by ID"
//           value={searchQuery}
//           onChange={(e) => {
//             setSearchQuery(e.target.value);
//             setCurrentPage(1);
//           }}
//           sx={{ minWidth: 200 }}
//         />

//         <FormControl size="small">
//           <InputLabel>Entries</InputLabel>
//           <Select
//             value={entriesPerPage}
//             label="Entries"
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//           >
//             {[3, 5, 10].map((n) => (
//               <MenuItem key={n} value={n}>{n}</MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl size="small">
//           <InputLabel>Sort by Date</InputLabel>
//           <Select
//             value={sortOrder}
//             label="Sort by Date"
//             onChange={(e) => setSortOrder(e.target.value as any)}
//           >
//             <MenuItem value="default">Default</MenuItem>
//             <MenuItem value="asc">Oldest First</MenuItem>
//             <MenuItem value="desc">Newest First</MenuItem>
//           </Select>
//         </FormControl>

//         <Box className="flex items-center gap-2">
//           <Button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
//             <ArrowBack />
//           </Button>
//           <Typography>Page {currentPage} of {totalPages}</Typography>
//           <Button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
//             <ArrowForward />
//           </Button>
//         </Box>
//       </Box>

//       <TableContainer component={Paper} className="shadow-md">
//         <Table>
//           <TableHead sx={{ backgroundColor: "#1f1f1f" }}>
//             <TableRow>
//               <TableCell sx={{ color: "white" }}>ID</TableCell>
//               <TableCell sx={{ color: "white" }}>Period</TableCell>
//               <TableCell sx={{ color: "white" }}>Result</TableCell>
//               <TableCell sx={{ color: "white" }}>Total Bets</TableCell>
//               <TableCell sx={{ color: "white" }}>Total Payouts</TableCell>
//               <TableCell sx={{ color: "white" }}>Profit</TableCell>
//               <TableCell sx={{ color: "white" }}>Admin Selected</TableCell>
//               <TableCell sx={{ color: "white" }}>Created At</TableCell>
//               <TableCell sx={{ color: "white" }}>Action</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {displayed.length > 0 ? (
//               displayed.map((g) => (
//                 <TableRow key={g._id} hover>
//                   <TableCell>{g._id}</TableCell>
//                   <TableCell>{g.period}</TableCell>
//                   <TableCell>
//                     <Stack direction="row" spacing={1}>
//                       <Chip label={g.color ?? "—"} size="small" color="primary" />
//                       <Chip label={g.winningNumber ?? "—"} size="small" color="success" />
//                       <Chip label={g.size ?? "—"} size="small" color="error" />
//                     </Stack>
//                   </TableCell>
//                   <TableCell>{g.totalBets}</TableCell>
//                   <TableCell>{g.totalPayouts}</TableCell>
//                   <TableCell>{g.systemProfit}</TableCell>
//                   <TableCell>{g.adminSelected ? "Yes" : "No"}</TableCell>
//                   <TableCell>{new Date(g.createdAt).toLocaleString()}</TableCell>
//                   <TableCell>
//                     <Button variant="contained" size="small" onClick={() => setSelectedGame(g)}>
//                       View
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={9} align="center">
//                   No history found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Dialog open={!!selectedGame} onClose={() => setSelectedGame(null)} maxWidth="sm" fullWidth>
//         <DialogTitle>Game Details</DialogTitle>
//         <Divider />
//         <DialogContent>
//           {selectedGame && (
//             <Card variant="outlined">
//               <CardContent>
//                 <Stack spacing={2}>
//                   {Object.entries({
//                     "Session ID": selectedGame._id,
//                     "Period": selectedGame.period,
//                     "Winning Color": selectedGame.color ?? "—",
//                     "Winning Number": selectedGame.winningNumber ?? "—",
//                     "Winning Size": selectedGame.size ?? "—",
//                     "Total Bets": selectedGame.totalBets,
//                     "Total Payouts": selectedGame.totalPayouts,
//                     "System Profit": selectedGame.systemProfit,
//                     "Admin Selected": selectedGame.adminSelected ? "Yes" : "No",
//                     "Created At": new Date(selectedGame.createdAt).toLocaleString(),
//                   }).map(([label, value]) => (
//                     <Box key={label} display="flex" justifyContent="space-between">
//                       <Typography variant="subtitle2">{label}:</Typography>
//                       <Typography variant="body2">{value}</Typography>
//                     </Box>
//                   ))}
//                 </Stack>
//               </CardContent>
//             </Card>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setSelectedGame(null)}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

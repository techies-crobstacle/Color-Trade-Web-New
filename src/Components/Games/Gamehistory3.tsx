// type ApiHistoryItem = {
//   _id: string;
//   period: string;
//   gameDuration: number;
//   scheduledAt: string;
//   status: string;
//   winningNumber: number | null;
//   color: string[];
//   size: "big" | "small" | null;
//   totalBets: number;
//   totalPayouts: number;
//   systemProfit: number;
//   adminSelected: boolean;
//   createdAt: string;
//   __v: number;
// };

// import React, { useEffect, useState } from "react";

// type HistoryRow = {
//   period: string;
//   number: number;
//   size: "Big" | "Small";
//   colours: ("red" | "green" | "violet")[];
// };

// const colorMap: { [key: string]: string } = {
//   red: "bg-rose-500",
//   green: "bg-green-500",
//   violet: "bg-violet-500",
// };

// export default function HistoryTable() {
//   const [data, setData] = useState<HistoryRow[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // useEffect(() => {
//   //   async function fetchHistory() {
//   //     const token = localStorage.getItem("token");
//   //     try {
//   //       setLoading(true);
//   //       setError(null);

//   //       const response = await fetch(
//   //         "https://ctbackend.crobstacle.com/api/game/history",
//   //         {
//   //           headers: {
//   //             Authorization: `Bearer ${token}`,
//   //             "Content-Type": "application/json",
//   //           },
//   //         }
//   //       );

//   //       if (!response.ok) {
//   //         throw new Error(`API error: ${response.statusText}`);
//   //       }

//   //       const apiData = await response.json();
//   //       const historyArray = Array.isArray(apiData.data) ? apiData.data : [];

//   //       // Keep only completed games
//   //       const completedBets = historyArray.filter(
//   //         (item: any) => item.status === "completed"
//   //       );

//   //       // Only 3-minute games with period ending in "-2"
//   //       const filteredBets = completedBets.filter(
//   //         (item: any) => item.period.startsWith("3m-") && item.period.endsWith("-2")
//   //       );

//   //       // Sort by scheduledAt (latest first)
//   //       const sortedFilteredBets = filteredBets
//   //         .slice()
//   //         .sort(
//   //           (a: any, b: any) =>
//   //             new Date(b.scheduledAt).getTime() -
//   //             new Date(a.scheduledAt).getTime()
//   //         );

//   //       // Take latest 3 games
//   //       const lastThreeBets = sortedFilteredBets.slice(0, 4);

//   //       const mappedData: HistoryRow[] = lastThreeBets.map((item: any) => ({
//   //         period: item.period,
//   //         number: item.winningNumber ?? 0,
//   //         size: item.size
//   //           ? (item.size.charAt(0).toUpperCase() +
//   //               item.size.slice(1).toLowerCase() as "Big" | "Small")
//   //           : "Small",
//   //         colours: (item.color || []).map((c: string) =>
//   //           c.toLowerCase() as "red" | "green" | "violet"
//   //         ),
//   //       }));

//   //       setData(mappedData);
//   //     } catch (err: any) {
//   //       setError(err.message || "Failed to load history data");
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   }

//   //   fetchHistory();
//   // }, []);

//   useEffect(() => {
//   async function fetchHistory() {
//     const token = localStorage.getItem("token");
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch(
//         "https://ctbackend.crobstacle.com/api/game/history",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`API error: ${response.statusText}`);
//       }

//       const apiData = await response.json();
//       const historyArray = Array.isArray(apiData.data)
//         ? (apiData.data as ApiHistoryItem[])
//         : [];

//       const completedBets = historyArray.filter(
//         (item: ApiHistoryItem) => item.status === "completed"
//       );

//       const filteredBets = completedBets.filter(
//         (item: ApiHistoryItem) =>
//           item.period.startsWith("3m-") && item.period.endsWith("-2")
//       );

//       const sortedFilteredBets = filteredBets
//         .slice()
//         .sort(
//           (a: ApiHistoryItem, b: ApiHistoryItem) =>
//             new Date(b.scheduledAt).getTime() -
//             new Date(a.scheduledAt).getTime()
//         );

//       const lastThreeBets = sortedFilteredBets.slice(0, 4);

//       const mappedData: HistoryRow[] = lastThreeBets.map(
//         (item: ApiHistoryItem) => ({
//           period: item.period,
//           number: item.winningNumber ?? 0,
//           size: item.size
//             ? (item.size.charAt(0).toUpperCase() +
//                 item.size.slice(1).toLowerCase() as "Big" | "Small")
//             : "Small",
//           colours: (item.color || []).map(
//             (c: string) => c.toLowerCase() as "red" | "green" | "violet"
//           ),
//         })
//       );

//       setData(mappedData);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message || "Failed to load history data");
//       } else {
//         setError("Failed to load history data");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   fetchHistory();
// }, []);

//   if (loading) {
//     return (
//       <div className="py-4 text-center text-gray-700">Loading history...</div>
//     );
//   }

//   if (error) {
//     return <div className="py-4 text-center text-red-600">Error: {error}</div>;
//   }

//   return (
//     <div className="overflow-x-auto py-4">
//       <table className="min-w-full rounded-t-lg border-separate border-spacing-0">
//         <thead>
//           <tr>
//             <th className="bg-green-500 text-white px-4 py-3 font-bold text-base border-0 rounded-tl-lg">
//               Period
//             </th>
//             <th className="bg-green-500 text-white px-4 py-3 font-bold text-base border-0">
//               Number
//             </th>
//             <th className="bg-green-500 text-white px-4 py-3 font-bold text-base border-0">
//               Size
//             </th>
//             <th className="bg-green-500 text-white px-4 py-3 font-bold text-base border-0 rounded-tr-lg">
//               Colour
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((row) => (
//             <tr key={row.period} className="text-center border-b">
//               <td className="py-2 px-4 text-base text-gray-900 border-b">
//                 {row.period}
//               </td>
//               <td
//                 className={`py-2 px-4 text-lg font-bold border-b ${
//                   row.number === 0 ? "text-rose-500" : "text-green-600"
//                 }`}
//               >
//                 {row.number}
//               </td>
//               <td className="py-2 px-4 text-base border-b">{row.size}</td>
//               <td className="py-2 px-4 border-b">
//                 <div className="flex flex-row justify-center items-center space-x-1">
//                   {row.colours.map((color, i) => (
//                     <span
//                       key={i}
//                       className={`inline-block w-4 h-4 rounded-full ${colorMap[color]} border border-white`}
//                     />
//                   ))}
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


type ApiHistoryItem = {
  period: string;
  duration: string;
  scheduledAt: string;
  status: string;
  result: {
    number: number | null;
    color: string[];
    size: "big" | "small" | null;
  } | null;
};

import React, { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/contexts/SocketContext";

type HistoryRow = {
  period: string;
  number: number;
  size: "Big" | "Small";
  colours: ("red" | "green" | "violet")[];
};

const colorMap: { [key: string]: string } = {
  red: "bg-rose-500",
  green: "bg-green-500",
  violet: "bg-violet-500",
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";

export default function HistoryTable() {
  const [data, setData] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { socket, isConnected } = useSocket();

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      setError(null);

      const response = await fetch(
        `${API_BASE}/api/game/history?status=completed&page=1&limit=10&duration=3m`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();

      // New API response: { data: { data: ApiHistoryItem[], pagination, filters } }
      let allGames: ApiHistoryItem[] = [];

      if (Array.isArray(apiData?.data?.data)) {
        allGames = apiData.data.data as ApiHistoryItem[];
      } else if (Array.isArray(apiData?.data)) {
        allGames = apiData.data as ApiHistoryItem[];
      } else if (Array.isArray(apiData)) {
        allGames = apiData as ApiHistoryItem[];
      }

      // API already filters by duration=3m and status=completed; sort by scheduledAt descending
      const sorted = allGames
        .slice()
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        );

      const latest = sorted.slice(0, 10);

      const mappedData: HistoryRow[] = latest.map((item) => ({
        period: item.period,
        number: item.result?.number ?? 0,
        size: item.result?.size
          ? ((item.result.size.charAt(0).toUpperCase() +
              item.result.size.slice(1).toLowerCase()) as "Big" | "Small")
          : "Small",
        colours: (item.result?.color || []).map(
          (c) => c.toLowerCase() as "red" | "green" | "violet"
        ),
      }));

      setData(mappedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to load history data");
      } else {
        setError("Failed to load history data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Real-time: refresh history when a round finalizes via socket
  useEffect(() => {
    if (!socket) return;

    const onRoundFinalized = () => {
      fetchHistory();
    };

    const onRoundUpdated = (data: ApiHistoryItem) => {
      if (data?.status === "completed") {
        fetchHistory();
      }
    };

    socket.on("round:finalized", onRoundFinalized);
    socket.on("round:updated", onRoundUpdated);
    socket.on("game:result", onRoundFinalized);

    return () => {
      socket.off("round:finalized", onRoundFinalized);
      socket.off("round:updated", onRoundUpdated);
      socket.off("game:result", onRoundFinalized);
    };
  }, [socket, fetchHistory]);

  // Fallback polling every 15s regardless of socket state
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHistory();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="py-4 text-center text-gray-400">Loading history...</div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={fetchHistory}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-4 text-center text-gray-400">
        <p>No history yet.</p>
        <button
          onClick={fetchHistory}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-2 sm:py-4 px-2 sm:px-0">
      <table className="min-w-full rounded-t-lg border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="bg-[#3a3947] text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border-0 rounded-tl-lg">
              Period
            </th>
            <th className="bg-[#3a3947] text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border-0">
              Number
            </th>
            <th className="bg-[#3a3947] text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border-0">
              Size
            </th>
            <th className="bg-[#3a3947] text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base border-0 rounded-tr-lg">
              Colour
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.period} className="text-center border-b">
              <td className="py-2 px-2 sm:px-4 text-xs sm:text-base text-white border-b">
                {row.period}
              </td>
              <td
                className={`py-2 px-2 sm:px-4 text-base sm:text-lg font-bold border-b ${
                  row.number === 0 ? "text-rose-500" : "text-green-600"
                }`}
              >
                {row.number}
              </td>
              <td className="py-2 px-2 sm:px-4 text-xs text-white sm:text-base border-b">
                {row.size}
              </td>
              <td className="py-2 px-2 sm:px-4 border-b">
                <div className="flex flex-row justify-center items-center space-x-0.5 sm:space-x-1">
                  {row.colours.map((color, i) => (
                    <span
                      key={i}
                      className={`inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full ${colorMap[color]} border border-white`}
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
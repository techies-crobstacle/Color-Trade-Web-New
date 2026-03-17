// Place a Bet API integrated

// "use client";

// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import clsx from "clsx";
// import { useSocket } from "@/contexts/SocketContext";
// import PlaceBetButton from "@/Components/Games/PlaceBetButton";
// import PlaceBetModel from "@/Components/Games/PlaceBetModel";
// import GameHistory10 from "@/Components/Games/Gamehistory10";
// import { toast } from "react-toastify";

// type BetSelection = {
//   type: "color" | "number" | "size" | null;
//   value: string | number | null;
// };

// interface GameData {
//   _id: string;
//   period: string;
//   gameDuration: number;
//   scheduledAt: string;
//   status: string;
//   winningNumber: number | null;
//   color: string[];
//   size: string | null;
//   totalBets: number;
//   totalPayouts: number;
//   systemProfit: number;
//   adminSelected: boolean;
//   createdAt: string;
//   __v: number;
// }

// const ROUND_DURATION = 180;
// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "https://ctbackend.crobstacle.com";

// function extractGamesFromHistoryPayload(payload: unknown): GameData[] {
//   if (!payload || typeof payload !== "object") return [];

//   const source = payload as {
//     data?: { data?: unknown } | unknown;
//     games?: unknown;
//   };

//   const candidates = [
//     source.data,
//     source.data && (source.data as { data?: unknown }).data,
//     source.games,
//   ];
//   const allGames: GameData[] = [];

//   candidates.forEach((candidate) => {
//     if (!candidate || !Array.isArray(candidate)) return;

//     candidate.forEach((entry: unknown) => {
//       if (
//         entry &&
//         typeof entry === "object" &&
//         "games" in entry &&
//         Array.isArray((entry as { games: GameData[] }).games)
//       ) {
//         allGames.push(...(entry as { games: GameData[] }).games);
//         return;
//       }

//       if (
//         entry &&
//         typeof entry === "object" &&
//         "period" in entry &&
//         "status" in entry
//       ) {
//         allGames.push(entry as GameData);
//       }
//     });
//   });

//   return allGames;
// }

// function buildFallbackRound(): GameData {
//   const now = new Date();
//   const elapsedSeconds =
//     (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) %
//     ROUND_DURATION;
//   const remainingSeconds = ROUND_DURATION - elapsedSeconds;
//   const scheduledAt = new Date(
//     now.getTime() + remainingSeconds * 1000,
//   ).toISOString();

//   return {
//     _id: `fallback-${getCurrentPeriodId()}`,
//     period: getCurrentPeriodId(),
//     gameDuration: ROUND_DURATION,
//     scheduledAt,
//     status: "scheduled",
//     winningNumber: null,
//     color: [],
//     size: null,
//     totalBets: 0,
//     totalPayouts: 0,
//     systemProfit: 0,
//     adminSelected: false,
//     createdAt: now.toISOString(),
//     __v: 0,
//   };
// }

// function isOpenRound(status: string) {
//   const normalized = status.toLowerCase();
//   return !["completed", "finalized", "closed", "cancelled", "resulted"].includes(
//     normalized,
//   );
// }

// function findActiveRound(games: GameData[]) {
//   const currentPeriodId = getCurrentPeriodId();

//   let foundRound = games.find(
//     (r) => r.period === currentPeriodId && isOpenRound(r.status),
//   );

//   if (!foundRound) {
//     foundRound = games.find(
//       (r) => r.period.endsWith("-4") && isOpenRound(r.status),
//     );
//   }

//   return foundRound || null;
// }

// function Loader() {
//   return (
//     <div className="flex justify-center items-center space-x-2">
//       <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce"></div>
//       <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce200"></div>
//       <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce400"></div>
//       <style jsx>{`
//         .animate-bounce200 {
//           animation: bounce 1.4s infinite;
//           animation-delay: 0.2s;
//         }
//         .animate-bounce400 {
//           animation: bounce 1.4s infinite;
//           animation-delay: 0.4s;
//         }
//         @keyframes bounce {
//           0%,
//           80%,
//           100% {
//             transform: scale(0);
//           }
//           40% {
//             transform: scale(1);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// function pad2(num: number) {
//   return num.toString().padStart(2, "0");
// }

// function getCurrentPeriodId() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = pad2(now.getMonth() + 1);
//   const day = pad2(now.getDate());
//   const hour = pad2(now.getHours());
//   const minutes = Math.floor(now.getMinutes() / 3) * 3;
//   const minStr = pad2(minutes);
//   return `3m-${year}${month}${day}-${hour}${minStr}-4`;
// }

// export default function Min3Game4() {
//   const { socket, currentRounds, isConnected } = useSocket();

//   const [game, setGame] = useState<GameData | null>(null);
//   const [timer, setTimer] = useState(ROUND_DURATION);
//   const [selected, setSelected] = useState<BetSelection>({
//     type: null,
//     value: null,
//   });
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [winningHistory, setWinningHistory] = useState<number[]>([]);
//   const lastRoundSyncAtRef = useRef(0);

//   const getRemainingSeconds = (round: GameData | null) => {
//     if (round?.scheduledAt) {
//       const target = new Date(round.scheduledAt).getTime();
//       if (!Number.isNaN(target)) {
//         const seconds = Math.ceil((target - Date.now()) / 1000);
//         return Math.max(0, seconds);
//       }
//     }

//     const now = new Date();
//     const secondsSinceMidnight =
//       now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
//     const elapsed = secondsSinceMidnight % ROUND_DURATION;
//     return ROUND_DURATION - elapsed;
//   };

//   const fetchCurrentRoundFallback = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       const res = await fetch(`${API_BASE_URL}/api/game/history`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         setLoading(false);
//         return;
//       }

//       const responseData = await res.json();
//       const allGames = extractGamesFromHistoryPayload(responseData);

//       const activeRound = findActiveRound(allGames);
//       if (activeRound) {
//         setGame(activeRound);
//       } else {
//         setGame((prev) => prev ?? buildFallbackRound());
//       }
//     } catch (error) {
//       console.error("Error fetching active round:", error);
//       setGame((prev) => prev ?? buildFallbackRound());
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchWinningHistory = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       const res = await fetch(`${API_BASE_URL}/api/game/history`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) return;

//       const responseData = await res.json();
//       const allGames = extractGamesFromHistoryPayload(responseData);

//       // Filter completed rounds with winning numbers for period ending in -1
//       const completedRounds = allGames
//         .filter(
//           (r: GameData) =>
//             r.status === "completed" &&
//             r.winningNumber !== null &&
//             r.period.endsWith("-4"),
//         )
//         .slice(0, 4)
//         .map((r: GameData) => r.winningNumber as number);

//       setWinningHistory(completedRounds);
//     } catch (error) {
//       console.error("Error fetching winning history:", error);
//     }
//   };
//   // Fetch history on mount and when rounds update
//   useEffect(() => {
//     fetchWinningHistory();
//   }, [currentRounds]);

//   useEffect(() => {
//     void fetchCurrentRoundFallback();

//     const fallbackPoll = setInterval(() => {
//       void fetchCurrentRoundFallback();
//     }, 10000);

//     return () => clearInterval(fallbackPoll);
//   }, [isConnected]);

//   useEffect(() => {
//     if (currentRounds.length === 0) return;
//     const foundRound = findActiveRound(currentRounds);
//     if (foundRound) setGame(foundRound);
//     else void fetchCurrentRoundFallback();
//     setLoading(false);
//   }, [currentRounds]);

//   useEffect(() => {
//     function updateTimer() {
//       const remaining = getRemainingSeconds(game);
//       setTimer(remaining);

//       if (remaining <= 1) {
//         const nowMs = Date.now();

//         if (isConnected && nowMs - lastRoundSyncAtRef.current > 4000) {
//           lastRoundSyncAtRef.current = nowMs;
//           socket?.emit("get:rounds");
//         }

//         const currentPeriodId = getCurrentPeriodId();
//         setGame((prev) => {
//           if (!prev) return buildFallbackRound();
//           if (prev.period !== currentPeriodId) return buildFallbackRound();
//           return prev;
//         });
//       }
//     }

//     updateTimer();
//     const interval = setInterval(updateTimer, 1000);
//     return () => clearInterval(interval);
//   }, [game, isConnected, socket]);

//   useEffect(() => {
//     if (!isConnected) return;

//     socket?.emit("get:rounds");
//     const syncInterval = setInterval(() => {
//       socket?.emit("get:rounds");
//     }, 5000);

//     return () => clearInterval(syncInterval);
//   }, [isConnected, socket]);

//   const disabled = timer <= 30;
//   const hasSelection = selected.type !== null && selected.value !== null;

//   const placeBet = async (amount: number) => {
//     if (!game) {
//       toast.error("No active game found");
//       return;
//     }
//     if (!selected.type || selected.value == null) {
//       toast.error("Please make a selection!");
//       return;
//     }

//     let betType = selected.type;
//     if (betType === "size") betType = "size";
//     else if (betType === "color") betType = "color";
//     else if (betType === "number") betType = "number";

//     const payload = {
//       period: game.period,
//       betAmount: amount,
//       betType,
//       betValue:
//         selected.type === "size" && typeof selected.value === "string"
//           ? selected.value.toLowerCase()
//           : selected.value,
//     };

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Not logged in");

//       const res = await fetch(`${API_BASE_URL}/api/game/bet`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.message || "Bet placement failed");
//       }
//       await res.json();
//       toast.success("Bet placed successfully");
//       setIsModalOpen(false);
//       setSelected({ type: null, value: null });
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         // Use error.message safely
//         console.error(error.message);
//       } else {
//         console.error("Unknown error");
//       }
//     }
//   };

//   const handleSelect = (type: BetSelection["type"], value: string | number) => {
//     if (disabled) return;
//     setSelected((s) =>
//       s.type === type && s.value === value
//         ? { type: null, value: null }
//         : { type, value },
//     );
//   };

//   const handlePlaceBetClick = () => setIsModalOpen(true);
//   // const handleModalCancel = () => setIsModalOpen(false);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader />
//         <span className="ml-2 text-white">Loading game data...</span>
//       </div>
//     );
//   }

//   if (!game) {
//     return (
//       <div className="flex items-center justify-center h-64 text-white">
//         {isConnected
//           ? "Waiting for next round..."
//           : "Reconnecting... showing the next round when available."}
//       </div>
//     );
//   }

//   const { period } = game;
//   const colors = ["Green", "Violet", "Red"] as const;
//   const numbers = Array.from({ length: 10 }, (_, i) => i);
//   const sizeOptions = ["big", "small"] as const;

//   return (
//     <>
//       <div className="relative">
//         {disabled && (
//           <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg z-[1000] flex items-center justify-center pointer-events-none">
//             {timer <= 5 && timer > 0 && (
//               <div className="text-white text-9xl font-extrabold select-none flex justify-center items-center flex-col">
//                 {timer}
//                 <p className="text-base font-medium">
//                   Please wait, for the next round to start!
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         <div className="flex justify-between items-center px-3 py-4 bg-gradient-to-b from-[#FAE59F] to-[#C4933F] rounded-lg">
//           <div className="flex flex-col gap-2">
//             <div className="flex items-center space-x-1 border border-[#8f5206] rounded-3xl px-3 py-1">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 36 36"
//                 className="w-5 h-5 text-[#8f5206]"
//                 fill="currentColor"
//               >
//                 <path d="M23.67 3H12.33C6.66 3 5.25 4.515 5.25 10.56V27.45C5.25 31.44 7.44 32.385 10.095 29.535L10.11 29.52C11.34 28.215 13.215 28.32 14.28 29.745L15.795 31.77C17.01 33.375 18.975 33.375 20.19 31.77L21.705 29.745C22.785 28.305 24.66 28.2 25.89 29.52C28.56 32.37 30.735 31.425 30.735 27.435V10.56C30.75 4.515 29.34 3 23.67 3ZM11.67 18C10.845 18 10.17 17.325 10.17 16.5C10.17 15.675 10.845 15 11.67 15C12.495 15 13.17 15.675 13.17 16.5C13.17 17.325 12.495 18 11.67 18ZM11.67 12C10.845 12 10.17 11.325 10.17 10.5C10.17 9.675 10.845 9 11.67 9C12.495 9 13.17 9.675 13.17 10.5C13.17 11.325 12.495 12 11.67 12ZM24.345 17.625H16.095C15.48 17.625 14.97 17.115 14.97 16.5C14.97 15.885 15.48 15.375 16.095 15.375H24.345C24.96 15.375 25.47 15.885 25.47 16.5C25.47 17.115 24.96 17.625 24.345 17.625ZM24.345 11.625H16.095C15.48 11.625 14.97 11.115 14.97 10.5C14.97 9.885 15.48 9.375 16.095 9.375H24.345C24.96 9.375 25.47 9.885 25.47 10.5C25.47 11.115 24.96 11.625 24.345 11.625Z" />
//               </svg>
//               <button className="text-sm text-[#8f5206]">How to play</button>
//             </div>
//             <h1 className="text-[#8f5206] font-light ml-1">Win Go 3 Min</h1>

//             {/* Winning number Images Last Four - Moved here */}
//             <div className="flex gap-1 ml-1">
//               {winningHistory.length > 0 ? (
//                 winningHistory.map((num, idx) => (
//                   <div
//                     key={idx}
//                     className="md:h-8 md:w-8 w-7 h-7 rounded-full overflow-hidden border border-white"
//                   >
//                     <Image
//                       src={`/No_images/${num}.png`}
//                       alt={`Number ${num}`}
//                       width={32}
//                       height={32}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 ))
//               ) : (
//                 <span className="text-white text-xs">No history yet</span>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col items-center gap-y-1">
//             <h2 className="text-sm text-white">{period}</h2>
//             <h1 className="text-[#8f5206] font-semibold">Time Remaining</h1>
//             <div className="flex items-center space-x-1">
//               {(() => {
//                 const minutes = Math.floor(timer / 60);
//                 const seconds = timer % 60;
//                 const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
//                 return timeString.split("").map((c, i) => (
//                   <div
//                     key={i}
//                     className={clsx(
//                       "flex items-center justify-center h-8 w-7 font-semibold",
//                       c === ":"
//                         ? "bg-transparent text-black text-xl"
//                         : "bg-black text-white",
//                     )}
//                   >
//                     {c}
//                   </div>
//                 ));
//               })()}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-3 gap-5 justify-around my-4">
//           {colors.map((c) => (
//             <button
//               key={c}
//               onClick={() => handleSelect("color", c)}
//               disabled={disabled}
//               className={clsx(
//                 " px-5 md:px-8 py-2 rounded-2xl text-white transition",
//                 c === "Green"
//                   ? "bg-green-600"
//                   : c === "Violet"
//                     ? "bg-purple-500"
//                     : "bg-red-500",
//                 selected.type === "color" &&
//                   selected.value === c &&
//                   "ring-4 ring-yellow-400 scale-105",
//                 disabled && "opacity-60 cursor-not-allowed",
//               )}
//             >
//               {c}
//             </button>
//           ))}
//         </div>

//         {/* Number Grid */}
//         <div className="grid grid-cols-5 gap-4">
//           {numbers.map((n) => (
//             <button
//               key={n}
//               onClick={() => handleSelect("number", n)}
//               disabled={disabled}
//               className={clsx(
//                 "h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden transition flex items-center justify-center",
//                 selected.type === "number" &&
//                   selected.value === n &&
//                   "ring-4 ring-yellow-400 scale-105",
//                 disabled && "opacity-60 cursor-not-allowed",
//               )}
//             >
//               <Image
//                 src={`/No_images/${n}.png`}
//                 alt={`Number ${n}`}
//                 width={80}
//                 height={80}
//                 className="w-full h-full object-cover"
//               />
//             </button>
//           ))}
//         </div>

//         <div className="flex my-6">
//           {sizeOptions.map((bs) => (
//             <button
//               key={bs}
//               onClick={() => handleSelect("size", bs)}
//               disabled={disabled}
//               className={clsx(
//                 "w-1/2 py-3 text-white transition",
//                 bs === "big" ? "bg-orange-500" : "bg-blue-500",
//                 selected.type === "size" &&
//                   selected.value === bs &&
//                   "ring-4 ring-yellow-400 scale-105",
//                 disabled && "opacity-60 cursor-not-allowed",
//               )}
//             >
//               {bs}
//             </button>
//           ))}
//         </div>

//         <PlaceBetButton
//           onClick={handlePlaceBetClick}
//           disabled={disabled}
//           hasSelection={hasSelection}
//         />

//         <PlaceBetModel
//           onConfirm={placeBet}
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           selectedBet={selected}
//           gamePeriod={game?.period}
//           disabled={disabled}
//         />
//       </div>

//       <div className="mt-8 border-t border-green-500 pt-4">
//         <GameHistory10 />
//       </div>
//     </>
//   );
// }



"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useSocket } from "@/contexts/SocketContext";
import PlaceBetButton from "@/Components/Games/PlaceBetButton";
import PlaceBetModel from "@/Components/Games/PlaceBetModel";
import GameHistory1 from "@/Components/Games/Gamehistory1";


type BetSelection = {
  type: "color" | "number" | "size" | null;
  value: string | number | null;
};

interface GameData {
  _id: string;
  period: string;
  gameDuration: number;
  scheduledAt: string;
  status: string;
  winningNumber: number | null;
  color: string[];
  size: string | null;
  totalBets: number;
  totalPayouts: number;
  systemProfit: number;
  adminSelected: boolean;
  createdAt: string;
  __v: number;
}

const ROUND_DURATION = 60; // 1 minutes in seconds
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://ctbackend.crobstacle.com";

function buildFallbackRound(): GameData {
  const now = new Date();
  const startOfMinute = new Date(now);
  startOfMinute.setSeconds(0, 0);
  const scheduledAt = startOfMinute.toISOString();

  return {
    _id: `fallback-${getCurrentPeriodId()}`,
    period: getCurrentPeriodId(),
    gameDuration: ROUND_DURATION,
    scheduledAt,
    status: "scheduled",
    winningNumber: null,
    color: [],
    size: null,
    totalBets: 0,
    totalPayouts: 0,
    systemProfit: 0,
    adminSelected: false,
    createdAt: now.toISOString(),
    __v: 0,
  };
}

function isOpenRound(status: string) {
  const normalized = status.toLowerCase();
  return ![
    "completed",
    "finalized",
    "closed",
    "cancelled",
    "resulted",
  ].includes(normalized);
}

function findActiveRound(games: GameData[]) {
  const currentPeriodId = getCurrentPeriodId();

  let foundRound = games.find(
    (r) => r.period === currentPeriodId && isOpenRound(r.status),
  );

  if (!foundRound) {
    foundRound = games.find(
      (r) => r.period.startsWith("1m-") && isOpenRound(r.status),
    );
  }

  return foundRound || null;
}

function Loader() {
  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce"></div>
      <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce200"></div>
      <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce400"></div>
      <style jsx>{`
        .animate-bounce200 {
          animation: bounce 1.4s infinite;
          animation-delay: 0.2s;
        }
        .animate-bounce400 {
          animation: bounce 1.4s infinite;
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function pad2(num: number) {
  return num.toString().padStart(2, "0");
}

function getCurrentPeriodId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad2(now.getMonth() + 1);
  const day = pad2(now.getDate());
  const hour = pad2(now.getHours());
  const minute = pad2(now.getMinutes());

  return `1m-${year}${month}${day}-${hour}${minute}`;
}

export default function Min3Game1() {
  const { socket, currentRounds, isConnected, lastGames, userBetResults } = useSocket();

  const [game, setGame] = useState<GameData | null>(null);
  const [timer, setTimer] = useState(ROUND_DURATION);
  const [selected, setSelected] = useState<BetSelection>({
    type: null,
    value: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriodId());

  type HistoryItem = {
    period: string;
    scheduledAt: string;
    result: { number: number | null; color: string[]; size: string | null } | null;
  };

  const [winningHistory, setWinningHistory] = useState<HistoryItem[]>([]);
  const lastRoundSyncAtRef = useRef(0);
  const lastSeenPeriodRef = useRef<string | null>(null);
  // Track the last period for which we already fetched history to avoid duplicate calls
  const lastFetchedPeriodRef = useRef<string | null>(null);
  const resultToastShownForPeriodRef = useRef<string | null>(null);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const betMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGamesRef = useRef(lastGames);
  const winningHistoryRef = useRef<HistoryItem[]>([]);
  const [resultPopup, setResultPopup] = useState<{ period: string; number: number; colors: string[]; size: string | null; outcome: string | null; winnings: number } | null>(null);
  const [betMsg, setBetMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPeriod(getCurrentPeriodId());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/game/history?status=completed&page=1&limit=10&duration=1m`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!res.ok) return;
      const apiData = await res.json();

      let allGames: HistoryItem[] = [];
      if (Array.isArray(apiData?.data?.data)) {
        allGames = apiData.data.data as HistoryItem[];
      } else if (Array.isArray(apiData?.data)) {
        allGames = apiData.data as HistoryItem[];
      } else if (Array.isArray(apiData)) {
        allGames = apiData as HistoryItem[];
      }

      const last4 = allGames
        .slice()
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
        )
        .filter((g) => g.result?.number != null)
        .slice(0, 4);
      
      // If we have real-time data, prioritize it over API data
      const last1m = lastGames["1m_game"];
      if (last1m?.winningNumber != null && last1m.period) {
        const realtimeItem: HistoryItem = {
          period: last1m.period,
          scheduledAt: last1m.scheduledAt || new Date().toISOString(),
          result: {
            number: last1m.winningNumber,
            color: last1m.winningColor || [],
            size: last1m.winningSize || null,
          },
        };
        // Replace any duplicate period with real-time data
        const filteredLast4 = last4.filter(item => item.period !== realtimeItem.period);
        const finalHistory = [realtimeItem, ...filteredLast4].slice(0, 4);
        setWinningHistory(finalHistory);
        lastSeenPeriodRef.current = realtimeItem.period;
      } else {
        setWinningHistory(last4);
        if (last4.length > 0) {
          lastSeenPeriodRef.current = last4[0].period;
        }
      }
    } catch {
      // silently ignore fetch errors
    }
  };

  const getRemainingSeconds = (round: GameData | null) => {
    if (round?.scheduledAt && round?.gameDuration) {
      const normalized = round.scheduledAt.replace(" ", "T");
      const startMs = new Date(normalized).getTime();
      if (!Number.isNaN(startMs)) {
        const endMs = startMs + round.gameDuration * 1000;
        const seconds = Math.ceil((endMs - Date.now()) / 1000);
        return Math.max(0, seconds);
      }
    }

    const now = new Date();
    const secondsSinceMidnight =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const elapsed = secondsSinceMidnight % ROUND_DURATION;
    return ROUND_DURATION - elapsed;
  };

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep winningHistoryRef in sync so timer closures always read fresh data
  useEffect(() => {
    winningHistoryRef.current = winningHistory;
  }, [winningHistory]);

  // Re-fetch history each time the period changes (i.e. a new round starts)
  // and also when the socket first connects so data loads without a page reload.
  useEffect(() => {
    // Avoid re-fetching for the same period twice
    if (lastFetchedPeriodRef.current === currentPeriod) return;
    lastFetchedPeriodRef.current = currentPeriod;
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPeriod]);

  // Also re-fetch when socket first connects (covers the "no reload" case)
  useEffect(() => {
    if (!isConnected) return;
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // Prepend new result in real-time (one by one) when a 1m game result arrives
  useEffect(() => {
    lastGamesRef.current = lastGames;
    winningHistoryRef.current = winningHistory;
    const last1m = lastGames["1m_game"];
    if (
      last1m?.winningNumber != null &&
      last1m.period &&
      last1m.period !== lastSeenPeriodRef.current &&
      typeof last1m.winningNumber === 'number' // Ensure valid number
    ) {
      lastSeenPeriodRef.current = last1m.period;
      const newItem: HistoryItem = {
        period: last1m.period,
        scheduledAt: last1m.scheduledAt || new Date().toISOString(),
        result: {
          number: last1m.winningNumber,
          color: last1m.winningColor || [],
          size: last1m.winningSize || null,
        },
      };
      // Check if this item already exists in current history to avoid duplicates
      setWinningHistory((prev) => {
        const exists = prev.some(item => item.period === newItem.period);
        if (exists) return prev;
        return [newItem, ...prev].slice(0, 4);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastGames]);

  // Safety timeout for loading state
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  // Find active round on currentRounds update
  useEffect(() => {
    if (currentRounds.length === 0) return;

    const foundRound = findActiveRound(currentRounds);
    if (foundRound) {
      setGame(foundRound);
    } else {
      setGame((prev) => prev ?? buildFallbackRound());
    }
    setLoading(false);
  }, [currentRounds]);

  // Show popup ONLY when game:result arrives for this user (they placed a bet).
  // userBetResults is a separate state never overwritten by current:rounds, so no race condition.
  useEffect(() => {
    if (!userBetResults) return;
    
    // Get already shown periods from localStorage
    const shownPeriodsKey = 'shownResultPeriods_1m';
    const shownPeriods = JSON.parse(localStorage.getItem(shownPeriodsKey) || '[]');
    
    // Find the most recent result this user hasn't seen yet
    const entry = Object.values(userBetResults).find(
      (r) => r.period.startsWith("1m-") && r.result && 
      !shownPeriods.includes(r.period) && // Check localStorage
      (!resultPopup || resultPopup.period !== r.period) // Don't show if already showing for this period
    );
    if (!entry) return;
    
    // STRICT VALIDATION: Only show popup if it's for the current active round
    // This prevents showing results for previous rounds when switching tabs
    const currentRealTimePeriod = getCurrentPeriodId();
    if (entry.period !== currentRealTimePeriod) {
      // This result is for a previous round that has ended
      // Mark it as shown to prevent future attempts
      const updatedShownPeriods = [...shownPeriods, entry.period];
      localStorage.setItem(shownPeriodsKey, JSON.stringify(updatedShownPeriods));
      return;
    }
    
    // Mark this period as shown in localStorage
    const updatedShownPeriods = [...shownPeriods, entry.period];
    // Keep only last 10 periods to prevent localStorage bloat
    if (updatedShownPeriods.length > 10) {
      updatedShownPeriods.splice(0, updatedShownPeriods.length - 10);
    }
    localStorage.setItem(shownPeriodsKey, JSON.stringify(updatedShownPeriods));
    resultToastShownForPeriodRef.current = entry.period;
    // Also get winning number from lastGames if not included in game:result
    const info = lastGames["1m_game"];
    const winningNumber = entry.winningNumber ?? info?.winningNumber ?? null;
    const winningColor = entry.winningColor?.length ? entry.winningColor : (info?.winningColor ?? []);
    const winningSize = entry.winningSize ?? info?.winningSize ?? null;
    if (winningNumber == null) return;
    setResultPopup({
      period: entry.period,
      number: winningNumber,
      colors: winningColor,
      size: winningSize,
      outcome: entry.result,
      winnings: entry.winnings ?? 0,
    });
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setResultPopup(null);
    }, 5000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userBetResults, lastGames, resultPopup]);

  useEffect(() => {
    function updateTimer() {
      const remaining = getRemainingSeconds(game);
      setTimer(remaining);

      if (remaining <= 1) {
        const nowMs = Date.now();

        if (isConnected && nowMs - lastRoundSyncAtRef.current > 4000) {
          lastRoundSyncAtRef.current = nowMs;
          socket?.emit("get:rounds");
        }

        const currentPeriodId = getCurrentPeriodId();
        setGame((prev) => {
          if (!prev) return buildFallbackRound();
          if (prev.period !== currentPeriodId) {
            return buildFallbackRound();
          }
          return prev;
        });
      }
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => {
      clearInterval(timerInterval);
    };
  }, [game, isConnected, socket]);

  // Cleanup popup timer on component unmount
  useEffect(() => {
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    socket?.emit("get:rounds");
    const syncInterval = setInterval(() => {
      socket?.emit("get:rounds");
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [isConnected, socket]);

  const disabled = timer <= 30;
  const hasSelection = selected.type !== null && selected.value !== null;

  const placeBet = async (betAmount: number) => {
    if (!game || !selected.type || selected.value == null || !betAmount) {
      if (betMsgTimerRef.current) clearTimeout(betMsgTimerRef.current);
      setBetMsg({ text: "Please make a selection and enter a valid bet amount.", ok: false });
      betMsgTimerRef.current = setTimeout(() => setBetMsg(null), 3000);
      return;
    }

    let betType: string = "color";
    if (selected.type === "number") betType = "number";
    else if (selected.type === "color") betType = "color";
    else if (selected.type === "size") betType = "size";

    const payload = {
      period: game.period,
      betAmount,
      betType,
      betValue:
        selected.type === "size" && typeof selected.value === "string"
          ? selected.value.toLowerCase()
          : selected.value,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const res = await fetch(`${API_BASE_URL}/api/game/bet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to place bet");
      }

      const data = await res.json();
      if (betMsgTimerRef.current) clearTimeout(betMsgTimerRef.current);
      setBetMsg({ text: data.message || "Bet placed successfully", ok: true });
      betMsgTimerRef.current = setTimeout(() => setBetMsg(null), 3000);
      setIsModalOpen(false);
      setSelected({ type: null, value: null });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (betMsgTimerRef.current) clearTimeout(betMsgTimerRef.current);
        setBetMsg({ text: error.message || "Error placing bet", ok: false });
        betMsgTimerRef.current = setTimeout(() => setBetMsg(null), 3000);
      } else {
        if (betMsgTimerRef.current) clearTimeout(betMsgTimerRef.current);
        setBetMsg({ text: "Error placing bet", ok: false });
        betMsgTimerRef.current = setTimeout(() => setBetMsg(null), 3000);
      }
    }
  };

  const handleSelect = (type: BetSelection["type"], value: string | number) => {
    if (disabled) return;
    setSelected((s) =>
      s.type === type && s.value === value
        ? { type: null, value: null }
        : { type, value },
    );
  };

  const handlePlaceBetClick = () => setIsModalOpen(true);
  const handleModalCancel = () => setIsModalOpen(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
        <span className="ml-2 text-white">Loading game data...</span>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        {isConnected
          ? "Waiting for next round..."
          : "Reconnecting... showing the next round when available."}
      </div>
    );
  }

  const { period } = game;
  const colors = ["Green", "Violet", "Red"] as const;
  const numbers = Array.from({ length: 10 }, (_, i) => i);

  return (
    <>
      <div className="relative">
        {/* Overlay for last 30 seconds */}
        {disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg z-[55] flex items-center justify-center pointer-events-none">
            {timer <= 5 && timer > 0 && (
              <div className="text-white text-9xl font-extrabold select-none flex justify-center items-center flex-col">
                {timer}
                <p className="text-base font-medium">
                  Please wait, for the next round to start!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Timer & Info */}
        <div className="flex justify-between items-center px-3 py-4 bg-gradient-to-b from-[#FAE59F] to-[#C4933F] rounded-lg">
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-1 border border-[#8f5206] rounded-3xl px-3 py-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 36 36"
                className="w-5 h-5 text-[#8f5206]"
                fill="currentColor"
              >
                <path d="M23.67 3H12.33C6.66 3 5.25 4.515 5.25 10.56V27.45C5.25 31.44 7.44 32.385 10.095 29.535L10.11 29.52C11.34 28.215 13.215 28.32 14.28 29.745L15.795 31.77C17.01 33.375 18.975 33.375 20.19 31.77L21.705 29.745C22.785 28.305 24.66 28.2 25.89 29.52C28.56 32.37 30.735 31.425 30.735 27.435V10.56C30.75 4.515 29.34 3 23.67 3ZM11.67 18C10.845 18 10.17 17.325 10.17 16.5C10.17 15.675 10.845 15 11.67 15C12.495 15 13.17 15.675 13.17 16.5C13.17 17.325 12.495 18 11.67 18ZM11.67 12C10.845 12 10.17 11.325 10.17 10.5C10.17 9.675 10.845 9 11.67 9C12.495 9 13.17 9.675 13.17 10.5C13.17 11.325 12.495 12 11.67 12ZM24.345 17.625H16.095C15.48 17.625 14.97 17.115 14.97 16.5C14.97 15.885 15.48 15.375 16.095 15.375H24.345C24.96 15.375 25.47 15.885 25.47 16.5C25.47 17.115 24.96 17.625 24.345 17.625ZM24.345 11.625H16.095C15.48 11.625 14.97 11.115 14.97 10.5C14.97 9.885 15.48 9.375 16.095 9.375H24.345C24.96 9.375 25.47 9.885 25.47 10.5C25.47 11.115 24.96 11.625 24.345 11.625Z" />
              </svg>

              <button className="font-light text-[#8f5206] text-sm">
                How to play
              </button>
            </div>
            <h1 className="font-light text-[#8f5206] ml-1">Win Go 1 Min</h1>

            {/* Winning number Images Last Four */}
            <div className="flex gap-1 ml-1">
              {winningHistory.length > 0 ? (
                winningHistory.map((g, idx) => (
                  <div
                    key={idx}
                    className="md:h-8 md:w-8 w-7 h-7 rounded-full overflow-hidden border border-white"
                  >
                    <Image
                      src={`/No_images/${g.result?.number}.png`}
                      alt={`Number ${g.result?.number}`}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <span className="text-white text-xs">No history yet</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-y-1">
            <h2 className="text-sm text-[#8f5206]">{currentPeriod}</h2>
            <h1 className="text-[#8f5206] font-semibold">Time Remaining</h1>
            <div className="flex items-center space-x-1">
              {(() => {
                const minutes = Math.floor(timer / 60);
                const seconds = timer % 60;
                const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                return timeString.split("").map((c, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "flex items-center justify-center h-8 w-7 font-semibold text-white ",
                      c === ":"
                        ? "bg-transparent text-black text-xl"
                        : "bg-[#333332] text-white",
                    )}
                  >
                    {c}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Color Buttons */}
        <div className="grid grid-cols-3 gap-5 justify-around my-4 px-3">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => handleSelect("color", c)}
              disabled={disabled}
              className={clsx(
                " px-5 md:px-8 py-2 rounded-2xl text-white transition",
                c === "Green"
                  ? "bg-green-600"
                  : c === "Violet"
                    ? "bg-purple-500"
                    : "bg-red-500",
                selected.type === "color" &&
                  selected.value === c &&
                  "ring-4 ring-yellow-400 scale-105",
                disabled && "opacity-60 cursor-not-allowed",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Number Grid */}
        <div className="grid grid-cols-5 gap-2 xs:gap-2 sm:gap-3 md:gap-4 px-1 xs:px-2">
          {numbers.map((n) => (
            <button
              key={n}
              onClick={() => handleSelect("number", n)}
              disabled={disabled}
              className={clsx(
                "aspect-square w-full max-w-12 xs:max-w-14 sm:max-w-16 md:max-w-18 mx-auto rounded-full overflow-hidden transition flex items-center justify-center",
                selected.type === "number" &&
                  selected.value === n &&
                  "ring-4 ring-yellow-400 scale-105",
                disabled && "opacity-60 cursor-not-allowed",
              )}
            >
              <Image
                src={`/No_images/${n}.png`}
                alt={`Number ${n}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Big/Small */}
        <div className="flex my-6 px-3">
          {(["Big", "Small"] as const).map((bs) => (
            <button
              key={bs}
              onClick={() => handleSelect("size", bs)}
              disabled={disabled}
              className={clsx(
                "w-1/2 py-3 text-white transition",
                bs === "Big"
                  ? "bg-[#dd9138] rounded-l-3xl"
                  : "bg-blue-500 rounded-r-3xl",
                selected.type === "size" &&
                  selected.value === bs &&
                  "ring-4 ring-yellow-400 scale-105",
                disabled && "opacity-60 cursor-not-allowed",
              )}
            >
              {bs}
            </button>
          ))}
        </div>

        <PlaceBetButton
          onClick={handlePlaceBetClick}
          disabled={disabled}
          hasSelection={hasSelection}
        />

        <PlaceBetModel
          onConfirm={placeBet}
          isOpen={isModalOpen}
          onClose={handleModalCancel}
          selectedBet={selected}
          gamePeriod={game.period}
          disabled={disabled}
        />
      </div>

      <div className="mt-8 border-t border-[#C4933F] pt-4">
        <GameHistory1 />
      </div>

      {/* Bet message banner */}
      {betMsg && (
        <>
          <style>{`@keyframes bet-msg-in { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          <div
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[9998] w-max max-w-[300px] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg text-center"
            style={{ background: betMsg.ok ? "#22c55e" : "#ef4444", animation: "bet-msg-in 0.25s ease" }}
          >
            {betMsg.text}
          </div>
        </>
      )}

      {/* Previous round result popup */}
      {resultPopup && (
        <>
          <style>{`
            @keyframes result-popup-in {
              from { opacity: 0; transform: scale(0.75) translateY(24px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes progress-shrink {
              from { width: 100%; }
              to   { width: 0%; }
            }
          `}</style>
          <div
            key={resultPopup.period}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={() => {
              if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
              setResultPopup(null);
            }}
          >
            <div
              className="relative w-[300px] mx-4 rounded-3xl overflow-hidden shadow-2xl"
              style={{ animation: "result-popup-in 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* coral gradient header */}
              <div className={`flex flex-col items-center pt-5 pb-8 px-6 ${
                resultPopup.outcome === "won" ? "bg-gradient-to-b from-[#22c55e] to-[#16a34a]" :
                resultPopup.outcome === "lost" ? "bg-gradient-to-b from-[#ef4444] to-[#b91c1c]" :
                "bg-gradient-to-b from-[#FF6B35] to-[#FF4E4E]"
              }`}>
                {/* medal coin */}
                <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-3"
                  style={{ background: "radial-gradient(circle at 35% 35%, #FFE566, #FFA500 60%, #e07b00)" }}
                >
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <circle cx="22" cy="22" r="18" fill="rgba(255,255,255,0.15)"/>
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fill="white">
                      {resultPopup.outcome === "won" ? "🏆" : resultPopup.outcome === "lost" ? "😔" : "🎯"}
                    </text>
                  </svg>
                </div>
                <h2 className="text-white text-2xl font-extrabold tracking-wide drop-shadow">
                  {resultPopup.outcome === "won" ? "You won this round" : resultPopup.outcome === "lost" ? "You lost this round" : "Lottery Results"}
                </h2>
                {/* win/loss amount */}
                {resultPopup.outcome === "won" && resultPopup.winnings > 0 && (
                  <div className="mt-2 bg-white bg-opacity-20 rounded-xl px-5 py-2 flex flex-col items-center">
                    <span className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">Bonus</span>
                    <span className="text-white text-3xl font-extrabold">₹{resultPopup.winnings.toFixed(2)}</span>
                  </div>
                )}
                {/* result row */}
                <div className="flex gap-2 flex-wrap justify-center items-center mt-4">
                  {resultPopup.colors.map((color, i) => (
                    <span
                      key={i}
                      className={clsx(
                        "px-3 py-1 rounded-full text-white text-sm font-bold capitalize shadow",
                        color.toLowerCase() === "green" ? "bg-green-500" :
                        color.toLowerCase() === "red" ? "bg-red-600" :
                        color.toLowerCase() === "violet" ? "bg-violet-600" : "bg-gray-500",
                      )}
                    >
                      {color}
                    </span>
                  ))}
                  <span className="bg-white bg-opacity-25 text-white px-3 py-1 rounded-full text-sm font-bold shadow">
                    {resultPopup.number}
                  </span>
                  {resultPopup.size && (
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-white text-sm font-bold capitalize shadow",
                      resultPopup.size.toLowerCase() === "big" ? "bg-orange-400" : "bg-blue-500",
                    )}>
                      {resultPopup.size}
                    </span>
                  )}
                </div>
              </div>

              {/* white bottom section */}
              <div className="bg-white flex flex-col items-center py-5 px-6 gap-3">
                <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-orange-400 shadow-md">
                  <Image
                    src={`/No_images/${resultPopup.number}.png`}
                    alt={`${resultPopup.number}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-gray-400 text-[10px] uppercase tracking-widest">Period</span>
                  <span className="text-gray-700 text-xs font-semibold">{resultPopup.period}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">Winning Number:</span>
                  <span className="text-gray-800 text-sm font-bold">{resultPopup.number}</span>
                </div>
                <p className="text-gray-400 text-xs flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  5 seconds auto close
                </p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #FF6B35, #FF4E4E)",
                      animation: "progress-shrink 5s linear forwards",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
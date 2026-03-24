// Place a bet API integrated

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useSocket } from "@/contexts/SocketContext";
import PlaceBetButton from "@/Components/Games/PlaceBetButton";
import PlaceBetModel from "@/Components/Games/PlaceBetModel";
import GameHistory3 from "@/Components/Games/Gamehistory3";
import GamesResultModel from "@/Components/Games/GamesResultModel";

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

const ROUND_DURATION = 180;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://ctbackend.crobstacle.com";

function buildFallbackRound(): GameData {
  const now = new Date();
  const elapsedSeconds = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % ROUND_DURATION;
  const remainingSeconds = ROUND_DURATION - elapsedSeconds;
  const scheduledAt = new Date(now.getTime() + remainingSeconds * 1000).toISOString();
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
  return !["completed", "finalized", "closed", "cancelled", "resulted"].includes(normalized);
}

function findActiveRound(games: GameData[]) {
  const currentPeriodId = getCurrentPeriodId();
  let foundRound = games.find((r) => r.period === currentPeriodId && isOpenRound(r.status));
  if (!foundRound) foundRound = games.find((r) => r.period.startsWith("3m-") && isOpenRound(r.status));
  return foundRound || null;
}

function Loader() {
  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce"></div>
      <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce200"></div>
      <div className="w-4 h-4 rounded-full bg-green-600 animate-bounce400"></div>
      <style jsx>{`
        .animate-bounce200 { animation: bounce 1.4s infinite; animation-delay: 0.2s; }
        .animate-bounce400 { animation: bounce 1.4s infinite; animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

function pad2(num: number) { return num.toString().padStart(2, "0"); }

function getCurrentPeriodId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad2(now.getMonth() + 1);
  const day = pad2(now.getDate());
  const hour = pad2(now.getHours());
  const minutes = Math.floor(now.getMinutes() / 3) * 3;
  return `3m-${year}${month}${day}-${hour}${pad2(minutes)}`;
}

function parsePeriodId(periodId: string): number | null {
  try {
    const match = periodId.match(/^\d+m-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})$/);
    if (!match) return null;
    const [, year, month, day, hour, minute] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)).getTime();
  } catch {
    return null;
  }
}

export default function Min3Game2() {
  const { socket, currentRounds, isConnected, lastGames, userBetResults } = useSocket();

  const [game, setGame] = useState<GameData | null>(null);
  const [timer, setTimer] = useState(ROUND_DURATION);
  const [selected, setSelected] = useState<BetSelection>({ type: null, value: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriodId());

  type HistoryItem = {
    period: string;
    scheduledAt: string;
    result: { number: number | null; color: string[]; size: string | null } | null;
  };

  const [winningHistory, setWinningHistory] = useState<HistoryItem[]>([]);
  const [resultPopup, setResultPopup] = useState<{
    period: string;
    number: number;
    colors: string[];
    size: string | null;
    outcome: string | null;
    winnings: number;
  } | null>(null);
  const [betMsg, setBetMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const lastRoundSyncAtRef = useRef(0);
  const lastSeenPeriodRef = useRef<string | null>(null);
  const lastFetchedPeriodRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const betMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGamesRef = useRef(lastGames);
  const userBetResultsRef = useRef(userBetResults);
  const winningHistoryRef = useRef<HistoryItem[]>([]);
  const userBetPeriodsRef = useRef<Set<string>>(new Set());

  // Use a Set with localStorage persistence to prevent duplicate popups across page refreshes
  const getStoredShownPeriods = (): Set<string> => {
    try {
      const stored = localStorage.getItem('shownPeriods_3m');
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  };
  
  const saveShownPeriods = (periods: Set<string>) => {
    try {
      localStorage.setItem('shownPeriods_3m', JSON.stringify(Array.from(periods)));
    } catch {
      // Silently ignore localStorage errors
    }
  };
  
  const initializeShownPeriods = () => {
    const storedPeriods = getStoredShownPeriods();
    const userBetPeriods = Object.keys(userBetResults).filter((p) => p < getCurrentPeriodId());
    userBetPeriods.forEach(period => storedPeriods.add(period));
    return storedPeriods;
  };
  
  const resultShownPeriodsRef = useRef<Set<string>>(initializeShownPeriods());

  // Period ticker — also closes popup when period rolls over
  useEffect(() => {
    const interval = setInterval(() => {
      const newPeriod = getCurrentPeriodId();
      setCurrentPeriod((prev) => {
        if (prev !== newPeriod) {
          if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
          setResultPopup(null);
        }
        return newPeriod;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const showPopup = (
    period: string, number: number, colors: string[],
    size: string | null, outcome: string | null, winnings: number
  ) => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setResultPopup({ period, number, colors, size, outcome, winnings });
    popupTimerRef.current = setTimeout(() => setResultPopup(null), 5000);
  };

  // tryShowPopup: guarded by Set — fires at most once per period, ever.
  // Only show popups for 3-minute game periods and only if period hasn't expired
  const tryShowPopup = (period: string, forceShow: boolean = false) => {
    if (resultShownPeriodsRef.current.has(period)) return;
    
    // Only show popups for 3m game periods
    if (!period.startsWith('3m-')) return;
    
    // Don't show popups for periods that are too old (more than 10 minutes old)
    const periodTime = parsePeriodId(period);
    if (periodTime && Date.now() - periodTime > 10 * 60 * 1000) return;

    const userEntry = userBetResultsRef.current[period];
    const userPlacedBet = userBetPeriodsRef.current.has(period);
    if (!userPlacedBet) return;

    const last3m = lastGamesRef.current["3m_game"];
    const hasUserWinData = userEntry?.winningNumber != null;
    const hasLastGamesData = last3m?.period === period && last3m?.winningNumber != null;

    if (!hasUserWinData && !hasLastGamesData) return;

    const winNum = hasUserWinData ? userEntry!.winningNumber! : last3m!.winningNumber!;
    const winColors = hasUserWinData ? (userEntry!.winningColor ?? []) : (last3m!.winningColor ?? []);
    const winSize = hasUserWinData ? (userEntry!.winningSize ?? null) : (last3m!.winningSize ?? null);
    const outcome = userEntry?.result ?? null;

    // Only show popup if we have complete outcome info (won/lost) OR if forced (timer)
    if (!forceShow && !outcome) return;

    resultShownPeriodsRef.current.add(period);
    saveShownPeriods(resultShownPeriodsRef.current);
    showPopup(period, winNum, winColors, winSize, outcome, userEntry?.winnings ?? 0);
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No authentication token found for game history");
        return;
      }
      
      const res = await fetch(
        `${API_BASE_URL}/api/game/history?status=completed&page=1&limit=10&duration=3m`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      
      if (!res.ok) {
        if (res.status === 401) {
          console.warn("Authentication failed for game history - token may be expired");
          // Could redirect to login or show auth error here
        } else {
          console.warn(`Failed to fetch game history: ${res.status} ${res.statusText}`);
        }
        return;
      }
      
      const apiData = await res.json();

      let allGames: HistoryItem[] = [];
      if (Array.isArray(apiData?.data?.data)) allGames = apiData.data.data as HistoryItem[];
      else if (Array.isArray(apiData?.data)) allGames = apiData.data as HistoryItem[];
      else if (Array.isArray(apiData)) allGames = apiData as HistoryItem[];

      const last4 = allGames
        .slice()
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .filter((g) => g.result?.number != null)
        .slice(0, 4);

      const last3m = lastGames["3m_game"];
      if (last3m?.winningNumber != null && last3m.period) {
        const realtimeItem: HistoryItem = {
          period: last3m.period,
          scheduledAt: last3m.scheduledAt || new Date().toISOString(),
          result: { number: last3m.winningNumber, color: last3m.winningColor || [], size: last3m.winningSize || null },
        };
        const filteredLast4 = last4.filter((item) => item.period !== realtimeItem.period);
        setWinningHistory([realtimeItem, ...filteredLast4].slice(0, 4));
        lastSeenPeriodRef.current = realtimeItem.period;
      } else {
        setWinningHistory(last4);
        if (last4.length > 0) lastSeenPeriodRef.current = last4[0].period;
      }
    } catch (error) {
      console.warn("Error fetching game history:", error);
    }
  };

  const getRemainingSeconds = (round: GameData | null) => {
    if (round?.scheduledAt) {
      const normalized = round.scheduledAt.replace(" ", "T");
      const startMs = new Date(normalized).getTime();
      if (!Number.isNaN(startMs)) {
        const deadlineMs = startMs + (round.gameDuration || ROUND_DURATION) * 1000;
        return Math.max(0, Math.min(Math.ceil((deadlineMs - Date.now()) / 1000), ROUND_DURATION));
      }
    }
    const now = new Date();
    const elapsed = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % ROUND_DURATION;
    return ROUND_DURATION - elapsed;
  };

  useEffect(() => { fetchHistory(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { winningHistoryRef.current = winningHistory; }, [winningHistory]);

  useEffect(() => {
    if (lastFetchedPeriodRef.current === currentPeriod) return;
    lastFetchedPeriodRef.current = currentPeriod;
    fetchHistory();
  }, [currentPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isConnected) return;
    fetchHistory();
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Sync lastGames ref + update history balls + try popup ───────────────
  useEffect(() => {
    lastGamesRef.current = lastGames;
    winningHistoryRef.current = winningHistory;
    const last3m = lastGames["3m_game"];
    if (!last3m?.period || last3m.winningNumber == null || typeof last3m.winningNumber !== "number") return;

    // On first mount: init refs only, never show popup for already-completed round
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      resultShownPeriodsRef.current.add(last3m.period);
      saveShownPeriods(resultShownPeriodsRef.current);
      lastSeenPeriodRef.current = last3m.period;
      return;
    }

    if (last3m.period !== lastSeenPeriodRef.current) {
      lastSeenPeriodRef.current = last3m.period;
      const newItem: HistoryItem = {
        period: last3m.period,
        scheduledAt: last3m.scheduledAt || new Date().toISOString(),
        result: { number: last3m.winningNumber, color: last3m.winningColor || [], size: last3m.winningSize || null },
      };
      setWinningHistory((prev) => {
        if (prev.some((item) => item.period === newItem.period)) return prev;
        return [newItem, ...prev].slice(0, 4);
      });
    }

    // Removed: tryShowPopup(last3m.period) to prevent duplicate popups
  }, [lastGames]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── userBetResults: show both winning and losing popups immediately with complete data ─────
  // resultShownPeriodsRef is a Set — even if this effect fires 10 times for the
  // same period, the popup only shows once.
  useEffect(() => {
    userBetResultsRef.current = userBetResults;

    // Patch outcome/winnings on a popup already visible
    setResultPopup((prev) => {
      if (!prev) return null;
      const entry = userBetResults[prev.period];
      if (!entry) return prev;
      if (prev.outcome === entry.result && prev.winnings === entry.winnings) return prev;
      return { ...prev, outcome: entry.result, winnings: entry.winnings };
    });

    // Show popups immediately when complete results arrive (won or lost)
    for (const [period, entry] of Object.entries(userBetResults)) {
      if (
        (entry.result === "won" || entry.result === "lost") &&
        !resultShownPeriodsRef.current.has(period) &&
        userBetPeriodsRef.current.has(period) // Only if user placed bet
      ) {
        tryShowPopup(period); // Show with complete outcome data
        break; // show only the most recent unshown result
      }
    }
  }, [userBetResults]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (currentRounds.length === 0) return;
    const foundRound = findActiveRound(currentRounds);
    if (foundRound) setGame(foundRound);
    else setGame((prev) => prev ?? buildFallbackRound());
    setLoading(false);
  }, [currentRounds]);

  // ─── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    function updateTimer() {
      const remaining = getRemainingSeconds(game);
      setTimer(remaining);

      // Show losing popup 10 seconds before period ends (only if bet placed)
      if (remaining <= 10 && remaining > 0 && game) {
        const userEntry = userBetResultsRef.current?.[game.period];
        const userPlacedBet = userBetPeriodsRef.current.has(game.period);
        
        if (
          userPlacedBet &&
          !resultShownPeriodsRef.current.has(game.period)
        ) {
          const info = lastGamesRef.current["3m_game"];
          if (
            info?.winningNumber != null &&
            typeof info.winningNumber === "number" &&
            info.period === game.period
          ) {
            // Only show if we have a definitive loss OR no result yet (assume loss)
            if (!userEntry || userEntry.result === "lost") {
              // Force show as lost if no result yet
              const finalOutcome = userEntry?.result || "lost";
              resultShownPeriodsRef.current.add(game.period);
              saveShownPeriods(resultShownPeriodsRef.current);
              showPopup(game.period, info.winningNumber, info.winningColor || [], info.winningSize || null, finalOutcome, userEntry?.winnings || 0);
            }
          }
        }
      }

      if (remaining <= 1) {
        const nowMs = Date.now();
        if (isConnected && nowMs - lastRoundSyncAtRef.current > 4000) {
          lastRoundSyncAtRef.current = nowMs;
          socket?.emit("get:rounds");
        }
        const newPeriod = getCurrentPeriodId();
        setGame((prev) => {
          if (!prev) return buildFallbackRound();
          if (prev.period !== newPeriod) return buildFallbackRound();
          return prev;
        });
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isConnected, socket]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (popupTimerRef.current) clearTimeout(popupTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    socket?.emit("get:rounds");
    const syncInterval = setInterval(() => { socket?.emit("get:rounds"); }, 5000);
    return () => clearInterval(syncInterval);
  }, [isConnected, socket]);

  const disabled = timer <= 15;
  const hasSelection = selected.type !== null && selected.value !== null;

  const placeBet = async (amount: number) => {
    if (!game) {
      if (betMsgTimerRef.current) clearTimeout(betMsgTimerRef.current);
      setBetMsg({ text: "No active game found", ok: false });
      betMsgTimerRef.current = setTimeout(() => setBetMsg(null), 3000);
      return;
    }
    if (!selected.type || selected.value == null) {
      if (betMsgTimerRef.current) clearTimeout(betMsgTimerRef.current);
      setBetMsg({ text: "Please make a selection!", ok: false });
      betMsgTimerRef.current = setTimeout(() => setBetMsg(null), 3000);
      return;
    }
    const payload = {
      period: game.period,
      betAmount: amount,
      betType: selected.type,
      betValue: selected.type === "size" && typeof selected.value === "string"
        ? selected.value.toLowerCase() : selected.value,
    };
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");
      const res = await fetch(`${API_BASE_URL}/api/game/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Bet placement failed");
      }
      await res.json();
      if (betMsgTimerRef.current) clearTimeout(betMsgTimerRef.current);
      setBetMsg({ text: "Bet placed successfully", ok: true });
      betMsgTimerRef.current = setTimeout(() => setBetMsg(null), 3000);
      userBetPeriodsRef.current.add(game.period);
      setIsModalOpen(false);
      setSelected({ type: null, value: null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      if (betMsgTimerRef.current) clearTimeout(betMsgTimerRef.current);
      setBetMsg({ text: msg, ok: false });
      betMsgTimerRef.current = setTimeout(() => setBetMsg(null), 3000);
    }
  };

  const handleSelect = (type: BetSelection["type"], value: string | number) => {
    if (disabled) return;
    setSelected((s) => s.type === type && s.value === value ? { type: null, value: null } : { type, value });
  };

  const handlePlaceBetClick = () => setIsModalOpen(true);

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
        {isConnected ? "Waiting for next round..." : "Reconnecting... showing the next round when available."}
      </div>
    );
  }

  const { period } = game;
  const colors = ["Green", "Violet", "Red"] as const;
  const numbers = Array.from({ length: 10 }, (_, i) => i);
  const sizeOptions = ["big", "small"] as const;

  return (
    <>
      <div className="relative">
        {disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg z-[55] flex items-center justify-center pointer-events-none">
            {timer <= 5 && timer > 0 && (
              <div className="text-white text-9xl font-extrabold select-none flex justify-center items-center flex-col">
                {timer}
                <p className="text-base font-medium">Please wait, for the next round to start!</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center px-2 2xs:px-3 py-3 2xs:py-4 bg-gradient-to-b from-[#FAE59F] to-[#C4933F] rounded-lg">
          <div className="flex flex-col gap-1 2xs:gap-2">
            <div className="flex items-center space-x-1 border border-[#8f5206] rounded-3xl px-2 2xs:px-3 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="w-4 2xs:w-5 h-4 2xs:h-5 text-[#8f5206]" fill="currentColor">
                <path d="M23.67 3H12.33C6.66 3 5.25 4.515 5.25 10.56V27.45C5.25 31.44 7.44 32.385 10.095 29.535L10.11 29.52C11.34 28.215 13.215 28.32 14.28 29.745L15.795 31.77C17.01 33.375 18.975 33.375 20.19 31.77L21.705 29.745C22.785 28.305 24.66 28.2 25.89 29.52C28.56 32.37 30.735 31.425 30.735 27.435V10.56C30.75 4.515 29.34 3 23.67 3ZM11.67 18C10.845 18 10.17 17.325 10.17 16.5C10.17 15.675 10.845 15 11.67 15C12.495 15 13.17 15.675 13.17 16.5C13.17 17.325 12.495 18 11.67 18ZM11.67 12C10.845 12 10.17 11.325 10.17 10.5C10.17 9.675 10.845 9 11.67 9C12.495 9 13.17 9.675 13.17 10.5C13.17 11.325 12.495 12 11.67 12ZM24.345 17.625H16.095C15.48 17.625 14.97 17.115 14.97 16.5C14.97 15.885 15.48 15.375 16.095 15.375H24.345C24.96 15.375 25.47 15.885 25.47 16.5C25.47 17.115 24.96 17.625 24.345 17.625ZM24.345 11.625H16.095C15.48 11.625 14.97 11.115 14.97 10.5C14.97 9.885 15.48 9.375 16.095 9.375H24.345C24.96 9.375 25.47 9.885 25.47 10.5C25.47 11.115 24.96 11.625 24.345 11.625Z" />
              </svg>
              <button className="text-xs 2xs:text-sm text-[#8f5206]">How to play</button>
            </div>
            <h1 className="text-[#8f5206] font-light ml-1 text-sm 2xs:text-base">Win Go 3 Min</h1>
            <div className="flex gap-1 ml-1">
              {winningHistory.length > 0 ? (
                winningHistory.map((g, idx) => (
                  <div key={idx} className="w-6 h-6 2xs:w-7 2xs:h-7 md:h-8 md:w-8 rounded-full overflow-hidden border border-white">
                    <Image src={`/No_images/${g.result?.number}.png`} alt={`Number ${g.result?.number}`} width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                ))
              ) : (
                <span className="text-white text-xs">No history yet</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-y-1">
            <h2 className="text-xs 2xs:text-sm text-[#8f5206] text-center leading-tight break-all max-w-[100px] 2xs:max-w-none">{currentPeriod}</h2>
            <h1 className="text-[#8f5206] font-semibold text-xs 2xs:text-sm text-center leading-tight">Time Remaining</h1>
            <div className="flex items-center space-x-0.5 2xs:space-x-1">
              {(() => {
                const minutes = Math.floor(timer / 60);
                const seconds = timer % 60;
                const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                return timeString.split("").map((c, i) => (
                  <div key={i} className={clsx("flex items-center justify-center h-6 w-5 2xs:h-8 2xs:w-7 text-sm 2xs:text-base font-semibold", c === ":" ? "bg-transparent text-black text-lg 2xs:text-xl" : "bg-[#333332] text-white")}>{c}</div>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 justify-around my-4 px-3">
          {colors.map((c) => (
            <button key={c} onClick={() => handleSelect("color", c)} disabled={disabled}
              className={clsx("px-5 md:px-8 py-2 rounded-2xl text-white transition", c === "Green" ? "bg-green-600" : c === "Violet" ? "bg-purple-500" : "bg-red-500", selected.type === "color" && selected.value === c && "ring-4 ring-yellow-400 scale-105", disabled && "opacity-60 cursor-not-allowed")}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-1 2xs:gap-2 xs:gap-2 sm:gap-3 md:gap-4 px-1 xs:px-2">
          {numbers.map((n) => (
            <button key={n} onClick={() => handleSelect("number", n)} disabled={disabled}
              className={clsx("aspect-square w-full max-w-10 2xs:max-w-12 xs:max-w-14 sm:max-w-16 md:max-w-18 mx-auto rounded-full overflow-hidden transition flex items-center justify-center", selected.type === "number" && selected.value === n && "ring-4 ring-yellow-400 scale-105", disabled && "opacity-60 cursor-not-allowed")}>
              <Image src={`/No_images/${n}.png`} alt={`Number ${n}`} width={80} height={80} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="flex my-6 px-3">
          {sizeOptions.map((bs) => (
            <button key={bs} onClick={() => handleSelect("size", bs)} disabled={disabled}
              className={clsx("w-1/2 py-3 text-white transition", bs === "big" ? "bg-orange-500 rounded-l-3xl" : "bg-blue-500 rounded-r-3xl", selected.type === "size" && selected.value === bs && "ring-4 ring-yellow-400 scale-105", disabled && "opacity-60 cursor-not-allowed")}>
              {bs}
            </button>
          ))}
        </div>

        <PlaceBetButton onClick={handlePlaceBetClick} disabled={disabled} hasSelection={hasSelection} />
        <PlaceBetModel onConfirm={placeBet} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedBet={selected} gamePeriod={period} disabled={disabled} />
      </div>

      <div className="mt-8 border-t border-[#c4933f] pt-4">
        <GameHistory3 />
      </div>

      {betMsg && (
        <>
          <style>{`@keyframes bet-msg-in { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9998] w-max max-w-[300px] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg text-center"
            style={{ background: betMsg.ok ? "#22c55e" : "#ef4444", animation: "bet-msg-in 0.25s ease" }}>
            {betMsg.text}
          </div>
        </>
      )}

      <GamesResultModel
        resultPopup={resultPopup}
        onClose={() => {
          if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
          setResultPopup(null);
        }}
      />
    </>
  );
}
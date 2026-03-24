"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

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

interface LastGameInfo {
  scheduledAt: string;
  period: string;
  winningNumber: number | null;
  winningColor: string[];
  winningSize: string | null;
  mySelection: null;
  myWinnings: number;
  result: string;
}

export interface UserBetResult {
  period: string;
  result: string;        // "won" | "lost"
  winnings: number;
  winningNumber: number | null;
  winningColor: string[];
  winningSize: string | null;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  balance: number | null;
  currentRounds: GameData[];
  lastGames: Record<string, LastGameInfo>;
  userBetResults: Record<string, UserBetResult>;
  token: string | null;
  updateBalance: (newBalance: number) => void;
  refreshBalance: () => void;
  refreshRounds: () => void;
  onTokenChange: (token: string | null) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  balance: null,
  currentRounds: [],
  lastGames: {},
  userBetResults: {},
  token: null,
  updateBalance: () => {},
  refreshBalance: () => {},
  refreshRounds: () => {},
  onTokenChange: () => {},
});

function periodToKey(period: string): string | null {
  if (period.startsWith("1m-")) return "1m_game";
  if (period.startsWith("3m-")) return "3m_game";
  if (period.startsWith("5m-")) return "5m_game";
  return null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [currentRounds, setCurrentRounds] = useState<GameData[]>([]);
  const [lastGames, setLastGames] = useState<Record<string, LastGameInfo>>({});
  const [userBetResults, setUserBetResults] = useState<Record<string, UserBetResult>>({});
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );

  const onTokenChange = (newToken: string | null) => setToken(newToken);

  useEffect(() => {
    const onStorage = () => {
      const current = localStorage.getItem("token");
      setToken(current);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ─── Prefetch-retry: mirrors the React Native implementation exactly ──────
  // Polls game/history + users/history until the DB has a completed record,
  // then writes the enriched result to userBetResults AND lastGames.
  const fetchAndShowResult = useCallback(async (raw: any) => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!storedToken || !raw?.period) return;

    let gameMatch: any = null;
    let betMatch: any = null;
    const MAX_ATTEMPTS = 8;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const [gameRes, betRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/game/history`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        }),
        fetch(`${API_BASE}/api/users/history?limit=20`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        }),
      ]);

      if (gameRes.status === "fulfilled" && gameRes.value.ok) {
        const data = await gameRes.value.json();
        const allGames: any[] = Array.isArray(data?.data?.data)
          ? data.data.data
          : Array.isArray(data?.data) ? data.data : [];

        gameMatch = allGames.find(
          (g) =>
            g?.period === raw.period &&
            (g?.status === "completed" || g?.status === "finalized")
        );
      }

      if (betRes.status === "fulfilled" && betRes.value.ok) {
        const betData = await betRes.value.json();
        const allBets: any[] = Array.isArray(betData?.data?.bets)
          ? betData.data.bets
          : Array.isArray(betData?.data?.data) ? betData.data.data
          : Array.isArray(betData?.data) ? betData.data : [];
        betMatch = allBets.find((b) => b?.period === raw.period);
      }

      // Stop as soon as we have a completed game record
      if (gameMatch) break;

      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((res) => setTimeout(res, 500));
      }
    }

    // Outcome: bet history is ground truth; fall back to raw socket payload
    const outcome =
      betMatch?.status === "won" ? "won" :
      betMatch?.status === "lost" ? "lost" :
      raw.status ?? raw.result ?? "lost";

    const winningNumber =
      gameMatch?.result?.number ??
      gameMatch?.number ??
      gameMatch?.winningNumber ??
      raw.winningNumber ??
      null;

    const winningColor =
      gameMatch?.result?.color ?? gameMatch?.color ?? raw.winningColor ?? [];

    const winningSize =
      gameMatch?.result?.size ?? gameMatch?.size ?? raw.winningSize ?? null;

    const enriched: UserBetResult = {
      period: raw.period,
      result: outcome,
      winnings: betMatch?.winnings ?? raw.winnings ?? 0,
      winningNumber,
      winningColor,
      winningSize,
    };

    // 1. Write to userBetResults — this is what game pages watch for popup trigger
    setUserBetResults((prev) => ({ ...prev, [raw.period]: enriched }));

    // 2. Also sync lastGames so history balls update even in admin flow
    const key = periodToKey(raw.period);
    if (key && winningNumber !== null) {
      setLastGames((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] ?? {}),
          period: raw.period,
          winningNumber,
          winningColor,
          winningSize,
          scheduledAt: prev[key]?.scheduledAt ?? new Date().toISOString(),
          mySelection: null,
          myWinnings: enriched.winnings,
          result: outcome,
        },
      }));
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!token) {
      if (socket) { socket.disconnect(); setSocket(null); }
      setIsConnected(false);
      return;
    }

    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL || "https://ctbackend.crobstacle.com";

    const socketInstance = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 15000,
    });

    setSocket(socketInstance);

    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

    socketInstance.on("connect", () => {
      setIsConnected(true);
      socketInstance.emit("get:balance");
      socketInstance.emit("get:rounds");

      heartbeatInterval = setInterval(() => {
        socketInstance.emit("get:rounds");
        socketInstance.emit("get:balance");
      }, 5000);
    });

    socketInstance.on("user:balance", (data) => {
      if (data?.balance !== undefined) setBalance(data.balance);
    });

    socketInstance.on("balance:update", (data) => {
      if (data?.balance !== undefined) setBalance(data.balance);
    });

    socketInstance.on("current:rounds", (data) => {
      if (data?.data?.games && typeof data.data.games === "object" && !Array.isArray(data.data.games)) {
        const gamesObj = data.data.games as Record<string, GameData>;
        const roundsArray = Object.values(gamesObj).filter(
          (g): g is GameData => !!g && typeof g === "object" && "period" in g
        );
        if (roundsArray.length > 0) setCurrentRounds(roundsArray);

        if (data.data.lastGames && typeof data.data.lastGames === "object") {
          setLastGames((prev) => {
            const incoming = data.data.lastGames as Record<string, LastGameInfo>;
            const merged: Record<string, LastGameInfo> = { ...prev };
            for (const [key, info] of Object.entries(incoming)) {
              const existing = prev[key];
              if (!existing?.period || !info?.period || info.period >= existing.period) {
                merged[key] = info as LastGameInfo;
              }
            }
            return merged;
          });
        }
        if (typeof data.data.walletBalance === "number") {
          setBalance(data.data.walletBalance);
        }
        return;
      }
      if (data && Array.isArray(data.rounds) && data.rounds.length > 0) {
        setCurrentRounds(data.rounds);
      }
    });

    socketInstance.on("round:created", (data) => {
      if (data && typeof data === "object" && "period" in data) {
        setCurrentRounds((prev) => {
          const next = [...prev];
          const idx = next.findIndex((r) => r.period === data.period);
          if (idx >= 0) next[idx] = data;
          else next.push(data);
          return next;
        });
      }
    });

    socketInstance.on("round:updated", (data) => {
      if (data && typeof data === "object" && "period" in data) {
        setCurrentRounds((prev) => {
          const next = [...prev];
          const idx = next.findIndex((r) => r.period === data.period);
          if (idx >= 0) next[idx] = data;
          else next.push(data);
          return next;
        });
      }
    });

    socketInstance.on("round:finalized", (data?: {
      period?: string;
      winningNumber?: number;
      winningColor?: string[];
      winningSize?: string;
    }) => {
      if (data?.period && data.winningNumber != null) {
        const key = periodToKey(data.period);
        if (key) {
          setLastGames((prev) => ({
            ...prev,
            [key]: {
              ...(prev[key] ?? {}),
              period: data.period!,
              winningNumber: data.winningNumber!,
              winningColor: data.winningColor ?? [],
              winningSize: data.winningSize ?? null,
              scheduledAt: prev[key]?.scheduledAt ?? new Date().toISOString(),
              mySelection: null,
              myWinnings: prev[key]?.myWinnings ?? 0,
              result: prev[key]?.result ?? "",
            },
          }));
        }
      }
      socketInstance.emit("get:rounds");
      socketInstance.emit("get:balance");
    });

    // ─── THE KEY FIX: game:result now uses prefetch-retry ──────────────────
    // Instead of immediately writing partial socket data to state (which caused
    // instant popups with missing winningNumber/colors), we:
    // 1. Wait 800ms for the DB to commit the result
    // 2. Poll up to 8 times (×500ms) until we get a completed game record
    // 3. Only then write the FULL enriched result to userBetResults
    // This mirrors the React Native implementation exactly.
    socketInstance.on("game:result", (data?: any) => {
      console.log("game:result received:", JSON.stringify(data));
      if (!data?.period) return;

      socketInstance.emit("get:rounds");
      socketInstance.emit("get:balance");

      // 800ms head-start lets the DB commit before first poll attempt
      setTimeout(() => {
        fetchAndShowResult(data);
      }, 800);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      if (err.message.includes("Invalid token") || err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
        setToken(null);
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      }
      setIsConnected(false);
    });

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [token, fetchAndShowResult]);

  const updateBalance = (newBalance: number) => setBalance(newBalance);
  const refreshBalance = () => { if (socket && isConnected) socket.emit("get:balance"); };
  const refreshRounds = () => { if (socket && isConnected) socket.emit("get:rounds"); };

  return (
    <SocketContext.Provider value={{
      socket, isConnected, token, balance, currentRounds,
      lastGames, userBetResults, updateBalance, refreshBalance,
      refreshRounds, onTokenChange,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
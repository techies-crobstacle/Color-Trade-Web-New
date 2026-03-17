// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import { toast } from "react-toastify";

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

// interface SocketContextType {
//   socket: Socket | null;
//   isConnected: boolean;
//   balance: number | null;
//   currentRounds: GameData[];
//   token: string | null; // Add token here
//   updateBalance: (newBalance: number) => void;
//   refreshBalance: () => void;
//   refreshRounds: () => void;
//   onTokenChange: (token: string | null) => void; // NEW: notify token change from login
// }

// const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   isConnected: false,
//   balance: null,
//   currentRounds: [],
//    token: null, // Default to null
//   updateBalance: () => {},
//   refreshBalance: () => {},
//   refreshRounds: () => {},
//   onTokenChange: () => {},
// });

// export function SocketProvider({ children }: { children: React.ReactNode }) {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [balance, setBalance] = useState<number | null>(null);
//   const [currentRounds, setCurrentRounds] = useState<GameData[]>([]);
//   const [token, setToken] = useState<string | null>(
//     typeof window !== "undefined" ? localStorage.getItem("token") : null
//   );

//   // Expose function to update token from Login component immediately on login/logout
//   const onTokenChange = (newToken: string | null) => {
//     setToken(newToken);
//   };

//   // Listen to storage events for token changes from other tabs/windows
//   useEffect(() => {
//     const onStorage = () => {
//       const current = localStorage.getItem("token");
//       setToken(current);
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   useEffect(() => {
//     if (!token) {
//       if (socket) {
//         socket.disconnect();
//         setSocket(null);
//       }
//       setIsConnected(false);
//       return;
//     }

//     const SOCKET_URL =
//       process.env.NEXT_PUBLIC_SOCKET_URL || "https://ctbackend.crobstacle.com";
//     const socketInstance = io(SOCKET_URL, {
//       path: "/socket.io",
//       transports: ["websocket", "polling"],
//       auth: { token },
//       reconnection: true,
//       reconnectionAttempts: Infinity,
//       reconnectionDelay: 1000,
//       timeout: 15000,
//     });

//     setSocket(socketInstance);

//     socketInstance.on("connect", () => {
//       setIsConnected(true);
//       socketInstance.emit("get:balance");
//       socketInstance.emit("get:rounds");
//     });

//     socketInstance.on("user:balance", (data) => {
//       if (data?.balance !== undefined) {
//         setBalance(data.balance);
//       }
//     });

//     socketInstance.on("balance:update", (data) => {
//       if (data?.balance !== undefined) {
//         setBalance(data.balance);
//       }
//     });

//     socketInstance.on("current:rounds", (data) => {
//       if (data?.rounds && Array.isArray(data.rounds)) {
//         setCurrentRounds(data.rounds);
//       }
//     });

//     socketInstance.on("round:created", (data) => {
//       if (data && typeof data === "object" && "period" in data) {
//         setCurrentRounds((prev) => {
//           const newRounds = [...prev];
//           const existingIndex = newRounds.findIndex(
//             (r) => r.period === data.period
//           );
//           if (existingIndex >= 0) {
//             newRounds[existingIndex] = data;
//           } else {
//             newRounds.push(data);
//           }
//           return newRounds;
//         });
//       }
//     });

//     socketInstance.on("round:finalized", () => {
//       socketInstance.emit("get:rounds");
//     });

//     socketInstance.on("game:result", (result) => {
//       if (result.status === "won") {
//         toast.success(
//           `🎉 You WON this Round! Period: ${result.period}, Winnings: ₹${result.winnings}`,
//           { autoClose: 4000 }
//         );
//       } else if (result.status === "lost") {
//         toast.error(
//           `😔 You LOST this Round. Period: ${result.period}`,
//           { autoClose: 4000 }
//         );
//       }
//     });

//     socketInstance.on("disconnect", () => {
//       setIsConnected(false);
//     });

//     socketInstance.on("connect_error", (err) => {
//       console.error("Socket connection error:", err.message);

//       // Check if error mentions invalid token
//       if (
//         err.message.includes("Invalid token") ||
//         err.message.includes("Unauthorized")
//       ) {
//         localStorage.removeItem("token"); // Clear stale token
//         setToken(null); // Notify context immediately
//         toast.error("Session expired Please login again.");
//         // window.location.href = "/login"; // Optionally redirect to login
//         // router.push('/login');
//       }
//       setIsConnected(false);
//     });

//     return () => {
//       socketInstance.removeAllListeners();
//       socketInstance.disconnect();
//       setSocket(null);
//     };
//   }, [token]);

//   const updateBalance = (newBalance: number) => setBalance(newBalance);

//   const refreshBalance = () => {
//     if (socket && isConnected) {
//       socket.emit("get:balance");
//     }
//   };

//   const refreshRounds = () => {
//     if (socket && isConnected) {
//       socket.emit("get:rounds");
//     }
//   };

//   return (
//     <SocketContext.Provider
//       value={{
//         socket,
//         isConnected,
//         token,
//         balance,
//         currentRounds,
//         updateBalance,
//         refreshBalance,
//         refreshRounds,
//         onTokenChange, // expose method here
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// }

// export const useSocket = () => useContext(SocketContext);

"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  userBetResults: Record<string, UserBetResult>; // keyed by period — never overwritten
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

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [currentRounds, setCurrentRounds] = useState<GameData[]>([]);
  const [lastGames, setLastGames] = useState<Record<string, LastGameInfo>>({});
  // userBetResults is ONLY written by game:result — never overwritten by current:rounds
  const [userBetResults, setUserBetResults] = useState<Record<string, UserBetResult>>({});
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );

  const onTokenChange = (newToken: string | null) => {
    setToken(newToken);
  };

  useEffect(() => {
    const onStorage = () => {
      const current = localStorage.getItem("token");
      setToken(current);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
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

    // Heartbeat: re-emit get:rounds + get:balance every 5s to keep data fresh
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

    socketInstance.on("connect", () => {
      setIsConnected(true);
      socketInstance.emit("get:balance");
      socketInstance.emit("get:rounds");

      // Start heartbeat
      heartbeatInterval = setInterval(() => {
        socketInstance.emit("get:rounds");
        socketInstance.emit("get:balance");
      }, 5000);
    });

    socketInstance.on("user:balance", (data) => {
      if (data?.balance !== undefined) {
        setBalance(data.balance);
      }
    });

    socketInstance.on("balance:update", (data) => {
      if (data?.balance !== undefined) {
        setBalance(data.balance);
      }
    });

    socketInstance.on("current:rounds", (data) => {
      // New format: { status, data: { games: { 1m_game, 3m_game, 5m_game }, lastGames, walletBalance } }
      if (data?.data?.games && typeof data.data.games === "object" && !Array.isArray(data.data.games)) {
        const gamesObj = data.data.games as Record<string, GameData>;
        const roundsArray = Object.values(gamesObj).filter(
          (g): g is GameData => !!g && typeof g === "object" && "period" in g,
        );
        if (roundsArray.length > 0) {
          setCurrentRounds(roundsArray);
        }
        if (data.data.lastGames && typeof data.data.lastGames === "object") {
          setLastGames(data.data.lastGames as Record<string, LastGameInfo>);
        }
        if (typeof data.data.walletBalance === "number") {
          setBalance(data.data.walletBalance);
        }
        return;
      }
      // Legacy format: { rounds: GameData[] }
      if (data && Array.isArray(data.rounds) && data.rounds.length > 0) {
        setCurrentRounds(data.rounds);
      }
    });

    socketInstance.on("round:created", (data) => {
      if (data && typeof data === "object" && "period" in data) {
        setCurrentRounds((prev) => {
          const newRounds = [...prev];
          const existingIndex = newRounds.findIndex(
            (r) => r.period === data.period
          );
          if (existingIndex >= 0) {
            newRounds[existingIndex] = data;
          } else {
            newRounds.push(data);
          }
          return newRounds;
        });
      }
    });

    socketInstance.on("round:updated", (data) => {
      if (data && typeof data === "object" && "period" in data) {
        setCurrentRounds((prev) => {
          const newRounds = [...prev];
          const existingIndex = newRounds.findIndex(
            (r) => r.period === data.period
          );
          if (existingIndex >= 0) {
            newRounds[existingIndex] = data;
          } else {
            newRounds.push(data);
          }
          return newRounds;
        });
      }
    });

    socketInstance.on("round:finalized", (data?: { period?: string; winningNumber?: number; winningColor?: string[]; winningSize?: string }) => {
      // Immediately store the winning result so game components can show the popup
      if (data?.period && data.winningNumber != null) {
        const key = data.period.startsWith("1m-")
          ? "1m_game"
          : data.period.startsWith("3m-")
          ? "3m_game"
          : data.period.startsWith("5m-")
          ? "5m_game"
          : null;
        if (key) {
          setLastGames((prev) => ({
            ...prev,
            [key]: {
              ...(prev[key] ?? {}),
              period: data.period!,
              winningNumber: data.winningNumber!,
              winningColor: data.winningColor ?? [],
              winningSize: data.winningSize ?? null,
            },
          }));
        }
      }
      socketInstance.emit("get:rounds");
      socketInstance.emit("get:balance");
    });

    socketInstance.on("game:result", (data?: { status?: string; result?: string; period?: string; winnings?: number; winningNumber?: number; winningColor?: string[]; winningSize?: string }) => {
      // Write personal result into userBetResults — isolated state never touched by current:rounds
      if (data?.period) {
        const outcome = data.status ?? data.result ?? "";
        // Also grab winning info from lastGames if the server doesn't send it here
        setUserBetResults((prev) => ({
          ...prev,
          [data.period!]: {
            period: data.period!,
            result: outcome,
            winnings: data.winnings ?? 0,
            winningNumber: data.winningNumber ?? null,
            winningColor: data.winningColor ?? [],
            winningSize: data.winningSize ?? null,
          },
        }));
      }
      socketInstance.emit("get:balance");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      // Clear heartbeat on disconnect
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      if (
        err.message.includes("Invalid token") ||
        err.message.includes("Unauthorized")
      ) {
        // Clear token from both localStorage and cookie so middleware also logs out
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
        setToken(null);
        toast.error("Session expired. Please login again.");
        // Hard redirect so middleware cookie check also re-runs cleanly
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
  }, [token]);

  const updateBalance = (newBalance: number) => setBalance(newBalance);

  const refreshBalance = () => {
    if (socket && isConnected) socket.emit("get:balance");
  };

  const refreshRounds = () => {
    if (socket && isConnected) socket.emit("get:rounds");
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        token,
        balance,
        currentRounds,
        lastGames,
        userBetResults,
        updateBalance,
        refreshBalance,
        refreshRounds,
        onTokenChange,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
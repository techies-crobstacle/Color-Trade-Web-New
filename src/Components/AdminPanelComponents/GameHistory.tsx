import React, { useState, useEffect } from "react";
import { Clock, Search, TrendingUp, DollarSign, Activity, X, Eye } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.realdaddygame.com";

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
  totalBets?: number;
  totalBetAmount?: number;
  totalPayouts?: number;
  systemProfit?: number;
}

interface RawHistoryGame {
  period?: string;
  duration?: string;
  scheduledAt?: string;
  status?: string;
  result?: GameResult | null;
  totalBets?: number;
  totalBetCount?: number;
  totalBetAmount?: number;
  totalPayouts?: number;
  systemProfit?: number;
}

interface BetEntry {
  _id: string;
  userId: {
    _id: string;
    number: string;
    name: string;
  };
  period: string;
  betType: string;
  betValue: string[];
  betAmount: number;
  status: string;
  winnings: number;
  createdAt: string;
}

export default function GameHistory() {
  const [games, setGames] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"1m" | "3m" | "5m">("1m");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [jumpPage, setJumpPage] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameHistoryEntry | null>(null);
  const [betsLoading, setBetsLoading] = useState(false);
  const [gameBets, setGameBets] = useState<BetEntry[]>([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, pageSize]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        duration: activeTab,
        page: String(currentPage),
        limit: String(pageSize),
        skip: String((currentPage - 1) * pageSize),
        status: 'completed',
      });

      const res = await fetch(`${API_BASE}/api/admin/game-history?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();
      
      let rawRecords: RawHistoryGame[] = [];
      if (Array.isArray(json?.data?.games)) rawRecords = json.data.games;
      else if (Array.isArray(json?.data)) rawRecords = json.data;
      else if (Array.isArray(json?.data?.stats)) rawRecords = json.data.stats;
      else if (Array.isArray(json)) rawRecords = json;

      const records: GameHistoryEntry[] = rawRecords
        .filter((game) => Boolean(game?.period))
        .map((game) => ({
          period: game.period || '',
          duration: game.duration || activeTab,
          scheduledAt: game.scheduledAt || '',
          status: game.status || 'completed',
          result: game.result || null,
          totalBets: game.totalBetCount ?? game.totalBets ?? 0,
          totalBetAmount: game.totalBetAmount ?? 0,
          totalPayouts: game.totalPayouts ?? 0,
          systemProfit: game.systemProfit ?? 0,
        }));

      const pagination = json?.data?.pagination;
      const totalFromApi = Number(
        pagination?.totalRecords ?? pagination?.total ?? records.length ?? 0
      );
      const pagesFromApi = Number(
        pagination?.totalPages ?? Math.ceil(totalFromApi / Number(pageSize || 1))
      );

      setTotalRecords(Number.isFinite(totalFromApi) ? totalFromApi : records.length);
      setTotalPages(Number.isFinite(pagesFromApi) && pagesFromApi > 0 ? pagesFromApi : 1);
      
      setGames(records);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load game history");
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (game: GameHistoryEntry) => {
    setSelectedGame(game);
    setModalOpen(true);
    setBetsLoading(true);
    setGameBets([]);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/game-period/${game.period}?page=1&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch game details");
      const json = await res.json();
      setGameBets(json.data?.bets || []);
      // Optional: if we want to store the full detail response
      (window as any).currentGameDetail = json.data;
    } catch(err) {
      console.error(err);
    } finally {
      setBetsLoading(false);
    }
  };

  const filtered = games.filter(g => g.period?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Modern tabs design
  const tabs = [
    { id: "1m", label: "1 Min Games" },
    { id: "3m", label: "3 Min Games" },
    { id: "5m", label: "5 Min Games" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Game History & Bets</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
            >
              <Clock className="w-4 h-4 inline-block mr-2 mb-0.5" />
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          <div className="flex mb-6 relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by period..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {loading ? (
             <div className="text-center py-12"><Activity className="w-8 h-8 animate-spin mx-auto text-blue-500"/></div>
          ) : error ? (
             <div className="text-red-500 text-center py-6">{error}</div>
          ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50 border-y border-gray-200">
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Period</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Result</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total Bets (₹)</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total Payouts (₹)</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {filtered.map(game => (
                     <tr key={game.period} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openModal(game)}>
                       <td className="px-6 py-4 text-sm font-medium text-gray-900">{game.period}</td>
                       <td className="px-6 py-4 text-sm text-gray-600">
                         {game.result ? (
                           <div className="flex gap-2 items-center">
                             {(game.result.number !== null && game.result.number !== undefined) ? <span className="font-bold">{game.result.number}</span> : null}
                             <div className="flex gap-1">
                               {game.result.color?.map(c => (
                                 <span key={c} className="w-3 h-3 rounded-full" style={{backgroundColor: c}}></span>
                               ))}
                             </div>
                             {game.result.size && <span className="text-xs uppercase bg-gray-200 px-2 py-0.5 rounded">{game.result.size}</span>}
                           </div>
                         ) : '—'}
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-600 font-medium">₹{game.totalBetAmount || 0}</td>
                       <td className="px-6 py-4 text-sm font-medium" style={{color: (game.systemProfit??0) < 0 ? 'red' : 'green'}}>
                         ₹{game.totalPayouts || 0}
                       </td>
                       <td className="px-6 py-4 text-sm text-right">
                         <button className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors" onClick={(e) => { e.stopPropagation(); openModal(game); }}>
                           <Eye className="w-5 h-5" />
                         </button>
                       </td>
                     </tr>
                   ))}
                   {filtered.length === 0 && (
                     <tr><td colSpan={5} className="text-center py-8 text-gray-500">No games found</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-gray-500 font-medium">
              Total: {totalRecords} records • Page {currentPage} of {totalPages}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold uppercase">Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 border border-gray-300 bg-white px-2 py-1 rounded-md">
                <span className="text-xs text-gray-500">Jump to</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const p = Number(jumpPage);
                      if (p >= 1 && p <= totalPages) {
                        setCurrentPage(p);
                        setJumpPage('');
                      }
                    }
                  }}
                  className="w-14 text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                />
                <button
                  onClick={() => {
                    const p = Number(jumpPage);
                    if (p >= 1 && p <= totalPages) {
                      setCurrentPage(p);
                      setJumpPage('');
                    }
                  }}
                  className="text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                >
                  GO
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                  className="px-3 py-1.5 text-xs font-bold rounded-md border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  « Prev
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                  className="px-3 py-1.5 text-xs font-bold rounded-md border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  Next »
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-6 text-white flex justify-between items-center ${
              activeTab === '1m' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
              activeTab === '3m' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' :
              'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Clock className="w-6 h-6" /> Period: {selectedGame.period} ({activeTab.toUpperCase()})
                </h2>
                <div className="flex gap-4 mt-2 text-sm opacity-90">
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4"/> Bets: ₹{selectedGame.totalBetAmount || 0}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4"/> Payout: ₹{selectedGame.totalPayouts || 0}</span>
                  <span className="flex items-center gap-1">Profit: ₹{selectedGame.systemProfit || 0}</span>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {betsLoading ? (
                <div className="text-center py-12"><Activity className="w-8 h-8 animate-spin mx-auto text-blue-500"/> Loading bets...</div>
              ) : gameBets.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">No bets placed in this period.</div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bet Type</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Amount (₹)</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {gameBets.map(bet => {
                        const isWon = bet.status === 'won';
                        const isLost = bet.status === 'lost';
                        return (
                        <tr key={bet._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                            {bet.userId ? `${bet.userId.name || ''} (${bet.userId.number || ''})` : 'Unknown User'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-600 border px-2 py-0.5 rounded text-xs uppercase">{bet.betType}</span>
                            <span className="font-bold text-gray-800">{bet.betValue?.join(", ")}</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">₹{bet.betAmount}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-right">
                            {isWon ? <span className="text-green-600">+₹{bet.winnings}</span> : 
                             isLost ? <span className="text-red-500">-₹{bet.betAmount}</span> : 
                             <span className="text-yellow-600">Pending</span>}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

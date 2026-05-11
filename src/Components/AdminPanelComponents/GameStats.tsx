
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSocket } from '../../contexts/SocketContext';

export type GameStatsPayload = {
  period: string;
  ttl: number;
  expiresAt: string;
  totalBetAmount: number;
  totalBetCount: number;
  totalByNumber: Record<string, { amount: number; count: number }>;
  totalByColor: Record<string, { amount: number; count: number }>;
  totalBySize: Record<string, { amount: number; count: number }>;
  profitLossByNumber: Record<string, {
    colors: string[];
    size: string;
    payout: number;
    profit: number;
    breakdown: any;
  }>;
  updatedAt: string;
};

export type RoundRow = {
  period: string;
  gameLabel: string;
  status: string;
  ttl: number; // legacy fallback
  expiresAtTime: number | null; // internal absolute time
  totalBets: number;
  totalBetAmount: number;
  netProfit: number | null;
  distribution: { red: number; green: number; violet: number; total: number } | null;
  fullStats?: GameStatsPayload | null;
  winningNumber?: number | null;
  winningColor?: string[] | null;
  winningSize?: string | null;
};

type GameBetRow = {
  _id: string;
  period: string;
  betAmount: number;
  betType: 'color' | 'size' | 'number';
  betValue: string[];
  status: 'pending' | 'won' | 'lost';
  winnings: number;
  createdAt: string;
  userId: { name?: string; number?: { value: string } } | null;
};

type GamePeriodDetailResponse = {
  game: {
    period: string;
    gameDuration: number;
    status: string;
    scheduledAt?: string;
    winningNumber?: number | null;
    color?: string[] | null;
    size?: string | null;
  };
  summary: {
    totalBets: number;
    totalBetAmount: number;
    totalPayout: number;
    wonCount: number;
    lostCount: number;
    pendingCount: number;
    betTypeStats?: Record<string, { count: number; totalAmount: number; totalWinnings: number }>;
  };
  bets: GameBetRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ctbackend.crobstacle.com';

const DURATION_THEME: Record<'1m' | '3m' | '5m', {
  label: string;
  accent: string;
  accentText: string;
  soft: string;
  border: string;
  glow: string;
}> = {
  '1m': {
    label: '1 Minute Burst',
    accent: 'from-sky-500 to-blue-600',
    accentText: 'text-sky-700',
    soft: 'bg-sky-50',
    border: 'border-sky-200',
    glow: 'shadow-sky-200/40',
  },
  '3m': {
    label: '3 Minute Flow',
    accent: 'from-violet-500 to-purple-600',
    accentText: 'text-violet-700',
    soft: 'bg-violet-50',
    border: 'border-violet-200',
    glow: 'shadow-violet-200/40',
  },
  '5m': {
    label: '5 Minute Sprint',
    accent: 'from-amber-500 to-orange-600',
    accentText: 'text-amber-700',
    soft: 'bg-amber-50',
    border: 'border-amber-200',
    glow: 'shadow-amber-200/40',
  },
};

const formatMoney = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function pad2(num: number) { return num.toString().padStart(2, "0"); }

function getSizeBucket(
  totalBySize: Record<string, { amount: number; count: number }> | undefined,
  label: "Big" | "Small"
) {
  if (!totalBySize) return { amount: 0, count: 0 };
  const lower = label.toLowerCase();
  const upper = label;
  return totalBySize[lower] || totalBySize[upper] || { amount: 0, count: 0 };
}

function getPeriodIds(now: Date, type: string) {
  const year = now.getFullYear();
  const month = pad2(now.getMonth() + 1);
  const day = pad2(now.getDate());
  const hour = pad2(now.getHours());
  
  let interval = 1;
  if (type === '3m') interval = 3;
  if (type === '5m') interval = 5;
  
  const minutes = Math.floor(now.getMinutes() / interval) * interval;
  const minStr = pad2(minutes);
  
  const nextDate = new Date(now.getTime());
  nextDate.setMinutes(minutes + interval);
  
  const nYear = nextDate.getFullYear();
  const nMonth = pad2(nextDate.getMonth() + 1);
  const nDay = pad2(nextDate.getDate());
  const nHour = pad2(nextDate.getHours());
  const nMinStr = pad2(nextDate.getMinutes());
  
  const curr = `${type}-${year}${month}${day}-${hour}${minStr}`;
  const next = `${type}-${nYear}${nMonth}${nDay}-${nHour}${nMinStr}`;
  
  return { curr, next };
}

function getRuntimeStatus(row: RoundRow, nowDate: Date): { displayStatus: string; activeTtl: number; isCurrent: boolean } {
  const { curr: currentActive, next: nextActive } = getPeriodIds(nowDate, row.gameLabel);
  const isPast = row.period < currentActive;
  const isFuture = row.period > currentActive;
  const isCurrent = row.period === currentActive;

  let duration = 60;
  if (row.gameLabel === '3m') duration = 180;
  if (row.gameLabel === '5m') duration = 300;

  const elapsed = (nowDate.getHours() * 3600 + nowDate.getMinutes() * 60 + nowDate.getSeconds()) % duration;
  const phaseTtl = Math.max(0, duration - Math.floor(elapsed));

  let displayStatus = row.status;
  let activeTtl = 0;

  if (isPast) {
    activeTtl = 0;
    displayStatus = 'Completed';
  } else if (isFuture) {
    activeTtl = -1;
    if (row.period === nextActive && phaseTtl <= 5) {
      displayStatus = 'Starting...';
    } else {
      displayStatus = 'Scheduled';
    }
  } else {
    activeTtl = phaseTtl;
    if (activeTtl > 15) displayStatus = 'Running';
    else if (activeTtl <= 15 && activeTtl > 5) displayStatus = 'Selecting Winner';
    else displayStatus = 'Closing...';
  }

  return { displayStatus, activeTtl, isCurrent };
}


function UnifiedDashboardPanel({ row, inModal, onOpenModal }: { row: RoundRow, inModal: boolean, onOpenModal?: () => void }) {
  const [hoverTip, setHoverTip] = React.useState<{label: string, amount: string, pct: string, x: number, y: number} | null>(null);

  if (!row.fullStats) return null;
  const tot = row.totalBetAmount || 1;
  const totalBets = row.totalBets || 1;
  const avgBet = row.totalBetAmount / totalBets;

  // Highest Liability / Max Risk
  let houseProfits = Object.entries(row.fullStats.profitLossByNumber || {}).map(([n, d]) => ({ num: n, profit: d.profit, payout: d.payout }));
  houseProfits.sort((a,b) => a.profit - b.profit); // lowest profit (max loss) first
  
  const mostFavoredNo = [...Object.entries(row.fullStats.totalByNumber || {})].sort((a,b) => b[1].amount - a[1].amount)[0] || ['-', {amount: 0}];
  const hotColor = [...Object.entries(row.fullStats.totalByColor || {})].sort((a,b) => b[1].amount - a[1].amount)[0] || ['-', {amount: 0}];
  const hotSize = [...Object.entries(row.fullStats.totalBySize || {})].sort((a,b) => b[1].amount - a[1].amount)[0] || ['-', {amount: 0}];

  const amounts = {
    Red: row.fullStats.totalByColor?.['Red']?.amount || 0,
    Green: row.fullStats.totalByColor?.['Green']?.amount || 0,
    Violet: row.fullStats.totalByColor?.['Violet']?.amount || 0
  };
  const sizeAmounts = {
    Big: getSizeBucket(row.fullStats.totalBySize, "Big").amount,
    Small: getSizeBucket(row.fullStats.totalBySize, "Small").amount
  };

  const getPct = (val: number) => ((val/tot)*100).toFixed(1);
  const fmt = (val: number) => val >= 100000 ? (val/1000).toFixed(1) + 'k' : val.toLocaleString('en-IN', {maximumFractionDigits: 0});

  let numOffset = 0, colorOffset = 0, sizeOffset = 0;

  const handleHover = (e: React.MouseEvent, label: string, amount: number) => {
    setHoverTip({ label, amount: fmt(amount), pct: getPct(amount), x: e.clientX, y: e.clientY });
  };
  const handleLeave = () => setHoverTip(null);

  // Professional modern data-viz palette for numbers 0-9
  const numberColors = ['#4F46E5', '#7C3AED', '#C026D3', '#DB2777', '#E11D48', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#059669'];

  return (
    <div className={`flex flex-col h-full ${!inModal ? 'p-6 transition-all duration-300 ease-linear overflow-hidden' : 'p-6 overflow-y-auto w-full custom-scrollbar flex-1 bg-gray-50/30'}`}>
      {hoverTip && (
        <div 
          className="fixed z-[100] pointer-events-none bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl shadow-black/20 text-xs transform -translate-x-1/2 -translate-y-[130%] flex flex-col items-center gap-0.5 animate-[fadeIn_0.1s_ease-out]"
          style={{ left: hoverTip.x, top: hoverTip.y }}
        >
<<<<<<< HEAD
          <span className="font-bold text-gray-300 tracking-wider uppercase text-[9px]">{hoverTip.label}</span>
          <span className="font-black text-sm">₹{hoverTip.amount} <span className="text-gray-400 font-medium text-[10px]">({hoverTip.pct}%)</span></span>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
=======
          Set Winner
        </Button>
      </span>
    </Tooltip>
  );
}


export default function GameStatsTable() {
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [search, setSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Set Winner Modal State
  const [setWinnerModal, setSetWinnerModal] = useState<boolean>(false);
  const [selectedGamePeriod, setSelectedGamePeriod] = useState<string>('');
  const [selectedWinningNumber, setSelectedWinningNumber] = useState<number>(0);
  const [settingWinner, setSettingWinner] = useState<boolean>(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ctbackend.crobstacle.com';
  const API_ENDPOINT = `${API_BASE_URL}/api/admin/game-stats`;
  const SET_WINNER_ENDPOINT = `${API_BASE_URL}/api/admin/winner`;

  const fetchGameStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      if (!silent) setError('');
      
      const result: ApiResponse = await apiFetch(API_ENDPOINT);

      if (result.status === 'success') {
        const gameStatsArray = Object.values(result.data || {}).filter((s): s is GameStats => !!s?.period);
        const prefixOrder: Record<string, string> = { '1m': '1', '3m': '3', '5m': '5' };
        const getSortKey = (period: string) => {
          const parts = period.split('-');
          if (parts.length >= 4) {
            return parts[1] + parts[2] + parts[3].padStart(4, '0') + (prefixOrder[parts[0]] ?? '9');
          }
          return period;
        };
  const sortedData = gameStatsArray.sort((a, b) =>
    getSortKey(b.period).localeCompare(getSortKey(a.period))
  );
  setGameStats(sortedData);
}
    } catch (err) {
      console.error('Error fetching game stats:', err);
      if (!silent) setError(err instanceof Error ? err.message : 'Failed to fetch game stats');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(() => fetchGameStats(true), 30_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingExpireTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const scheduleExpireFetch = useCallback((delayMs: number) => {
    const t = setTimeout(() => {
      fetchGameStats(true);
      pendingExpireTimers.current.delete(t);
    }, delayMs);
    pendingExpireTimers.current.add(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePeriodExpire = useCallback(() => {
    setExpandedRow(null);
    fetchGameStats(true);
    scheduleExpireFetch(2000);
    scheduleExpireFetch(5000);
  }, [scheduleExpireFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      pendingExpireTimers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // ─── Live counts scoped to the current duration filter ────────────────────
  const statsForDuration = durationFilter === 'All'
    ? gameStats.filter((s) => !!s?.period)
    : gameStats.filter((s) => s?.period?.startsWith(durationFilter + '-'));

  const activeCount = statsForDuration.filter((s) => !s.message).length;
  const noBetsCount = statsForDuration.filter((s) => !!s.message).length;

  const filteredStats = gameStats.filter((stat) => {
    if (!stat?.period) return false;
    const matchesSearch = stat.period.toLowerCase().includes(search.toLowerCase());
    const matchesDuration =
      durationFilter === 'All' || stat.period.toLowerCase().startsWith(durationFilter + '-');
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && !stat.message) ||
      (statusFilter === 'No Bets' && stat.message);
    return matchesSearch && matchesDuration && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStats.length / entriesPerPage);
  const paginatedStats = filteredStats.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage,
  );

  const formatPeriod = (period: string) => {
    const parts = period.split('-');
    if (parts.length >= 4) {
      const date = parts[1];
      const time = parts[2];
      const round = parts[3];
      return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} ${time.slice(0, 2)}:${time.slice(2, 4)} R${round}`;
    }
    return period;
  };

  const getDurationLabel = (period: string) => {
    if (period.startsWith('1m-')) return '1 Min';
    if (period.startsWith('3m-')) return '3 Min';
    if (period.startsWith('5m-')) return '5 Min';
    return '';
  };

  const getStatusColor = (stat: GameStats) => (stat.message ? '#ff9800' : '#4caf50');
  const getStatusLabel = (stat: GameStats) => (stat.message ? 'No Bets' : 'Active');

  const getTotalBets = (stat: GameStats) =>
    stat.totalByNumber ? Object.values(stat.totalByNumber).reduce((sum, val) => sum + val, 0) : 0;

  const getTotalProfit = (profitLoss: Record<string, { profit: number }>) =>
    Object.values(profitLoss).reduce((sum, item) => sum + item.profit, 0);

  const toggleRowExpansion = (period: string) => {
    setExpandedRow(expandedRow === period ? null : period);
  };

  const openSetWinnerModal = (period: string) => {
    setSelectedGamePeriod(period);
    setSelectedWinningNumber(0);
    setSetWinnerModal(true);
  };

  const closeSetWinnerModal = () => {
    setSetWinnerModal(false);
    setSelectedGamePeriod('');
    setSelectedWinningNumber(0);
  };

  const handleSetWinner = async () => {
    if (!selectedGamePeriod || selectedWinningNumber < 0 || selectedWinningNumber > 9) {
      setError('Please select a valid winning number (0-9)');
      return;
    }
    try {
      setSettingWinner(true);
      setError('');
      
      const result: SetWinnerResponse = await apiFetch(SET_WINNER_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          period: selectedGamePeriod,
          selectedWinningNumber: selectedWinningNumber,
        }),
      });
      
      if (result.status === 'success') {
        closeSetWinnerModal();
        await fetchGameStats(true);
      } else {
        throw new Error(result.message || 'Failed to set winner');
      }
    } catch (err) {
      console.error('Error setting winner:', err);
      setError(err instanceof Error ? err.message : 'Failed to set winner');
    } finally {
      setSettingWinner(false);
    }
  };

  const durationTabs = [
    { label: 'All', value: 'All' },
    { label: '1 Min', value: '1m' },
    { label: '3 Min', value: '3m' },
    { label: '5 Min', value: '5m' },
  ];

  const getTabActiveColor = (value: string) => {
    if (value === 'All') return '#e0e0e0';
    if (value === '1m') return '#2196f3';
    if (value === '3m') return '#9c27b0';
    if (value === '5m') return '#ff5722';
    return '#e0e0e0';
  };

  return (
    <Box className="space-y-6 text-black">
      {/* Header */}
      <Box className="flex justify-between items-center">
        <Typography variant="h5" component="h1" className="font-semibold">
          Game Statistics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => fetchGameStats(false)}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
>>>>>>> 1f1e0df3bc66eade3a35d58fb54f1db0434a6caa
      )}

      {!inModal && onOpenModal && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-bold text-sm">Quick Overview</h3>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenModal(); }}
            className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            Open Full Screen Charts
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-full">
        {/* Unified Mega Pie Chart */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm ring-1 ring-black/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-70 z-0 pointer-events-none"></div>
          <h3 className="absolute top-4 left-5 text-base font-bold text-gray-800 flex items-center gap-2 z-10 w-full">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path></svg>
            Omni Distribution Engine
          </h3>
          
          <div className="relative w-80 h-80 z-10 mt-8 group flex items-center justify-center">
            {/* Center Label (Fixed z-index to be above svg and slightly scaled up padding) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40 bg-white/30 rounded-full scale-75 blur-[0.5px]"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50">
               <span className="text-[11px] text-gray-600 font-bold uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded shadow-sm backdrop-blur-md border border-gray-100/50">Total Pool</span>
               <span className="text-3xl font-black text-gray-900 leading-none mt-1.5 drop-shadow-sm">₹{fmt(row.totalBetAmount)}</span>
            </div>

            <svg viewBox="-20 -20 240 240" className="w-full h-full transform -rotate-90 filter drop-shadow-md overflow-visible relative z-30">
              {/* Size Ring (Inner) - Radius 50 - Circ 314.16 */}
              <circle cx="100" cy="100" r="50" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
              {['Big', 'Small'].map(s => {
                 const am = sizeAmounts[s as keyof typeof sizeAmounts] || 0;
                 const pct = (am / tot);
                 const dashArray = pct * 314.16;
                 const circle = (
                   <circle key={s} cx="100" cy="100" r="50" fill="transparent" 
                     stroke={s==='Big'?'#D97706':'#2563EB'} strokeWidth="12"
                     strokeDasharray={`${dashArray} ${314.16 - dashArray}`} strokeDashoffset={-sizeOffset}
                     className="transition-all duration-1000 ease-out hover:stroke-width-[16px] cursor-pointer"
                     onMouseMove={(e) => handleHover(e, `Size: ${s}`, am)}
                     onMouseLeave={handleLeave}
                   />
                 );
                 sizeOffset += dashArray;
                 return circle;
              })}

              {/* Color Ring (Middle) - Radius 72 - Circ 452.39 */}
              <circle cx="100" cy="100" r="72" fill="transparent" stroke="#f3f4f6" strokeWidth="16" />
              {['Red', 'Green', 'Violet'].map(c => {
                 const am = amounts[c as keyof typeof amounts] || 0;
                 const pct = (am / tot);
                 const dashArray = pct * 452.39;
                 const circle = (
                   <circle key={c} cx="100" cy="100" r="72" fill="transparent" 
                     stroke={c==='Red'?'#DC2626':c==='Green'?'#16A34A':'#9333EA'} strokeWidth="16"
                     strokeDasharray={`${dashArray} ${452.39 - dashArray}`} strokeDashoffset={-colorOffset}
                     className="transition-all duration-1000 ease-out hover:stroke-width-[20px] cursor-pointer"
                     onMouseMove={(e) => handleHover(e, `Color: ${c}`, am)}
                     onMouseLeave={handleLeave}
                   />
                 );
                 colorOffset += dashArray;
                 return circle;
              })}

              {/* Number Ring (Outer) - Radius 96 - Circ 603.19 */}
              <circle cx="100" cy="100" r="96" fill="transparent" stroke="#f3f4f6" strokeWidth="20" />
              {[0,1,2,3,4,5,6,7,8,9].map(n => {
                 const am = row.fullStats!.totalByNumber?.[n.toString()]?.amount || 0;
                 const pct = (am / tot);
                 const dashArray = pct * 603.19;
                 const circle = (
                   <circle key={n} cx="100" cy="100" r="96" fill="transparent" 
                     stroke={numberColors[n]} strokeWidth="20"
                     strokeDasharray={`${dashArray} ${603.19 - dashArray}`} strokeDashoffset={-numOffset}
                     className="transition-all duration-1000 ease-out fill-transparent hover:stroke-width-[24px] cursor-pointer"
                     onMouseMove={(e) => handleHover(e, `Number: ${n}`, am)}
                     onMouseLeave={handleLeave}
                   />
                 );
                 numOffset += dashArray;
                 return circle;
              })}
            </svg>
          </div>

          {/* Legend Bottom */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 z-10 scale-90">
             <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-100"><div className="w-2 h-2 bg-[#D97706] rounded"></div><span className="text-[10px] font-bold">Inner: Size</span></div>
             <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-100"><div className="w-2 h-2 bg-[#16A34A] rounded"></div><span className="text-[10px] font-bold">Mid: Color</span></div>
             <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded shadow-sm border border-gray-100"><div className="w-2 h-2 bg-[#1d3557] rounded"></div><span className="text-[10px] font-bold">Outer: Number</span></div>
          </div>
        </div>

        {/* Intelligence / Analytics Panel (Creative Stats) */}
        <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col ring-1 ring-black/5 relative overflow-hidden text-gray-800">
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-50 rounded-full blur-3xl opacity-60 z-0 pointer-events-none"></div>
           <h3 className="text-sm font-bold border-b border-gray-100 pb-2 mb-3 flex items-center gap-1.5 z-10"><svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Active Analytics</h3>
           
           <div className="flex flex-col gap-2.5 z-10 overflow-y-auto custom-scrollbar flex-1 pr-1">
             <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex justify-between items-center group hover:bg-white transition-colors hover:shadow-sm">
                <span className="text-[11px] font-semibold text-gray-500">Highest Liability No.</span>
                <span className="font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded shadow-inner text-xs">{houseProfits[0]?.num ?? '-'}</span>
             </div>
             <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex justify-between items-center group hover:bg-white transition-colors hover:shadow-sm">
                <span className="text-[11px] font-semibold text-gray-500">Max House Loss</span>
                <span className="font-black text-rose-600 text-xs">{(houseProfits[0]?.profit < 0 ? `-₹${fmt(Math.abs(houseProfits[0].profit))}` : 'None')}</span>
             </div>
             <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex justify-between items-center group hover:bg-white transition-colors hover:shadow-sm">
                <span className="text-[11px] font-semibold text-gray-500">Safest Target No.</span>
                <span className="font-black text-green-600 bg-green-100 px-2 py-0.5 rounded shadow-inner text-xs">{houseProfits[houseProfits.length-1]?.num ?? '-'}</span>
             </div>
             <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex justify-between items-center group hover:bg-white transition-colors hover:shadow-sm">
                <span className="text-[11px] font-semibold text-gray-500">Max Est. House Profit</span>
                <span className="font-black text-green-600 text-xs">{(houseProfits[houseProfits.length-1]?.profit > 0 ? `+₹${fmt(houseProfits[houseProfits.length-1].profit)}` : 'None')}</span>
             </div>
             <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex justify-between items-center group hover:bg-white transition-colors hover:shadow-sm">
                <span className="text-[11px] font-semibold text-gray-500">Avg. Bet Size</span>
                <span className="font-black text-blue-600 text-xs">₹{avgBet >= 0 ? fmt(avgBet) : 0}</span>
             </div>

             <div className="h-px bg-gray-100 my-1"></div>
             <div className="grid grid-cols-3 gap-2">
               <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-2 rounded-lg border border-indigo-100/50 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-indigo-400 mb-0.5">Hot No.</span>
                  <span className="text-base font-black text-indigo-700 leading-none">{mostFavoredNo[0]}</span>
               </div>
               <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-2 rounded-lg border border-purple-100/50 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-purple-400 mb-0.5">Hot Color</span>
                  <span className="text-sm font-black text-purple-700 leading-none truncate w-full">{hotColor[0]}</span>
               </div>
               <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-2 rounded-lg border border-orange-100/50 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-orange-400 mb-0.5">Hot Size</span>
                  <span className="text-sm font-black text-orange-700 leading-none truncate w-full">{hotSize[0] === 'Small' ? 'Sm' : hotSize[0]}</span>
               </div>
             </div>
           </div>
        </div>

        {/* Existing Result Projections / Risk Profiler */}
        <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[380px] ring-1 ring-black/5">
          <div className="flex flex-col gap-2 mb-3 border-b border-gray-100 pb-2 flex-shrink-0">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              Payout Projections
            </h3>
            {row.winningNumber !== undefined && row.winningNumber !== null && (
              <div className="flex items-center gap-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-500">Winner:</span>
                <span className="font-black text-xl text-gray-800 leading-none">{row.winningNumber}</span>
                <div className="flex gap-1 ml-1 cursor-default">
                  {row.winningColor?.map(c => (
                    <span key={c} title={c} className={`w-3 h-3 rounded-full shadow-sm ${c.toLowerCase() === 'red' ? 'bg-red-500' : c.toLowerCase() === 'green' ? 'bg-green-500' : 'bg-purple-500'}`}></span>
                  ))}
                </div>
                <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded shadow-sm ml-auto tracking-widest">{row.winningSize}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 flex-1 min-h-0 custom-scrollbar pb-1">
            {Object.entries(row.fullStats.profitLossByNumber || {}).sort((a,b) => Number(a[0]) - Number(b[0])).map(([num, data]) => (
              <div key={num} className={`border ${row.winningNumber === Number(num) ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-sm' : 'border-gray-100 bg-white'} rounded-xl p-2 flex flex-col items-center hover:shadow-md transition-all h-full justify-between`}>
                <div className="flex gap-1 mb-0.5 items-center w-full justify-center">
                  <span className="text-xl font-black text-gray-900 leading-none">{num}</span>
                  <div className="flex flex-col gap-0.5 ml-1">
                    {data.colors.map((c: string, i: number) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${c === 'Red' ? 'bg-red-500' : c === 'Green' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase w-full text-center tracking-widest mb-1">{data.size}</span>
                <div className="mt-auto w-full flex flex-col gap-0.5 border-t border-gray-100 pt-1.5 bg-gray-50/50 -mx-2 -mb-2 px-2 pb-1.5 rounded-b-xl">
                  <div className="flex flex-col items-center justify-center w-full">
                    <span className="text-[8px] text-gray-500 font-medium uppercase">Payout</span>
                    <span className="text-[9.5px] text-gray-700 font-bold truncate w-full text-center" title={`₹${data.payout.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}>
                      ₹{fmt(data.payout)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center w-full mt-0.5">
                    <span className="text-[8px] text-gray-500 font-medium uppercase">Profit</span>
                    <span 
                      className={`text-[10px] font-black truncate w-full text-center ${data.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}
                      title={`${data.profit > 0 ? '+' : ''}${data.profit.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                    >
                      {data.profit > 0 ? '+' : ''}{fmt(data.profit)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
         </div>
      </div>
    </div>
  );
}

export default function GameStats({ token: propToken }: { token?: string }) {
  const { socket, isConnected, token: contextToken } = useSocket();
  const token = propToken || contextToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const [activeTab, setActiveTab] = useState<'1m' | '3m' | '5m'>('1m');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [backendPagination, setBackendPagination] = useState<{ totalRecords: number, skip: number, limit: number, returned: number } | null>(null);
  const [durationTotals, setDurationTotals] = useState<Record<'1m' | '3m' | '5m', number>>({
    '1m': 0,
    '3m': 0,
    '5m': 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const [modalPeriod, setModalPeriod] = useState<string | null>(null);
  const [gameDetailLoading, setGameDetailLoading] = useState(false);
  const [gameDetailError, setGameDetailError] = useState<string | null>(null);
  const [gameDetail, setGameDetail] = useState<GamePeriodDetailResponse | null>(null);
  const [gameDetailPage, setGameDetailPage] = useState(1);
  const [gameDetailLimit, setGameDetailLimit] = useState(25);

  const [settingWinnerTarget, setSettingWinnerTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [socketStatus, setSocketStatus] = useState<'Connecting...' | 'Connected (OK)' | 'Disconnected'>('Connecting...');

  const [now, setNow] = useState(Date.now());

  // States per game
  const [roundsMap, setRoundsMap] = useState<Record<string, RoundRow>>({});

  // Derive stats dynamically from roundsMap
  const derivedState = useMemo(() => {
    const list = Object.values(roundsMap);
    const state = {
      '1m': {
        rounds: list.filter(r => r.gameLabel === '1m'),
        totalGames: list.filter(r => r.gameLabel === '1m').length,
        activeGames: list.filter(r => r.gameLabel === '1m' && r.status === 'Running').length,
        noBetsGames: list.filter(r => r.gameLabel === '1m' && r.status === 'No Bets').length,
      },
      '3m': {
        rounds: list.filter(r => r.gameLabel === '3m'),
        totalGames: list.filter(r => r.gameLabel === '3m').length,
        activeGames: list.filter(r => r.gameLabel === '3m' && r.status === 'Running').length,
        noBetsGames: list.filter(r => r.gameLabel === '3m' && r.status === 'No Bets').length,
      },
      '5m': {
        rounds: list.filter(r => r.gameLabel === '5m'),
        totalGames: list.filter(r => r.gameLabel === '5m').length,
        activeGames: list.filter(r => r.gameLabel === '5m' && r.status === 'Running').length,
        noBetsGames: list.filter(r => r.gameLabel === '5m' && r.status === 'No Bets').length,
      }
    };
    return state;
  }, [roundsMap]);

  // Tick global clock safely without mutating inner state
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Guarantee current and scheduled dummy rounds
  useEffect(() => {
    const generator = setInterval(() => {
      const dt = new Date();
      setRoundsMap(prev => {
        let changed = false;
        const nextMap = { ...prev };
        
        ['1m', '3m', '5m'].forEach(type => {
            const { curr, next } = getPeriodIds(dt, type);
            
            const emptyStats = (period: string) => ({
              period,
              ttl: 0,
              expiresAt: null as any,
              totalBetAmount: 0,
              totalBetCount: 0,
              totalByNumber: {} as any,
              totalByColor: { Red: { amount: 0, count: 0 }, Green: { amount: 0, count: 0 }, Violet: { amount: 0, count: 0 } } as any,
              totalBySize: { big: { amount: 0, count: 0 }, small: { amount: 0, count: 0 } } as any,
              profitLossByNumber: {} as any,
              updatedAt: new Date().toISOString(),
            });

            // Ensure curr (Running) explicitly exists and is flagged as active
            if (!nextMap[curr]) {
                nextMap[curr] = {
                   period: curr,
                   gameLabel: type,
                   status: 'Running',
                   ttl: 0,
                   expiresAtTime: null,
                   totalBets: 0,
                   totalBetAmount: 0,
                   netProfit: null,
                   distribution: null,
                   fullStats: emptyStats(curr),
                };
                changed = true;
            } else if (nextMap[curr].status !== 'Running') {
                nextMap[curr].status = 'Running';
                changed = true;
            }

            // Ensure next (scheduled) exists
            if (!nextMap[next]) {
                nextMap[next] = {
                   period: next,
                   gameLabel: type,
                   status: 'Scheduled',
                   ttl: 0,
                   expiresAtTime: null,
                   totalBets: 0,
                   totalBetAmount: 0,
                   netProfit: null,
                   distribution: null,
                   fullStats: emptyStats(next),
                };
                changed = true;
            }
        });
        
        return changed ? nextMap : prev;
      });
    }, 1000);
    return () => clearInterval(generator);
  }, []);

  // Pure REST fetch for historical game data — no socket involved
  const fetchPage = useCallback(async (opts: { duration: string; skip: number; limit: number }) => {
    if (!token) {
      setToast({ msg: 'Not authenticated. Please log in.', type: 'error' });
      return;
    }
    setRefreshing(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ctbackend.crobstacle.com';
      const params = new URLSearchParams({
        duration: opts.duration,
        skip: String(opts.skip),
        limit: String(opts.limit),
      });
      const res = await fetch(`${API_BASE_URL}/api/admin/game-history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setToast({ msg: 'Session expired — please log in again.', type: 'error' });
        setRefreshing(false);
        return;
      }
      if (!res.ok) {
        setToast({ msg: `Failed to load game history (HTTP ${res.status}). Retry with the refresh button.`, type: 'error' });
        setRefreshing(false);
        return;
      }

      const { data } = await res.json();
      if (!data) { setRefreshing(false); return; }

      if (data.pagination) {
        setBackendPagination(data.pagination);
        // Clamp current page if it exceeds new total
        const maxPage = Math.max(1, Math.ceil(data.pagination.totalRecords / opts.limit));
        setCurrentPage(p => (p > maxPage ? maxPage : p));
      }
      if (data.totalsByDuration) {
        setDurationTotals({
          '1m': Number(data.totalsByDuration['1m'] || 0),
          '3m': Number(data.totalsByDuration['3m'] || 0),
          '5m': Number(data.totalsByDuration['5m'] || 0),
        });
      }
      if (Array.isArray(data.games)) {
        setRoundsMap(prev => {
          // Drop stale completed records for this tab — replace with exactly what backend returned.
          // Live rows (Running/Scheduled/Closing) are always preserved.
          const next: Record<string, RoundRow> = {};
          Object.values(prev).forEach(row => {
            if (row.status !== 'Completed') next[row.period] = row;
            else if (row.gameLabel !== opts.duration) next[row.period] = row;
          });
          data.games.forEach((game: any) => {
            if (!game.period) return;
            const totalByColor = game.totalByColor || {};
            const totalColor = (totalByColor?.Red?.amount || 0) + (totalByColor?.Green?.amount || 0) + (totalByColor?.Violet?.amount || 0);
            next[game.period] = {
              ...prev[game.period],
              period: game.period,
              gameLabel: game.duration || game.period.split('-')[0],
              status: 'Completed',
              ttl: 0,
              expiresAtTime: null,
              totalBets: game.totalBetCount ?? game.totalBets ?? 0,
              totalBetAmount: game.totalBetAmount ?? 0,
              netProfit: game.systemProfit ?? null,
              distribution: totalColor > 0 ? {
                red: totalByColor?.Red?.amount || 0,
                green: totalByColor?.Green?.amount || 0,
                violet: totalByColor?.Violet?.amount || 0,
                total: totalColor,
              } : null,
              fullStats: {
                period: game.period,
                totalBetAmount: game.totalBetAmount ?? 0,
                totalBetCount: game.totalBetCount ?? 0,
                totalByNumber: game.totalByNumber || {},
                totalByColor: game.totalByColor || {},
                totalBySize: game.totalBySize || {},
                profitLossByNumber: game.profitLossByNumber || {},
              } as any,
              winningNumber: game.result?.number ?? null,
              winningColor: game.result?.color ?? null,
              winningSize: game.result?.size ?? null,
            };
          });
          return next;
        });
      }
    } catch (e) {
      console.error('fetchPage failed', e);
      setToast({ msg: 'Network error — check connection and retry.', type: 'error' });
    }
    setRefreshing(false);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isConnected) {
      setSocketStatus('Connected (OK)');
    } else {
      setSocketStatus('Disconnected');
    }
  }, [isConnected]);

  useEffect(() => {
    if (!token || !socket || !isConnected) return;

    // Socket is ONLY used for real-time push events.
    // Historical / paginated data is loaded via REST (fetchPage).

    const handleGameStats = (stats: GameStatsPayload) => {
      if (stats?.period) {
        setRoundsMap(prev => {
          const existing = prev[stats.period];

          // Historical completed rows are authoritative from REST.
          // Ignore late/stale socket stats for completed rounds to prevent
          // value "flip" (e.g. 250 -> 63) caused by racey event arrival order.
          if (existing?.status === 'Completed') {
            return prev;
          }
          
          let minP = Infinity;
          if (stats.profitLossByNumber) {
            Object.values(stats.profitLossByNumber).forEach(d => {
              if (d.profit < minP) minP = d.profit;
            });
          }

          const totalColor = (stats.totalByColor?.Red?.amount || 0) + (stats.totalByColor?.Green?.amount || 0) + (stats.totalByColor?.Violet?.amount || 0);

          let currentTtl = stats.ttl;
          let expiresAtTime = existing?.expiresAtTime || null;
          
          if (stats.expiresAt) {
            expiresAtTime = new Date(stats.expiresAt).getTime();
            if (currentTtl === undefined || currentTtl === null) {
              currentTtl = Math.max(0, Math.floor((expiresAtTime - Date.now()) / 1000));
            }
          } else if (currentTtl !== undefined && currentTtl !== null) {
             // If server only gives TTL, only set internal clock explicitly if missing or vastly out of sync (>5s drift)
             const predicted = Date.now() + currentTtl * 1000;
             if (!expiresAtTime || Math.abs(expiresAtTime - predicted) > 5000) {
               expiresAtTime = predicted;
             }
          }

          if (currentTtl === undefined || currentTtl === null) currentTtl = 0;

          // Provide strict syncing mechanism purely visually
          const newTtl = currentTtl;

          let derivedStatus: "Scheduled" | "Running" | "No Bets" | "Completed" | "Closing..." = stats.totalBetCount > 0 ? 'Running' : 'No Bets';
          // Since stats payload doesn't necessarily contain status, check existing status
          if ((stats as any).status === 'Completed' || (existing && existing.status === 'Completed')) derivedStatus = 'Completed';

          return {
            ...prev,
            [stats.period]: {
              ...(existing || {}),
              period: stats.period,
              gameLabel: stats.period.split('-')[0],
              ttl: newTtl,
              expiresAtTime,
              totalBets: stats.totalBetCount,
              totalBetAmount: stats.totalBetAmount,
              netProfit: minP !== Infinity ? -minP : null, 
              status: derivedStatus,
              distribution: totalColor > 0 ? {
                red: stats.totalByColor?.Red?.amount || 0,
                green: stats.totalByColor?.Green?.amount || 0,
                violet: stats.totalByColor?.Violet?.amount || 0,
                total: totalColor
              } : null,
              winningNumber: (stats as any).winningNumber ?? existing?.winningNumber,
              winningColor: (stats as any).color ?? (stats as any).winningColor ?? existing?.winningColor,
              winningSize: (stats as any).size ?? (stats as any).winningSize ?? existing?.winningSize,
              fullStats: {
                ...stats,
              }
            }
          };
        });
      }
    };

    const handleRoundCreated = (data: { period: string; gameLabel: string; gameDuration: number }) => {
      setRoundsMap(prev => ({
        ...prev,
        [data.period]: {
          period: data.period,
          gameLabel: data.gameLabel,
          status: 'Scheduled',
          ttl: data.gameDuration,
          expiresAtTime: Date.now() + (data.gameDuration * 1000),
          totalBets: 0,
          totalBetAmount: 0,
          netProfit: null,
          distribution: null,
          fullStats: {
            period: data.period,
            ttl: data.gameDuration,
            expiresAt: new Date(Date.now() + (data.gameDuration * 1000)).toISOString(),
            totalBetAmount: 0,
            totalBetCount: 0,
            totalByNumber: {},
            totalByColor: {},
            totalBySize: {},
            profitLossByNumber: {},
            updatedAt: new Date().toISOString(),
          } as any,
        }
      }));
    };

    const handleRoundClosed = (data: any) => {
      if (data?.period) {
        setRoundsMap(prev => {
          if (!prev[data.period]) return prev;
          const statusVal: 'Completed' = 'Completed';
          return {
            ...prev,
            [data.period]: {
              ...prev[data.period],
              status: statusVal,
              ttl: 0,
              netProfit: data.systemProfit,
              totalBets: data.totalBetCount ?? prev[data.period].totalBets,
              totalBetAmount: data.totalBetAmount ?? data.totalBets ?? prev[data.period].totalBetAmount,
              winningNumber: data.winningNumber ?? prev[data.period].winningNumber,
              winningColor: data.color ?? data.winningColor ?? prev[data.period].winningColor,
              winningSize: data.size ?? data.winningSize ?? prev[data.period].winningSize,
              fullStats: prev[data.period].fullStats || {
                period: data.period,
                ttl: 0,
                expiresAt: new Date().toISOString(),
                totalBetAmount: data.totalBets || 0,
                totalBetCount: 0,
                totalByNumber: {},
                totalByColor: {},
                totalBySize: {},
                profitLossByNumber: {},
                updatedAt: new Date().toISOString(),
              } as any,
            } as RoundRow
          };
        });
      }
    };

    const handleRoundFinalized = (data: any) => {
      if (data?.period) {
        setRoundsMap(prev => {
          if (!prev[data.period]) return prev;
          return {
            ...prev,
            [data.period]: {
              ...prev[data.period],
              winningNumber: data.winningNumber ?? prev[data.period].winningNumber,
              winningColor: data.winningColor ?? data.color ?? prev[data.period].winningColor,
              winningSize: data.winningSize ?? data.size ?? prev[data.period].winningSize,
              fullStats: prev[data.period].fullStats || {
                period: data.period,
                ttl: 0,
                expiresAt: new Date().toISOString(),
                totalBetAmount: 0,
                totalBetCount: 0,
                totalByNumber: {},
                totalByColor: {},
                totalBySize: {},
                profitLossByNumber: {},
                updatedAt: new Date().toISOString(),
              } as any,
            } as RoundRow
          };
        });
      }
    };

    const handleAny = (eventName: string, ...args: any[]) => {
      console.log(`[Socket Event Received] ${eventName}:`, ...args);
    };

    socket.onAny(handleAny);
    socket.on("admin:game-stats", handleGameStats);
    socket.on("round:created", handleRoundCreated);
    socket.on("admin:round-closed", handleRoundClosed);
    socket.on("round:finalized", handleRoundFinalized);

    return () => {
      socket.offAny(handleAny);
      socket.off("admin:game-stats", handleGameStats);
      socket.off("round:created", handleRoundCreated);
      socket.off("admin:round-closed", handleRoundClosed);
      socket.off("round:finalized", handleRoundFinalized);
    };
  }, [token, socket, isConnected]);

  useEffect(() => {
    if (!token || !modalPeriod) return;

    const controller = new AbortController();

    const loadGameDetail = async () => {
      setGameDetailLoading(true);
      setGameDetailError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/admin/game-period/${modalPeriod}?page=${gameDetailPage}&limit=${gameDetailLimit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to load game bets (HTTP ${res.status})`);
        }

        const payload = await res.json();
        if (!payload?.success || !payload?.data) {
          throw new Error(payload?.message || 'Invalid game detail payload');
        }

        setGameDetail(payload.data as GamePeriodDetailResponse);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setGameDetailError(err?.message || 'Failed to load game bets');
        }
      } finally {
        setGameDetailLoading(false);
      }
    };

    loadGameDetail();

    return () => controller.abort();
  }, [token, modalPeriod, gameDetailPage, gameDetailLimit]);

  // Load first page of history when token is ready
  useEffect(() => {
    if (!token) return;
    fetchPage({ duration: activeTab, skip: 0, limit: entriesPerPage });
  }, [token, fetchPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetWinner = async (period: string) => {
    const selectEl = document.getElementById(`winner-select-${period}`) as HTMLSelectElement;
    if (!selectEl) return;
    
    const numberStr = selectEl.value;
    if (numberStr === '') {
      setToast({ msg: 'Please select a number first.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    const number = Number(numberStr);
    if (isNaN(number) || number < 0 || number > 9) {
      setToast({ msg: 'Invalid number. Must be between 0 and 9.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setSettingWinnerTarget(period);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ctbackend.crobstacle.com';
      const res = await fetch(`${API_BASE_URL}/api/admin/winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ period, selectedWinningNumber: number }),
      });
      if (!res.ok) throw new Error('Failed to set winner');
      setToast({ msg: `Winner set to ${number} for ${period}`, type: 'success' });
      setRoundsMap(prev => {
        if (!prev[period]) return prev;
        return {
          ...prev,
          [period]: {
            ...prev[period],
            winningNumber: number
          }
        };
      });
    } catch (e: any) {
      setToast({ msg: e.message || 'Error setting winner', type: 'error' });
    }
    setSettingWinnerTarget(null);
    setTimeout(() => setToast(null), 3000);
  };

  const currentTabState = derivedState[activeTab];
  const selectedModalRow = modalPeriod ? roundsMap[modalPeriod] || null : null;
  const selectedModalTheme = selectedModalRow
    ? DURATION_THEME[(selectedModalRow.gameLabel as '1m' | '3m' | '5m') || '1m']
    : DURATION_THEME['1m'];

  // All rounds for current tab (live + completed), filtered by search/status
  const nowDate = new Date(now);
  let filteredRounds = currentTabState.rounds.filter(r => {
    const matchesSearch = r.period.toLowerCase().includes(search.toLowerCase());
    const runtimeStatus = getRuntimeStatus(r, nowDate).displayStatus;
    const statusForFilter = runtimeStatus === 'Starting...' ? 'Scheduled' : runtimeStatus;
    const matchesStatus = statusFilter === 'All' || statusForFilter.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });
  filteredRounds.sort((a, b) => b.period.localeCompare(a.period));

  // Pagination is ALWAYS driven by backendPagination for history.
  // Show only truly live rows (current or immediate next period) on page 1.
  // This prevents stale old 'scheduled' rows from polluting the top of the list.
  const isCurrentOrNextRound = (row: RoundRow) => {
    const ids = getPeriodIds(nowDate, row.gameLabel);
    return row.period === ids.curr || row.period === ids.next;
  };
  
  // Rely purely on chronological clock to define what is "Live" rather than strict status string,
  // which might lag due to network latency, causing rounds to vanish.
  const liveRounds = filteredRounds.filter(r => isCurrentOrNextRound(r));
  
  // History rounds are anything logically in the past. 
  // We strictly slice this so when a live round finishes and shifts to history,
  // we drop the oldest row off the page locally without needing a refetch.
  const historyRounds = filteredRounds.filter(r => !isCurrentOrNextRound(r)).slice(0, entriesPerPage);

  // Total pages: backend tells us totalRecords for completed rounds.
  const totalRecords = backendPagination?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / entriesPerPage));

  // Display = live rows ONLY on page 1, strictly slice history rows to preserve counts
  const paginatedRounds = currentPage === 1 
    ? [...liveRounds, ...historyRounds] 
    : historyRounds;

  const getBorderColor = (label: string) => {
    if (label === '1m') return 'border-l-blue-500';
    if (label === '3m') return 'border-l-purple-500';
    if (label === '5m') return 'border-l-orange-500';
    return 'border-l-gray-500';
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Game Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor active rounds, past games, and manual settlements for Min 1, 3, and 5 variants.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 text-xs font-medium rounded-full border flex items-center gap-1.5 ${
            socketStatus.includes('OK') 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : socketStatus === 'Disconnected'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${socketStatus.includes('OK') ? 'bg-green-500 animate-pulse' : socketStatus === 'Disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
            Socket: {socketStatus}
          </div>
          <div className="bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap">
            History Rows:
            <span className="bg-white px-2 py-0.5 rounded shadow-sm text-blue-600 tabular-nums">
              {(durationTotals[activeTab] || totalRecords || 0).toLocaleString()}
            </span>
          </div>
          <button 
            onClick={() => fetchPage({ duration: activeTab, skip: (currentPage - 1) * entriesPerPage, limit: entriesPerPage })}
            disabled={refreshing}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition"
          >
            {refreshing ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            ) : <span>↻ REFRESH DATA</span>}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`p-3 rounded-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {toast.msg}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-6 border-b border-gray-200">
        {[
          { id: '1m', label: 'Game 1 (Min 1)' },
          { id: '3m', label: 'Game 2 (Min 3)' },
          { id: '5m', label: 'Game 3 (Min 5)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { 
               if (activeTab === tab.id) return;
               setActiveTab(tab.id as any); 
               setCurrentPage(1); 
               fetchPage({ duration: tab.id, skip: 0, limit: entriesPerPage });
            }}
            className={`pb-3 px-2 text-sm transition-colors cursor-pointer ${
              activeTab === tab.id 
                ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100">
        <div className="flex gap-4 items-center">
          <input 
            type="text" 
            placeholder="Search Period..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
             <span className="px-3 py-2 text-sm text-gray-500 border-r border-gray-200 bg-gray-50 hidden sm:block">Status</span>
             <select 
               value={statusFilter}
               onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
               className="px-3 py-2 text-sm focus:outline-none bg-transparent"
             >
               <option value="All">All</option>
               <option value="Running">Running</option>
               <option value="Scheduled">Scheduled</option>
               <option value="Completed">Completed</option>
               <option value="No Bets">No Bets</option>
               <option value="Closing...">Closing...</option>
             </select>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-500 hidden sm:block">
            Showing {historyRounds.length + (currentPage === 1 ? liveRounds.length : 0)} of {totalRecords + (currentPage === 1 ? liveRounds.length : 0)}
          </span>
          <select 
             value={entriesPerPage}
             onChange={(e) => { 
                const newLimit = Number(e.target.value);
                setEntriesPerPage(newLimit); 
                setCurrentPage(1);
                fetchPage({ duration: activeTab, skip: 0, limit: newLimit });
             }}
             className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white cursor-pointer"
          >
             <option value={5}>5 per page</option>
             <option value={10}>10 per page</option>
             <option value={25}>25 per page</option>
             <option value={50}>50 per page</option>
             <option value={100}>100 per page</option>
          </select>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const nextP = Math.max(1, currentPage - 1);
                if (nextP === currentPage) return;
                setCurrentPage(nextP);
                fetchPage({ duration: activeTab, skip: (nextP - 1) * entriesPerPage, limit: entriesPerPage });
              }}
              disabled={currentPage === 1 || refreshing}
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 transition-colors"
            >
              ◀ Prev
            </button>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500 pl-1">Page</span>
              <input 
                type="number"
                min={1}
                max={totalPages || 1}
                value={currentPage}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (isNaN(val)) return;
                  val = Math.max(1, Math.min(totalPages, val));
                  setCurrentPage(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchPage({ duration: activeTab, skip: (currentPage - 1) * entriesPerPage, limit: entriesPerPage });
                  }
                }}
                onBlur={() => {
                   fetchPage({ duration: activeTab, skip: (currentPage - 1) * entriesPerPage, limit: entriesPerPage });
                }}
                className="w-12 text-center border border-gray-300 rounded px-1 py-0.5 text-sm no-spinners bg-white"
              />
              <span className="text-sm text-gray-500 pr-1">of {totalPages || 1}</span>
            </div>
            <button 
              onClick={() => {
                const nextP = Math.min(totalPages, currentPage + 1);
                if (nextP === currentPage) return;
                setCurrentPage(nextP);
                fetchPage({ duration: activeTab, skip: (nextP - 1) * entriesPerPage, limit: entriesPerPage });
              }}
              disabled={currentPage === totalPages || totalPages === 0 || refreshing}
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 transition-colors"
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto relative min-h-[300px]">
        {refreshing && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none rounded-xl">
             <svg className="animate-spin h-8 w-8 text-blue-600 mb-2 shadow-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
             </svg>
             <span className="text-sm font-semibold text-gray-600 animate-pulse tracking-wide">Processing records...</span>
          </div>
        )}
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
               <th className="text-xs font-semibold text-gray-500 uppercase px-6 py-3 whitespace-nowrap">Period & Timer</th>
               <th className="text-xs font-semibold text-gray-500 uppercase px-6 py-3 whitespace-nowrap">Status</th>
               <th className="text-xs font-semibold text-gray-500 uppercase px-6 py-3 whitespace-nowrap">Total Bets</th>
               <th className="text-xs font-semibold text-gray-500 uppercase px-6 py-3 whitespace-nowrap">Net Profit</th>
               <th className="text-xs font-semibold text-gray-500 uppercase px-6 py-3 whitespace-nowrap">Distribution</th>
               <th className="text-xs font-semibold text-gray-500 uppercase px-6 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRounds.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No rounds found for the selected filters.</td>
              </tr>
            ) : (
              paginatedRounds.map(row => {
                const getStatusPill = (statusToRender: string) => {
                  switch (statusToRender) {
                    case 'Scheduled': return 'bg-blue-100 text-blue-700 shadow-sm';
                    case 'Starting...': return 'bg-cyan-100 text-cyan-700 shadow-sm animate-pulse';
                    case 'Running': return 'bg-green-100 text-green-700 shadow-sm';
                    case 'Bets Stopped': return 'bg-orange-100 text-orange-700 shadow-sm';
                    case 'Selecting Winner': return 'bg-purple-100 text-purple-700 shadow-sm animate-pulse';
                    case 'Closing...': return 'bg-red-100 text-red-700 shadow-sm animate-pulse';
                    case 'Completed': return 'bg-gray-100 text-gray-600 shadow-sm';
                    default: return 'bg-gray-100 text-gray-600';
                  }
                };

                const isExpanded = expandedPeriod === row.period;
                 const { displayStatus, activeTtl, isCurrent } = getRuntimeStatus(row, nowDate);

                const formatPeriodDate = (periodStr: string) => {
                  const p = periodStr.split('-');
                  if (p.length >= 3 && p[1].length === 8 && p[2].length >= 4) {
                     return `${p[1].slice(0,4)}-${p[1].slice(4,6)}-${p[1].slice(6,8)} ${p[2].slice(0,2)}:${p[2].slice(2,4)}`;
                  }
                  return '';
                };
                const dateStr = formatPeriodDate(row.period);

                return (
                  <React.Fragment key={row.period}>
                  <tr 
                    onClick={() => setExpandedPeriod(p => p === row.period ? null : row.period)}
                    className={`border-l-4 ${getBorderColor(row.gameLabel)} hover:bg-gray-50/50 transition-colors cursor-pointer group animate-[slideInRight_0.4s_ease-out]`}
                    style={{ animationFillMode: 'both' }}
                  >
                    
                    {/* Period & Timer */}
                    <td className="px-6 py-4">
                      {dateStr ? (
                         <div className="text-sm font-mono font-medium text-gray-900 mb-1.5">{dateStr}</div>
                      ) : (
                         <div className="text-sm font-mono font-medium text-gray-900 mb-1.5">{row.period.replace(/^[0-9]+m-/, '')}</div>
                      )}
                      {displayStatus !== 'Completed' && displayStatus !== 'Scheduled' && activeTtl >= 0 ? (
                         <span className="bg-green-500 text-white text-xs font-bold rounded-full px-2.5 py-0.5 inline-block w-[50px] text-center shadow-sm">
                           {String(Math.floor(activeTtl / 60)).padStart(2, '0')}:{String(activeTtl % 60).padStart(2, '0')}
                         </span>
                      ) : (
                         <span className="text-xs text-gray-400 w-[50px] inline-block text-center">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusPill(displayStatus)}`}>
                         {displayStatus}
                       </span>
                    </td>

                    {/* Total Bets */}
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm font-medium text-gray-900">
                         {row.totalBets > 0 ? row.totalBets : '—'}
                       </span>
                    </td>

                    {/* Net Profit */}
                    <td className="px-6 py-4 whitespace-nowrap">
                       {row.netProfit !== null ? (
                         <span className={`text-sm font-medium ${row.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {row.netProfit >= 0 ? '+' : ''}₹{row.netProfit.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                         </span>
                       ) : <span className="text-sm font-medium text-gray-400">—</span>}
                    </td>

                    {/* Distribution */}
                    <td className="px-6 py-4 w-48">
                      {row.distribution ? (
                        <div>
                          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 w-full max-w-[12rem] mb-1">
                            <div style={{ width: `${(row.distribution.red / row.distribution.total) * 100}%` }} className="bg-red-500"></div>
                            <div style={{ width: `${(row.distribution.green / row.distribution.total) * 100}%` }} className="bg-green-500"></div>
                            <div style={{ width: `${(row.distribution.violet / row.distribution.total) * 100}%` }} className="bg-purple-500"></div>
                          </div>
                          <div className="flex gap-2 text-[10px] text-gray-500 font-medium">
                            {row.distribution.red > 0 && <span className="text-red-600 font-bold">{Math.round((row.distribution.red / row.distribution.total) * 100)}%R</span>}
                            {row.distribution.green > 0 && <span className="text-green-600 font-bold">{Math.round((row.distribution.green / row.distribution.total) * 100)}%G</span>}
                            {row.distribution.violet > 0 && <span className="text-purple-600 font-bold">{Math.round((row.distribution.violet / row.distribution.total) * 100)}%V</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No data</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3 min-h-[32px]">
                        {isCurrent && activeTtl <= 20 && activeTtl > 5 && (
                          row.winningNumber === null || row.winningNumber === undefined ? (
                            <div className={`flex items-center gap-2 transition-all duration-500 ease-out ${activeTtl <= 15 ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-4 grayscale'}`}>
                              <select 
                                id={`winner-select-${row.period}`}
                                onClick={(e) => e.stopPropagation()}
                                disabled={activeTtl > 15}
                                className="border border-gray-300 text-gray-700 bg-white rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50"
                                defaultValue=""
                              >
                                <option value="" disabled>Select</option>
                                {[0,1,2,3,4,5,6,7,8,9].map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleSetWinner(row.period); }}
                                disabled={settingWinnerTarget === row.period || activeTtl > 15}
                                className="bg-blue-600 text-white font-medium text-xs rounded-lg px-3 py-1.5 flex items-center gap-1 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-gray-400 disabled:text-gray-100 shadow-sm"
                              >
                                {settingWinnerTarget === row.period ? (
                                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                ) : <span>🏆</span>}
                                Set
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold animate-[fadeIn_0.3s_ease-out]">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Winner: #{row.winningNumber}
                            </div>
                          )
                        )}
                        <span className={`text-gray-400 transform transition-transform duration-200 ml-2 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        {row.fullStats && (
                          <button
                            title="View Bets"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGameDetailPage(1);
                              setGameDetailLimit(25);
                              setGameDetail(null);
                              setGameDetailError(null);
                              setModalPeriod(row.period);
                            }}
                            className="bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700 transition-colors rounded-full p-1.5 shadow-sm ml-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>

                  {/* Expanded Detailed Dashboard */}
                  {isExpanded && row.fullStats && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={6} className="p-0 border-b border-gray-200 shadow-inner">
                        <UnifiedDashboardPanel row={row} inModal={false} onOpenModal={() => setModalPeriod(row.period)} />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup overlay */}
      {modalPeriod && selectedModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-md" onClick={() => { setModalPeriod(null); setGameDetail(null); setGameDetailError(null); }}></div>
          <div className="relative z-10 w-full max-w-7xl h-[92vh] overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl flex flex-col">
            <div className={`bg-gradient-to-r ${selectedModalTheme.accent} text-white px-6 sm:px-8 py-5 flex-shrink-0`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                      {selectedModalTheme.label}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-xs font-semibold">
                      Period {modalPeriod}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">Game Bets Explorer</h2>
                  <p className="mt-1 text-sm sm:text-base text-white/85 max-w-3xl">
                    Drill down into every bet for this round with page-level pagination and a duration-specific layout.
                  </p>
                </div>
                <button
                  onClick={() => { setModalPeriod(null); setGameDetail(null); setGameDetailError(null); }}
                  className="rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25 transition-colors border border-white/20"
                  aria-label="Close modal"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-50">
              <div className="grid gap-4 border-b border-slate-200 bg-white px-6 sm:px-8 py-5 lg:grid-cols-4">
                <div className={`rounded-2xl border ${selectedModalTheme.border} ${selectedModalTheme.soft} p-4 shadow-sm ${selectedModalTheme.glow}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bets</p>
                  <p className={`mt-2 text-2xl font-black ${selectedModalTheme.accentText}`}>{gameDetail?.summary.totalBets ?? selectedModalRow.totalBets ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stake</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formatMoney(gameDetail?.summary.totalBetAmount ?? selectedModalRow.totalBetAmount ?? 0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payout</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{formatMoney(gameDetail?.summary.totalPayout ?? 0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Result</p>
                  <p className="mt-2 text-lg font-black text-slate-900">
                    {selectedModalRow.winningNumber !== null && selectedModalRow.winningNumber !== undefined ? `#${selectedModalRow.winningNumber}` : 'Pending'}
                  </p>
                  <p className={`text-sm font-semibold ${selectedModalTheme.accentText}`}>
                    {selectedModalRow.status}
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col overflow-hidden px-6 sm:px-8 py-5">
                {gameDetailError && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {gameDetailError}
                  </div>
                )}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">{selectedModalTheme.label}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                      Won {gameDetail?.summary.wonCount ?? 0}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                      Lost {gameDetail?.summary.lostCount ?? 0}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                      Pending {gameDetail?.summary.pendingCount ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rows</label>
                    <select
                      value={gameDetailLimit}
                      onChange={(e) => {
                        setGameDetailPage(1);
                        setGameDetailLimit(Number(e.target.value));
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] flex-1 min-h-0">
                  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
                    <div className="border-b border-slate-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Bet list</h3>
                        <p className="text-xs text-slate-500">Fetched on demand for this period only.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-slate-50/80 rounded-xl border border-slate-200 p-1">
                          <button
                            disabled={gameDetailPage <= 1 || gameDetailLoading}
                            onClick={() => setGameDetailPage((p) => Math.max(1, p - 1))}
                            className="flex items-center justify-center h-7 w-7 rounded-lg bg-white text-slate-600 shadow-sm border border-slate-200 disabled:opacity-40 disabled:shadow-none hover:bg-slate-100 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer disabled:cursor-not-allowed"
                            title="Previous page"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          
                          <div className="flex items-center px-1 text-[11px] font-semibold text-slate-600 select-none whitespace-nowrap">
                            Page <span className="mx-1 text-slate-900 font-bold text-[12px]">{gameDetail?.pagination?.page || gameDetailPage}</span> of <span className="ml-1 text-slate-500">{gameDetail?.pagination?.totalPages || 1}</span>
                          </div>

                          <button
                            disabled={!gameDetail?.pagination || gameDetailPage >= gameDetail.pagination.totalPages || gameDetailLoading}
                            onClick={() => setGameDetailPage((p) => p + 1)}
                            className="flex items-center justify-center h-7 w-7 rounded-lg bg-white text-slate-600 shadow-sm border border-slate-200 disabled:opacity-40 disabled:shadow-none hover:bg-slate-100 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer disabled:cursor-not-allowed"
                            title="Next page"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                      {gameDetailLoading ? (
                        <div className="flex h-full items-center justify-center p-10 text-slate-500">
                          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                            <svg className="h-5 w-5 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Loading bets...
                          </div>
                        </div>
                      ) : (
                        <table className="w-full text-left">
                          <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                            <tr>
                              <th className="px-5 py-3">User</th>
                              <th className="px-5 py-3">Bet</th>
                              <th className="px-5 py-3">Stake</th>
                              <th className="px-5 py-3">Status</th>
                              <th className="px-5 py-3">Winnings</th>
                              <th className="px-5 py-3">Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(gameDetail?.bets || []).length > 0 ? (
                              gameDetail!.bets.map((bet) => {
                                const userName = bet.userId?.name || 'Unknown';
                                const userNumber = bet.userId?.number?.value ? `#${bet.userId.number.value}` : '';
                                const betValue = Array.isArray(bet.betValue) ? bet.betValue.join(', ') : String(bet.betValue || '-');
                                const statusStyles = bet.status === 'won'
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : bet.status === 'lost'
                                    ? 'bg-rose-100 text-rose-700 border-rose-200'
                                    : 'bg-amber-100 text-amber-700 border-amber-200';

                                return (
                                  <tr key={bet._id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-5 py-4">
                                      <div className="font-semibold text-slate-900">{userName}</div>
                                      <div className="text-xs text-slate-500">{userNumber || bet.period}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                        <span className={`h-2 w-2 rounded-full ${bet.betType === 'number' ? 'bg-indigo-500' : bet.betType === 'color' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                        {bet.betType.toUpperCase()} · {betValue}
                                      </div>
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-slate-900">{formatMoney(bet.betAmount)}</td>
                                    <td className="px-5 py-4">
                                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyles}`}>{bet.status}</span>
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-slate-900">{formatMoney(bet.winnings)}</td>
                                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                      {new Date(bet.createdAt).toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                                  No bets found for this game.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-medium text-slate-500">
                        Showing <span className="font-bold text-slate-900">{gameDetail?.bets.length || 0}</span> of <span className="font-bold text-slate-900">{gameDetail?.pagination?.total || 0}</span> bets
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 min-h-0">
                    <div className={`rounded-3xl border ${selectedModalTheme.border} ${selectedModalTheme.soft} p-5 shadow-sm`}>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-sm font-bold ${selectedModalTheme.accentText}`}>Bet type mix</h3>
                        <span className="text-xs font-semibold text-slate-500">Performance view</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {(['number', 'color', 'size'] as const).map((kind) => {
                          const stat = gameDetail?.summary.betTypeStats?.[kind];
                          return (
                            <div key={kind} className="rounded-2xl bg-white/80 border border-white px-4 py-3 shadow-sm">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-slate-700 capitalize">{kind}</span>
                                <span className="font-black text-slate-900">{stat?.count ?? 0}</span>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                <span>Stake {formatMoney(stat?.totalAmount ?? 0)}</span>
                                <span>Payout {formatMoney(stat?.totalWinnings ?? 0)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900">Round meta</h3>
                      <div className="mt-4 grid gap-3 text-sm">
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                          <span className="text-slate-500">Duration</span>
                          <span className="font-semibold text-slate-900">{selectedModalTheme.label}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                          <span className="text-slate-500">Game status</span>
                          <span className="font-semibold text-slate-900">{selectedModalRow.status}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                          <span className="text-slate-500">Scheduled at</span>
                          <span className="font-semibold text-slate-900">{selectedModalRow.period.replace(`${selectedModalRow.gameLabel}-`, '')}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                          <span className="text-slate-500">Winner</span>
                          <span className="font-semibold text-slate-900">
                            {selectedModalRow.winningNumber !== null && selectedModalRow.winningNumber !== undefined ? `#${selectedModalRow.winningNumber}` : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

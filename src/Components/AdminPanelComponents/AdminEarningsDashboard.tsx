'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarRange, CircleDollarSign, Filter, Trophy, Users } from 'lucide-react';

type UserLite = {
  _id: string;
  name: string;
  number?: {
    value?: string;
  };
};

type PlayerSummary = {
  userId: string;
  name: string;
  phone: string;
  totalBet: number;
  totalWon: number;
  netToAdmin: number;
  transactionsCount?: number;
};

type EarningsSummary = {
  totalBetAmount: number;
  totalWonByPlayers: number;
  totalCommissionFromGaming: number;
  totalPlayers: number;
};

type EarningsPagination = {
  page: number;
  limit: number;
  totalPlayers: number;
  totalPages: number;
};

type FiscalYearRange = {
  id: string;
  label: string;
  start: string;
  end: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ctbackend.crobstacle.com';

const formatMoney = (value: number) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getFiscalYearOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const list: FiscalYearRange[] = [];

  for (let startYear = currentYear - 2; startYear <= currentYear + 2; startYear += 1) {
    const fyStart = new Date(startYear, 3, 1); // Apr 1
    const fyEnd = new Date(startYear + 1, 2, 31); // Mar 31
    list.push({
      id: `FY${startYear}-${String(startYear + 1).slice(-2)}`,
      label: `FY ${startYear}-${String(startYear + 1).slice(-2)}`,
      start: toDateInput(fyStart),
      end: toDateInput(fyEnd),
    });
  }

  return list;
}

function mergeDateRange(startDate: string, endDate: string, fiscal: FiscalYearRange | null) {
  let start = startDate || '';
  let end = endDate || '';

  if (fiscal) {
    start = start ? (start > fiscal.start ? start : fiscal.start) : fiscal.start;
    end = end ? (end < fiscal.end ? end : fiscal.end) : fiscal.end;
  }

  if (start && end && start > end) {
    return { start: end, end: start };
  }

  return { start, end };
}

export default function AdminEarningsDashboard() {
  const [users, setUsers] = useState<UserLite[]>([]);
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalBetAmount: 0,
    totalWonByPlayers: 0,
    totalCommissionFromGaming: 0,
    totalPlayers: 0,
  });
  const [pagination, setPagination] = useState<EarningsPagination>({
    page: 1,
    limit: 20,
    totalPlayers: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fiscalYears = useMemo(() => getFiscalYearOptions(), []);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [nameSearch, setNameSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [jumpPage, setJumpPage] = useState('');

  const selectedFiscalRange = useMemo(
    () => fiscalYears.find((fy) => fy.id === selectedFiscalYear) || null,
    [fiscalYears, selectedFiscalYear]
  );

  const effectiveRange = useMemo(
    () => mergeDateRange(startDate, endDate, selectedFiscalRange),
    [startDate, endDate, selectedFiscalRange]
  );

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [selectedFiscalYear, selectedUserId, startDate, endDate, nameSearch]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ export: 'true', limit: '10000' });

        const res = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (json?.status === 'success' && Array.isArray(json?.data?.users)) {
          setUsers(json.data.users);
        } else {
          setUsers([]);
        }
      } catch (e) {
        console.error('Failed to fetch users for earnings filters', e);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
          sortBy: 'netToAdmin',
          sortOrder: 'desc',
        });

        if (effectiveRange.start) params.append('startDate', effectiveRange.start);
        if (effectiveRange.end) params.append('endDate', effectiveRange.end);
        if (selectedFiscalRange) {
          params.append('fiscalYearStart', selectedFiscalRange.start);
          params.append('fiscalYearEnd', selectedFiscalRange.end);
        }
        if (selectedUserId !== 'all') params.append('userId', selectedUserId);
        if (nameSearch.trim()) params.append('search', nameSearch.trim());

        const res = await fetch(`${API_BASE_URL}/api/admin/earnings-aggregate?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (json?.status === 'success' && json?.data) {
          setSummary({
            totalBetAmount: Number(json.data.summary?.totalBetAmount || 0),
            totalWonByPlayers: Number(json.data.summary?.totalWonByPlayers || 0),
            totalCommissionFromGaming: Number(json.data.summary?.totalCommissionFromGaming || 0),
            totalPlayers: Number(json.data.summary?.totalPlayers || 0),
          });
          setPlayers(Array.isArray(json.data.players) ? json.data.players : []);
          setPagination((prev) => ({
            ...prev,
            page: Number(json.data.pagination?.page || prev.page),
            limit: Number(json.data.pagination?.limit || prev.limit),
            totalPlayers: Number(json.data.pagination?.totalPlayers || 0),
            totalPages: Number(json.data.pagination?.totalPages || 0),
          }));
        } else {
          setSummary({ totalBetAmount: 0, totalWonByPlayers: 0, totalCommissionFromGaming: 0, totalPlayers: 0 });
          setPlayers([]);
          setPagination((prev) => ({ ...prev, totalPlayers: 0, totalPages: 0 }));
        }
      } catch (e) {
        console.error('Failed to fetch earnings aggregate', e);
        setError('Failed to load gaming earnings data.');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [
    effectiveRange.end,
    effectiveRange.start,
    nameSearch,
    pagination.limit,
    pagination.page,
    selectedFiscalRange,
    selectedUserId,
  ]);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gaming Earnings Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track admin gaming commission, player winnings, and player-wise profitability.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Search By Name</label>
          <input
            type="text"
            placeholder="Player name or phone..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Fiscal Year</label>
          <select
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Fiscal Years</option>
            {fiscalYears.map((fy) => (
              <option key={fy.id} value={fy.id}>
                {fy.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Date From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Date To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">User Selection</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Players</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name || 'Unknown'} ({user.number?.value || 'N/A'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold uppercase tracking-wider">
            <CircleDollarSign className="w-4 h-4" /> Gaming Commission Earned
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{formatMoney(summary.totalCommissionFromGaming)}</p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700 text-sm font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4" /> Total Won By Players
          </div>
          <p className="mt-2 text-2xl font-black text-blue-900">{formatMoney(summary.totalWonByPlayers)}</p>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center gap-2 text-indigo-700 text-sm font-bold uppercase tracking-wider">
            <CalendarRange className="w-4 h-4" /> Total Game Bet Volume
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-900">{formatMoney(summary.totalBetAmount)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-3 justify-between">
          <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" /> Player-wise Net (How Much Admin Won/Lost Per Player)
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Filter className="w-3 h-3" />
            {selectedFiscalRange
              ? `${selectedFiscalRange.label} • ${effectiveRange.start || '-'} to ${effectiveRange.end || '-'}`
              : `${effectiveRange.start || 'No start'} to ${effectiveRange.end || 'No end'}`}
          </div>
        </div>

        {loading || loadingUsers ? (
          <div className="p-10 text-center text-gray-500">
            <Activity className="w-6 h-6 mx-auto animate-spin mb-2" />
            Loading dashboard data...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : players.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No game transactions found for the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-gray-200 text-xs text-gray-500 tracking-wider uppercase">
                <tr>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3 text-right">Total Bet</th>
                  <th className="px-4 py-3 text-right">Total Won</th>
                  <th className="px-4 py-3 text-right">Net To Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {players.map((player) => (
                  <tr key={player.userId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{player.name}</p>
                      <p className="text-xs text-gray-500">{player.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatMoney(player.totalBet)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-700">{formatMoney(player.totalWon)}</td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        player.netToAdmin >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {formatMoney(player.netToAdmin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500">
                Page {pagination.page} of {pagination.totalPages || 0} • Total Players: {pagination.totalPlayers}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">Show</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) =>
                      setPagination((prev) => ({ ...prev, page: 1, limit: Number(e.target.value) }))
                    }
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
                    max={pagination.totalPages || 1}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const p = Number(jumpPage);
                        if (p >= 1 && p <= (pagination.totalPages || 1)) {
                          setPagination((prev) => ({ ...prev, page: p }));
                          setJumpPage('');
                        }
                      }
                    }}
                    className="w-14 text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                  />
                  <button
                    onClick={() => {
                      const p = Number(jumpPage);
                      if (p >= 1 && p <= (pagination.totalPages || 1)) {
                        setPagination((prev) => ({ ...prev, page: p }));
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
                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page <= 1 || loading}
                    className="px-3 py-1.5 text-xs font-bold rounded-md border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40"
                  >
                    « Prev
                  </button>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.totalPages || 1, prev.page + 1),
                      }))
                    }
                    disabled={pagination.page >= (pagination.totalPages || 1) || loading}
                    className="px-3 py-1.5 text-xs font-bold rounded-md border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next »
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

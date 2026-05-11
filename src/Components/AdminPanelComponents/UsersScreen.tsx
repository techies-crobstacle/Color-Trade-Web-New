'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type UserFromAPI = {
  _id: string;
  name: string;
  number: {
    value: string;
    verified: boolean;
  };
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type PaginationData = {
  page: number;
  totalPages: number;
  totalUsers: number;
};

export default function UsersScreen() {
  const [users, setUsers] = useState<UserFromAPI[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, totalPages: 1, totalUsers: 0 });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters State
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [jumpPage, setJumpPage] = useState('');

  const fetchUsers = useCallback(async (isExport = false) => {
    try {
      if (isExport) setExporting(true);
      else setLoading(true);

      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ctbackend.crobstacle.com';

      const params = new URLSearchParams();
      if (isExport) params.append('export', 'true');
      else {
        params.append('page', String(currentPage));
        params.append('limit', String(entriesPerPage));
      }
      
      params.append('sortBy', sortField);
      params.append('sortOrder', sortOrder);

      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedStatus !== 'All') params.append('status', selectedStatus.toLowerCase());

      const res = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      
      if (isExport) {
         if (json.status === 'success' && json.data?.users) {
           return json.data.users;
         }
         return [];
      }

      if (json.status === 'success' && json.data) {
        setUsers(json.data.users || []);
        setPagination({
           page: json.data.page || 1,
           totalPages: json.data.totalPages || 1,
           totalUsers: json.data.totalUsers || 0,
        });
      } else {
        setUsers([]);
        setPagination({ page: 1, totalPages: 1, totalUsers: 0 });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (isExport) setExporting(false);
      else setLoading(false);
    }
  }, [currentPage, entriesPerPage, searchQuery, startDate, endDate, selectedStatus, sortField, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleExport = async () => {
    const dataToExport = await fetchUsers(true);
    if (!dataToExport || dataToExport.length === 0) {
      alert("No data available to export.");
      return;
    }

    const wsData = dataToExport.map((user: UserFromAPI) => ({
      "Joined Date": new Date(user.createdAt).toLocaleString(),
      "User ID": user._id,
      "Name": user.name || 'Unknown',
      "Phone Number": user.number?.value || 'N/A',
      "Verified": user.number?.verified ? 'Yes' : 'No',
      "Status": user.isActive ? 'Active' : 'Banned',
      "Role": user.role ? user.role.toUpperCase() : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    
    worksheet['!cols'] = [
      { wch: 20 }, // Date
      { wch: 30 }, // ID
      { wch: 20 }, // Name
      { wch: 15 }, // Phone
      { wch: 10 }, // Verified
      { wch: 10 }, // Status
      { wch: 10 }, // Role
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Users_Export_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review active users, search records, and export registered players.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={handleExport}
             disabled={exporting}
             className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-emerald-100 transition shadow-sm disabled:opacity-50"
          >
             {exporting ? (
                 <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                 </svg>
             ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
             )}
             EXPORT EXCEL
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col xl:flex-row gap-4">
         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* User Search */}
            <div className="flex flex-col gap-1.5 lg:col-span-1">
               <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">User Search</label>
               <input 
                 type="text" 
                 placeholder="Name or phone..." 
                 value={searchQuery}
                 onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
               />
            </div>
            {/* Status */}
            <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Status</label>
               <select 
                 value={selectedStatus}
                 onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
               >
                 <option value="All">All Statuses</option>
                 <option value="active">Active</option>
                 <option value="banned">Banned</option>
               </select>
            </div>
            {/* Date Range Start */}
            <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Date From</label>
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
               />
            </div>
            {/* Date Range End */}
            <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Date To</label>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
               />
            </div>
         </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl mb-1 shadow-sm border border-gray-200">
         <div className="flex items-center gap-4 pl-3">
             <span className="text-sm font-semibold text-gray-700 bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-200">Total: {pagination.totalUsers} Users</span>
         </div>
         <div className="flex items-center gap-3">
           <div className="flex items-center gap-2">
             <span className="text-[11px] font-bold text-gray-500 uppercase">Sort</span>
             <select 
                value={sortField}
                onChange={(e) => { setSortField(e.target.value); setCurrentPage(1); }}
                className="border border-gray-200 bg-gray-50 rounded-lg px-2 py-1 text-sm outline-none w-32"
             >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
             </select>
             <button 
               onClick={() => { setSortOrder(p => p === 'asc' ? 'desc' : 'asc'); setCurrentPage(1); }}
               className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold"
               title="Toggle Direction"
             >
               {sortOrder === 'asc' ? 'ASC ↑' : 'DESC ↓'}
             </button>
           </div>
           |
           <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Show</span>
              <select 
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-gray-200 bg-gray-50 rounded-lg px-2 py-1 text-sm outline-none"
              >
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
           </div>
         </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none rounded-xl">
             <svg className="animate-spin h-8 w-8 text-blue-600 mb-2 shadow-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
             </svg>
             <span className="text-sm font-semibold text-gray-600 animate-pulse tracking-wide">Syncing Users...</span>
          </div>
        )}
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-gray-200 text-xs text-gray-500 tracking-wider">
            <tr>
               <th className="px-5 py-4 font-semibold uppercase">Joined Date & ID</th>
               <th className="px-5 py-4 font-semibold uppercase">Name</th>
               <th className="px-5 py-4 font-semibold uppercase">Phone</th>
               <th className="px-5 py-4 font-semibold uppercase text-center">Status</th>
               <th className="px-5 py-4 font-semibold uppercase text-center">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">No users found match your criteria.</td>
              </tr>
            ) : users.map(user => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-5 py-4 align-top">
                   <div className="font-semibold text-gray-900 mb-0.5">{new Date(user.createdAt).toLocaleString()}</div>
                   <div className="text-[11px] font-mono text-gray-500 bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100">{user._id.slice(-8)}</div>
                </td>
                <td className="px-5 py-4 align-top">
                   <div className="font-bold text-gray-800">{user.name || 'Unknown'}</div>
                </td>
                <td className="px-5 py-4 align-top">
                   <div className="text-slate-700 font-medium">{user.number?.value ? `#${user.number.value}` : 'N/A'}</div>
                   <div className="text-xs text-slate-500 mt-1">{user.number?.verified ? <span className="text-green-600 font-semibold">Verified</span> : <span className="text-yellow-600 font-semibold">Unverified</span>}</div>
                </td>
                <td className="px-5 py-4 align-top text-center">
                   <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm ${user.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                     {user.isActive ? 'Active' : 'Banned'}
                   </span>
                </td>
                <td className="px-5 py-4 align-top text-center">
                   <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                     {user.role}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Footer Pagination Strip */}
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex flex-wrap gap-4 items-center justify-between">
           <span className="text-xs font-semibold text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
           <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 border border-slate-200 bg-white px-2 py-1 rounded-lg">
               <span className="text-xs text-slate-500 font-medium">Jump to:</span>
               <input 
                 type="number" 
                 min={1} 
                 max={pagination.totalPages}
                 value={jumpPage}
                 onChange={(e) => setJumpPage(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     const p = Number(jumpPage);
                     if (p >= 1 && p <= pagination.totalPages) {
                       setCurrentPage(p);
                       setJumpPage('');
                     }
                   }
                 }}
                 className="w-12 text-sm border-b border-slate-300 focus:outline-none focus:border-blue-500 text-center px-1"
               />
               <button 
                 onClick={() => {
                   const p = Number(jumpPage);
                   if (p >= 1 && p <= pagination.totalPages) {
                     setCurrentPage(p);
                     setJumpPage('');
                   }
                 }}
                 className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
               >
                 GO
               </button>
             </div>
             
             <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
               <button 
                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                 disabled={currentPage <= 1 || loading}
                 className="px-3 py-1.5 text-xs font-bold text-slate-600 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-colors"
               >
                 « Prev
               </button>
               <button 
                 onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                 disabled={currentPage >= pagination.totalPages || loading}
                 className="px-3 py-1.5 text-xs font-bold text-slate-600 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-colors"
               >
                 Next »
               </button>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
}

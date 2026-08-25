"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { Users, TrendingUp, DollarSign, Award, Save, Settings2 } from 'lucide-react'

interface UserInfo {
  _id: string;
  name: string;
}

interface TopReferrer {
  _id: string;
  userId: UserInfo;
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  totalCommissions: number;
  totalBonuses: number;
}

interface AffiliateStats {
  totalUsers: number;
  usersWithReferrer: number;
  usersWithoutReferrer: number;
  totalCommissionsPaid: number;
  totalCommissionsCount: number;
  topReferrers: TopReferrer[];
}

interface AffiliateSettings {
  _id: string;
  level1CommissionPercent: number;
  level2CommissionPercent: number;
  level3CommissionPercent: number;
  level1SignupBonus: number;
  level2SignupBonus: number;
  level3SignupBonus: number;
  gameWinningFeeType: "fixed" | "percent";
  gameWinningFeeValue: number;
  withdrawalFeeType: "fixed" | "percent";
  withdrawalFeeValue: number;
  depositGatewayFeeType: "fixed" | "percent";
  depositGatewayFeeValue: number;
  withdrawalGatewayFeeType: "fixed" | "percent";
  withdrawalGatewayFeeValue: number;
  updatedAt: string;
  createdAt: string;
  updatedBy?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ctbackend.realdaddygame.com';

const normalizeSettingsPayload = (raw: any): AffiliateSettings | null => {
  if (!raw || typeof raw !== 'object') return null;

  // Supports both:
  // 1) flat payload from /api/admin/commissions
  // 2) nested payload from /api/affiliate/settings
  const hasNested = raw.commissions && raw.signupBonuses;

  const level1CommissionPercent = Number(
    hasNested ? raw.commissions?.level1 : raw.level1CommissionPercent
  );
  const level2CommissionPercent = Number(
    hasNested ? raw.commissions?.level2 : raw.level2CommissionPercent
  );
  const level3CommissionPercent = Number(
    hasNested ? raw.commissions?.level3 : raw.level3CommissionPercent
  );

  const level1SignupBonus = Number(
    hasNested ? raw.signupBonuses?.level1 : raw.level1SignupBonus
  );
  const level2SignupBonus = Number(
    hasNested ? raw.signupBonuses?.level2 : raw.level2SignupBonus
  );
  const level3SignupBonus = Number(
    hasNested ? raw.signupBonuses?.level3 : raw.level3SignupBonus
  );

  const numbers = [
    level1CommissionPercent,
    level2CommissionPercent,
    level3CommissionPercent,
    level1SignupBonus,
    level2SignupBonus,
    level3SignupBonus,
    Number(raw.gameWinningFeeValue ?? 0),
    Number(raw.withdrawalFeeValue ?? 0),
    Number(raw.depositGatewayFeeValue ?? 0),
    Number(raw.withdrawalGatewayFeeValue ?? 0),
  ];

  if (numbers.some((n) => Number.isNaN(n))) return null;

  return {
    _id: String(raw._id || ''),
    level1CommissionPercent,
    level2CommissionPercent,
    level3CommissionPercent,
    level1SignupBonus,
    level2SignupBonus,
    level3SignupBonus,
    gameWinningFeeType: raw.gameWinningFeeType === "fixed" ? "fixed" : "percent",
    gameWinningFeeValue: Number(raw.gameWinningFeeValue ?? 0),
    withdrawalFeeType: raw.withdrawalFeeType === "fixed" ? "fixed" : "percent",
    withdrawalFeeValue: Number(raw.withdrawalFeeValue ?? 0),
    depositGatewayFeeType: raw.depositGatewayFeeType === "fixed" ? "fixed" : "percent",
    depositGatewayFeeValue: Number(raw.depositGatewayFeeValue ?? 0),
    withdrawalGatewayFeeType: raw.withdrawalGatewayFeeType === "fixed" ? "fixed" : "percent",
    withdrawalGatewayFeeValue: Number(raw.withdrawalGatewayFeeValue ?? 0),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedBy: raw.updatedBy,
  };
};

const Setting = () => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [settings, setSettings] = useState<AffiliateSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAffiliateStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/affiliate/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.status === 'success') {
        setStats(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError('An error occurred while fetching statistics');
      console.error('Error fetching affiliate stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAffiliateSettings = useCallback(async () => {
    try {
      setSettingsLoading(true);
      setSettingsError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/commissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const normalized = normalizeSettingsPayload(result.data);
        if (!normalized) {
          setSettingsError('Invalid settings payload received from server');
          return;
        }
        setSettings(normalized);
        setSettingsError(null);
      } else {
        setSettingsError(result.message || 'Failed to fetch settings');
      }
    } catch (err) {
      setSettingsError('An error occurred while fetching settings');
      console.error('Error fetching affiliate settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const updateAffiliateSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setSettingsError(null);
      setSuccessMessage(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/commissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          level1CommissionPercent: settings.level1CommissionPercent,
          level2CommissionPercent: settings.level2CommissionPercent,
          level3CommissionPercent: settings.level3CommissionPercent,
          level1SignupBonus: settings.level1SignupBonus,
          level2SignupBonus: settings.level2SignupBonus,
          level3SignupBonus: settings.level3SignupBonus,
          gameWinningFeeType: settings.gameWinningFeeType,
          gameWinningFeeValue: settings.gameWinningFeeValue,
          withdrawalFeeType: settings.withdrawalFeeType,
          withdrawalFeeValue: settings.withdrawalFeeValue,
          depositGatewayFeeType: settings.depositGatewayFeeType,
          depositGatewayFeeValue: settings.depositGatewayFeeValue,
          withdrawalGatewayFeeType: settings.withdrawalGatewayFeeType,
          withdrawalGatewayFeeValue: settings.withdrawalGatewayFeeValue,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const normalized = normalizeSettingsPayload(result.data);
        if (!normalized) {
          setSettingsError('Invalid updated settings payload received from server');
          return;
        }
        setSettings(normalized);
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setSettingsError(result.message || 'Failed to update settings');
      }
    } catch (err) {
      setSettingsError('An error occurred while updating settings');
      console.error('Error updating affiliate settings:', err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAffiliateStats();
    fetchAffiliateSettings();
  }, [fetchAffiliateStats, fetchAffiliateSettings]);

  if (loading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading statistics</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Affiliate Statistics</h2>
        <button
          onClick={fetchAffiliateStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">With Referrer</p>
              <p className="text-3xl font-bold mt-2">{stats.usersWithReferrer}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Commissions Paid</p>
              <p className="text-3xl font-bold mt-2">₹{stats.totalCommissionsPaid.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Commissions</p>
              <p className="text-3xl font-bold mt-2">{stats.totalCommissionsCount}</p>
            </div>
            <Award className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Top Referrers Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Top Referrers</h3>
          <p className="text-sm text-gray-500 mt-1">All users with their referral statistics</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referral Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonuses
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topReferrers.length > 0 ? (
                stats.topReferrers.map((referrer, index) => (
                  <tr key={referrer._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {referrer.userId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {referrer.userId.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {referrer.referralCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {referrer.totalReferrals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{referrer.totalEarnings.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{referrer.totalCommissions.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{referrer.totalBonuses.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No referrers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Affiliate Settings Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Affiliate Settings</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">Configure commission percentages and signup bonuses for referral levels</p>
        </div>

        {settingsError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {settingsError}
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        {settings && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Commission Percentages */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Commission Percentages (%)</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level 1 Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.level1CommissionPercent}
                    onChange={(e) => setSettings({
                      ...settings,
                      level1CommissionPercent: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level 2 Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.level2CommissionPercent}
                    onChange={(e) => setSettings({
                      ...settings,
                      level2CommissionPercent: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level 3 Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.level3CommissionPercent}
                    onChange={(e) => setSettings({
                      ...settings,
                      level3CommissionPercent: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Signup Bonuses */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Signup Bonuses (₹)</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level 1 Signup Bonus (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={settings.level1SignupBonus}
                    onChange={(e) => setSettings({
                      ...settings,
                      level1SignupBonus: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level 2 Signup Bonus (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={settings.level2SignupBonus}
                    onChange={(e) => setSettings({
                      ...settings,
                      level2SignupBonus: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level 3 Signup Bonus (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={settings.level3SignupBonus}
                    onChange={(e) => setSettings({
                      ...settings,
                      level3SignupBonus: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Platform Fees
              </h4>
              <p className="text-sm text-gray-500 mb-5">
                These admin charges apply to net game payouts and withdrawal requests.
                Choose a fixed rupee amount or percentage.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-gray-200 p-4">
                  <h5 className="font-medium text-gray-800 mb-4">Game Winning Fee</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={settings.gameWinningFeeType}
                        onChange={(e) => setSettings({
                          ...settings,
                          gameWinningFeeType: e.target.value as "fixed" | "percent"
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value {settings.gameWinningFeeType === "percent" ? "(%)" : "(₹)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={settings.gameWinningFeeType === "percent" ? 100 : undefined}
                        step={settings.gameWinningFeeType === "percent" ? "0.1" : "1"}
                        value={settings.gameWinningFeeValue}
                        onChange={(e) => setSettings({
                          ...settings,
                          gameWinningFeeValue: parseFloat(e.target.value) || 0
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Example: if user wins ₹100 and fee is 4%, ₹4 is charged and ₹96 is credited.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h5 className="font-medium text-gray-800 mb-4">Withdrawal Fee</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={settings.withdrawalFeeType}
                        onChange={(e) => setSettings({
                          ...settings,
                          withdrawalFeeType: e.target.value as "fixed" | "percent"
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value {settings.withdrawalFeeType === "percent" ? "(%)" : "(₹)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={settings.withdrawalFeeType === "percent" ? 100 : undefined}
                        step={settings.withdrawalFeeType === "percent" ? "0.1" : "1"}
                        value={settings.withdrawalFeeValue}
                        onChange={(e) => setSettings({
                          ...settings,
                          withdrawalFeeValue: parseFloat(e.target.value) || 0
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Example: if user withdraws ₹500 and fee is ₹4, wallet debit is ₹504.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Payment Gateway Costs
              </h4>
              <p className="text-sm text-gray-500 mb-5">
                These are costs charged to admin by the payment gateway. They do not reduce
                the wallet amount shown to users, but they appear in admin money-flow reports.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-gray-200 p-4">
                  <h5 className="font-medium text-gray-800 mb-4">Deposit Gateway Cost</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={settings.depositGatewayFeeType}
                        onChange={(e) => setSettings({
                          ...settings,
                          depositGatewayFeeType: e.target.value as "fixed" | "percent"
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value {settings.depositGatewayFeeType === "percent" ? "(%)" : "(₹)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={settings.depositGatewayFeeType === "percent" ? 100 : undefined}
                        step={settings.depositGatewayFeeType === "percent" ? "0.1" : "1"}
                        value={settings.depositGatewayFeeValue}
                        onChange={(e) => setSettings({
                          ...settings,
                          depositGatewayFeeValue: parseFloat(e.target.value) || 0
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Example: user deposits ₹500, wallet shows ₹500, gateway cost 2% means admin net received is ₹490.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h5 className="font-medium text-gray-800 mb-4">Withdrawal Gateway Cost</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={settings.withdrawalGatewayFeeType}
                        onChange={(e) => setSettings({
                          ...settings,
                          withdrawalGatewayFeeType: e.target.value as "fixed" | "percent"
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value {settings.withdrawalGatewayFeeType === "percent" ? "(%)" : "(₹)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={settings.withdrawalGatewayFeeType === "percent" ? 100 : undefined}
                        step={settings.withdrawalGatewayFeeType === "percent" ? "0.1" : "1"}
                        value={settings.withdrawalGatewayFeeValue}
                        onChange={(e) => setSettings({
                          ...settings,
                          withdrawalGatewayFeeValue: parseFloat(e.target.value) || 0
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Example: user withdraws ₹500, gateway cost ₹4 means admin cash out is tracked as ₹504.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={updateAffiliateSettings}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            {/* Last Updated Info */}
            <div className="mt-4 text-xs text-gray-500 text-right">
              Last updated: {new Date(settings.updatedAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Setting

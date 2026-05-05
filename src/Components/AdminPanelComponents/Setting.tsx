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
  updatedAt: string;
  createdAt: string;
  updatedBy?: string;
}

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
      
      const response = await fetch(`https://ctbackend.crobstacle.com/api/affiliate/statistics`, {
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
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://ctbackend.crobstacle.com/api/affiliate/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSettings(result.data);
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
      setSuccessMessage(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://ctbackend.crobstacle.com/api/affiliate/settings`, {
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
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSettings(result.data);
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
              <p className="text-3xl font-bold mt-2">₹{stats.totalCommissionsPaid}</p>
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

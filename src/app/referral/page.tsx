'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useLayout } from '@/contexts/LayoutContext';

const ReferralPage = () => {
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { setShowHeaderFooter } = useLayout();

  const referralCode = referralData?.data?.referralCode || '';
  const referralLink = `https://yourwebsite.com/register?ref=${referralCode}`;

  useEffect(() => {
    fetchReferrals();
  }, []);

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ctbackend.crobstacle.com';
      const res = await fetch(`${API_BASE}/api/affiliate/my-referrals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setReferralData(data);
      } else {
        setError(data?.message || 'Failed to fetch referral data');
      }
    } catch (err) {
      setError('Unable to connect. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success('Referral code copied!');
    } catch (err) {
      toast.error('Failed to copy referral code');
    }
  };

  const handleBackButtonClick = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#242424]">
      {/* Header */}
      <div className="bg-[#333332] px-3 sm:px-5">
        <div className="relative flex items-center justify-between py-3">
          <button onClick={handleBackButtonClick} className="w-4 sm:w-5">
            <Image
              src="/back-white.png"
              alt="back-button"
              width={100}
              height={100}
              className="w-4 sm:w-5"
            />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-white absolute left-1/2 -translate-x-1/2">
            Referral
          </h1>
          <div className="w-8 sm:w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            {/* Referral Code Card */}
            <div className="bg-[#333332] rounded-2xl p-6 mt-3">
              <p className="text-gray-400 text-sm mb-3">Your Referral Code</p>

              {/* Code Row — light pill with copy icon */}
              <div className="flex items-center justify-between bg-[#4d4d4c] rounded-xl px-5 py-4">
                <span className="text-white text-xl font-semibold tracking-[0.3em]">
                  {referralCode || '------'}
                </span>
                <button
                  onClick={copyReferralCode}
                  title="copy"
                  className="text-gray-300 hover:text-gray-500 transition ml-4 flex-shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Referral Tree */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Referral Tree
              </h2>

              {referralData?.data?.directReferrals?.length > 0 ? (
                <div className="space-y-4">
                  {referralData.data.directReferrals.map(
                    (referral: any, index: number) => (
                      <div
                        key={index}
                        className="bg-[#333332] border border-[#4a4a4a] rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">
                              {referral.name || 'Unnamed User'}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              {referral.number || 'No Number'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#c4832f] font-semibold">
                              ₹{referral.earnings || 0}
                            </p>
                            <p className="text-gray-500 text-xs">Earnings</p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="bg-[#333332] rounded-2xl p-10 text-center">
                  <h3 className="text-white text-lg font-semibold">
                    No referrals yet
                  </h3>
                  <p className="text-gray-400 mt-2 text-sm">
                    Share your referral code to invite friends and earn rewards.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReferralPage;
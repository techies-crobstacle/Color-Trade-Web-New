"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Announcement {
  _id: string;
  title: string;
  description: string;
  state?: string;
  scheduledAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HomePopupProps {
  onClose: () => void;
}

export default function HomePopup({ onClose }: HomePopupProps) {
  const [visible, setVisible] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Slight delay so the entrance animation plays
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";
        const response = await fetch(`${API_BASE}/api/announcements?isActive=true`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.status === 'success' && result.data?.items) {
          // Filter only active announcements
          const activeAnnouncements = result.data.items.filter((ann: Announcement) => ann.isActive);
          setAnnouncements(activeAnnouncements);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleClose = () => {
    setVisible(false);
    // Wait for fade-out before unmounting
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={handleClose}
      />

      {/* Popup Card + close button wrapper */}
      <div
        className={`relative z-10 w-full max-w-sm flex flex-col items-center transform transition-transform duration-300 ${
          visible ? "scale-100" : "scale-90"
        }`}
      >
      <div className="w-full bg-[#333332] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[linear-gradient(90deg,#FAE59F_0%,#C4933F_100%)] flex-grid px-5 py-3 text-center">
          <h2 className="text-white text-2xl font-bold tracking-wide">
            AR Notice
          </h2>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : announcements.length > 0 ? (
            <div className="rounded-xl p-4">
              <div className="flex flex-col gap-2 text-sm text-white">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-[#C4933F]">{announcement.title}:</span>
                      <span className="text-white"> {announcement.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4">
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span>1 Min, 3 Min &amp; 5 Min games available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span>Deposit &amp; withdraw anytime from your wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span>Check bet history to track your performance</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Close button — centered below the card */}
      <button
        onClick={handleClose}
        aria-label="Close popup"
        className="mt-2 opacity-90 hover:opacity-100 active:scale-95 transition-all duration-200"
      >
        <Image
          src="/cross-circle.svg"
          alt="Close"
          width={48}
          height={48}
        />
      </button>

    </div>
    </div>
  );
}

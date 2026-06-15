"use client";
import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  const { setShowHeaderFooter } = useLayout();
  const [profile, setProfile] = useState<{
    name: string;
    number: string;
    uid?: string;
  } | null>(null);

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token
        if (!token) {
          console.error("No token found — redirecting to login.");
          window.location.href = "/login"; // redirect if no token
          return;
        }

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";
        const response = await fetch(`${API_BASE}/api/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // attach token
          }
        });

        if (!response.ok) throw new Error("Failed to fetch profile");
        const result = await response.json();

        if (result.success) {
          setProfile({
            name: result.data.name,
            number: result.data.number.value,
            uid: result.data._id,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleBackButtonClick = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#242424] pb-6">
      {/* Section 1 - Header */}
      <div className="bg-[linear-gradient(90deg,#FAE59F_0%,#C4933F_100%)] rounded-b-[3rem] sm:rounded-b-[4rem] px-4 sm:px-5 pt-2 pb-44 sm:pb-52">
        <div className="relative">
          <h1 className="text-xl sm:text-2xl text-center text-gray-700 font-semibold">My Profile</h1>
          {/* Back button */}
          <button
            onClick={handleBackButtonClick}
            className="absolute left-0 top-[5px] sm:top-[7px]"
          >
            <Image
              src="/left-arrow.png"
              alt="back-button"
              width={100}
              height={100}
              className="w-4 sm:w-5"
            />
          </button>
        </div>
      </div>

      {/* Section 2 - Profile Card */}
      <div className="px-3 sm:px-5 my-7">
        <div className="bg-[#4d4d4c] z-10 rounded-lg shadow-lg p-4 sm:p-5 -mt-36 sm:-mt-40 text-center">
          <div className="flex justify-center">
            <Image
              className="rounded-full w-28 sm:w-36"
              src="/avatar2.png"
              width={512}
              height={512}
              alt="Avatar"
            />
          </div>

          {/* Name */}
          <div className="bg-[#333332] text-white flex justify-between items-center p-3 sm:p-4 rounded-2xl mt-8 sm:mt-10 my-3">
            <h1 className="font-bold text-sm sm:text-base">NICKNAME</h1>
            <div className="flex gap-2 items-center">
              <p className="font-semibold hover:border-b-2 text-[#c4832f] border-black text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                {profile?.name || "Loading..."}
              </p>
              <Image
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                src="/edit.png"
                width={100}
                height={100}
                alt="Edit"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="bg-[#333332] text-white flex justify-between items-center p-3 sm:p-4 rounded-2xl my-3">
            <h1 className="font-bold text-sm sm:text-base">PHONE NUMBER</h1>
            <div className="flex gap-2 items-center">
              <p className="font-semibold hover:border-b-2 text-[#c4832f] border-black text-sm sm:text-base">
                {profile?.number || "Loading..."}
              </p>
              <Image
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                src="/copy.png"
                width={100}
                height={100}
                alt="Copy"
              />
            </div>
          </div>

          {/* UID */}
          <div className="bg-[#333332] text-white flex justify-between items-center p-3 sm:p-4 rounded-2xl my-3">
            <h1 className="font-bold text-sm sm:text-base">UID</h1>
            <div className="flex gap-2 items-center">
              <p className="font-semibold hover:border-b-2 text-[#c4832f] border-black text-xs sm:text-base truncate max-w-[150px] sm:max-w-none">
                {profile?.uid || "Loading..."}
              </p>
              <Image
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                src="/copy.png"
                width={100}
                height={100}
                alt="Copy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 - Security Information */}
      <div className="px-3 sm:px-5 my-7">
        <h1 className="text-base text-white sm:text-lg font-bold border-l-4 pl-3 border-r">
          Profile Information
        </h1>

        {/* Bank Details */}
        <Link
          href="/bankdetails"
          className="bg-[#333332] flex justify-between rounded-2xl my-4 sm:my-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center p-3 gap-2 sm:gap-3">
            <Image
              className="w-6 h-6 sm:w-7 sm:h-7"
              src="/bankcard.png"
              width={100}
              height={100}
              alt="Bank Details"
            />
            <h1 className="font-semibold text-white text-base sm:text-lg">Bank Details</h1>
          </div>
          <div className="flex items-center p-3 gap-2 sm:gap-3">
            <h1 className="text-sm sm:text-lg text-gray-300">Edit</h1>
            <Image
              className="w-5 h-5 sm:w-7 sm:h-7"
              src="/next.png"
              width={100}
              height={100}
              alt="Next"
            />
          </div>
        </Link>
        
        {/* Login Password */}
        <Link
          href="/changepassword"
          className="bg-[#333332] flex justify-between rounded-2xl my-4 sm:my-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center p-3 gap-2 sm:gap-3">
            <Image
              className="w-6 h-6 sm:w-7 sm:h-7"
              src="/reset.png"
              width={100}
              height={100}
              alt="Reset Password"
            />
            <h1 className="font-semibold  text-white text-base sm:text-lg">Login Password</h1>
          </div>
          <div className="flex items-center p-3 gap-2 sm:gap-3">
            <h1 className="text-sm sm:text-lg text-gray-300">Edit</h1>
            <Image
              className="w-5 h-5 sm:w-7 sm:h-7"
              src="/next.png"
              width={100}
              height={100}
              alt="Next"
            />
          </div>
        </Link>

        {/* Update Version */}
        <div className="bg-[#333332] flex justify-between rounded-2xl my-4 sm:my-5 shadow-sm">
          <div className="flex items-center p-3 gap-2 sm:gap-3">
            <Image
              className="w-6 h-6 sm:w-7 sm:h-7"
              src="/update.png"
              width={100}
              height={100}
              alt="Update"
            />
            <h1 className="font-semibold text-white text-base sm:text-lg">Update version</h1>
          </div>
          <div className="flex items-center p-3 gap-2 sm:gap-3">
            <h1 className="text-sm sm:text-lg text-gray-300">2.0.6</h1>
            <Image
              className="w-5 h-5 sm:w-7 sm:h-7"
              src="/next.png"
              width={100}
              height={100}
              alt="Next"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
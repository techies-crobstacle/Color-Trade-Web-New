"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
// import Image from "next/image";
import Link from "next/link";

export default function DepositSuccess() {
  const router = useRouter();
  const { refreshBalance } = useSocket();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh balance to show updated amount
    refreshBalance();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/wallet");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, refreshBalance]);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg 
              className="w-10 h-10 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your deposit has been processed successfully. Your wallet balance will be updated shortly.
        </p>

        {/* Countdown */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            Redirecting to wallet in <span className="font-bold text-2xl">{countdown}</span> seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/wallet"
            className="block w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Go to Wallet Now
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-green-500 text-green-500 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md w-full">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> It may take a few moments for your balance to reflect. 
          If you don&apos;t see the update within 5 minutes, please contact support.
        </p>
      </div>
    </div>
  );
}

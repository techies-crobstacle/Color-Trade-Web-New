"use client";

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useSocket } from "@/contexts/SocketContext";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

const Page = () => {
  const { setShowHeaderFooter } = useLayout();
  const { balance} = useSocket();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);





const handleDeposit = async () => {
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    toast.error("Please enter a valid deposit amount.");
    return;
  }
  
  setLoading(true);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized: No token found. Please log in again.");
      setLoading(false);
      return;
    }

    // Optional: Extract userId from JWT token (if your token has it)
    let userId;
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      userId = tokenPayload.userId || tokenPayload.id || tokenPayload.sub;
    } catch (e) {
      console.log('Could not extract userId from token:', e);
      // Continue anyway - userId is optional
    }

    console.log('Initiating deposit:', { amount: Number(amount), userId });

    // Call payment initiation API
    const response = await fetch("https://ctbackend.crobstacle.com/api/wallet/deposit/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        amount: Number(amount),
        userId: userId, // Optional - for logging/tracking
      }),
    });

    const result = await response.json();
    console.log('Payment initiation response:', JSON.stringify(result, null, 2));

    // Handle various response shapes from the external API
    const paymentUrl = 
      result.paymentUrl || 
      result.pay_url || 
      result.paymentLink || 
      result.redirectUrl || 
      result.url ||
      result.data?.paymentUrl ||
      result.data?.pay_url;

    const isSuccess = 
      result.success === true || 
      result.status === 'success' || 
      result.status === 1 ||
      result.code === 200 ||
      (response.ok && paymentUrl);

    if (isSuccess && paymentUrl) {
      console.log('Redirecting to payment gateway...');
      toast.success("Redirecting to payment gateway...");
      window.location.href = paymentUrl;
    } else {
      const errMsg = result.message || result.msg || result.error || "Try again later";
      toast.error(`Payment failed: ${errMsg}`);
      console.error('Payment initiation failed:', result);
    }
  } catch (error) {
    toast.error("Error processing deposit. Please try again.");
    console.error('Deposit error:', error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white flex justify-between py-3 px-3 items-center">
        <Link href="/wallet">
          <Image
            className="w-5 h-5"
            src="/left-arrow.png"
            width={500}
            height={500}
            alt="Back"
          />
        </Link>
        <h1 className="text-lg sm:text-xl font-semibold">Deposit</h1>
        <div className="w-5"></div>
      </div>

      <div className="bg-green-50 min-h-screen pb-6">
        {/* Balance Section */}
        <div className="p-4 sm:p-5 bg-[url('/bannerbg.png')] bg-cover mx-3 sm:mx-4 mt-3 rounded-xl shadow-md">
          <div className="flex items-center gap-2">
            <Image src="/walet.png" width={20} height={20} alt="Wallet" className="w-5 h-5" />
            <h1 className="text-white text-base sm:text-xl">Balance</h1>
          </div>
          <div className="flex items-center gap-3 mt-2 mb-12 sm:mb-16">
            <h1 className="text-white text-2xl sm:text-3xl font-bold">
              {balance === null ? "Loading..." : `₹ ${balance.toFixed(2)}`}
            </h1>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-green-500 w-28 sm:w-32 mx-3 sm:mx-4 rounded-xl flex justify-center py-4 sm:py-5 my-4 sm:my-5">
          <Image
            className="w-10 sm:w-12"
            src="/upi.png"
            width={500}
            height={500}
            alt="UPI"
          />
        </div>

        {/* Deposit Amount Section */}
        <div className="bg-white rounded-xl mx-3 sm:mx-4 pb-5 sm:pb-6 px-2 sm:px-3 my-4">
          <div className="flex items-center p-2 sm:p-3 gap-2 sm:gap-3">
            <Image
              className="w-6 sm:w-7"
              src="/selectr.png"
              width={500}
              height={500}
              alt="Deposit Icon"
            />
            <h1 className="text-base sm:text-lg font-semibold">Deposit Amount</h1>
          </div>

          {/* Amount Buttons */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 px-2 sm:px-0">
            {[
              "350",
              "1000",
              "2000",
              "5000",
              "10000",
              "25000",
              "40000",
              "75000",
              "100000",
            ].map((value) => (
              <button
                key={value}
                className={`border-2 p-2 rounded-xl flex justify-center items-center hover:bg-green-500 hover:text-white text-base sm:text-xl transition-colors ${
                  amount === value
                    ? "bg-green-500 text-white border-green-500"
                    : "border-green-500 text-green-600"
                }`}
                onClick={() => setAmount(value)}
              >
                ₹{value}
              </button>
            ))}
          </div>

          {/* Input Field */}
          <div className="mx-2 sm:mx-4 mt-4">
            <input
              className="p-2 sm:p-3 w-full bg-green-100 rounded-lg border-l-2 border-black text-sm sm:text-base"
              placeholder="Enter or select recharge amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
            />
            <button
              className="w-full bg-green-500 p-2 sm:p-3 mt-4 sm:mt-5 text-white font-bold text-base sm:text-lg rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeposit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Deposit"}
            </button>
          </div>
        </div>

        {/* Deposit Instruction */}
        <div className="bg-white rounded-xl mx-3 sm:mx-4 pb-5 sm:pb-6 my-4">
          <div className="flex items-center p-2 sm:p-3 gap-2 sm:gap-3">
            <Image
              className="w-6 sm:w-7"
              src="/selectr.png"
              width={500}
              height={500}
              alt="Instructions"
            />
            <h1 className="text-base sm:text-lg font-semibold">Deposit Instruction</h1>
          </div>
          <div className="border-2 p-3 sm:p-4 mx-2 rounded-xl">
            <ul className="text-gray-400 text-xs sm:text-sm font-semibold space-y-1">
              <li>Don&apos;t Save Old QR Code or UPI ID From Recharge Page.</li>
              <li>Always Pay on Active QR Code or UPI ID.</li>
              <li>Contact support if you&apos;re facing any issues.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
"use client";

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useSocket } from "@/contexts/SocketContext";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

const Page = () => {
  const { setShowHeaderFooter } = useLayout();
  const { balance } = useSocket();

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

      let userId;
      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        userId = tokenPayload.userId || tokenPayload.id || tokenPayload.sub;
      } catch (e) {
        console.log("Could not extract userId from token:", e);
      }

      const response = await fetch("https://ctbackend.crobstacle.com/api/wallet/deposit/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          userId: userId,
        }),
      });

      const result = await response.json();
      console.log("Payment initiation response:", JSON.stringify(result, null, 2));

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
        result.status === "success" ||
        result.status === 1 ||
        result.code === 200 ||
        (response.ok && paymentUrl);

      if (isSuccess && paymentUrl) {
        toast.success("Redirecting to payment gateway...");
        window.location.href = paymentUrl;
      } else {
        const errMsg = result.message || result.msg || result.error || "Try again later";
        toast.error(`Payment failed: ${errMsg}`);
      }
    } catch (error) {
      toast.error("Error processing deposit. Please try again.");
      console.error("Deposit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#242424]">
      {/* Header */}
      <div className="bg-[#333332] text-white flex justify-between py-3 px-4 items-center">
        <Link href="/wallet" className="flex items-center justify-center w-7 h-7">
          <Image
            src="/leftArrow.png"
            width={28}
            height={28}
            alt="Back"
            className="w-7 h-7 object-contain"
          />
        </Link>
        <h1 className="text-lg font-semibold">Deposit</h1>
        <div className="w-7" />
      </div>

      <div className="bg-[#242424] min-h-screen pb-6">

        {/* Balance Card — full image, text overlaid */}
        <div className="relative mx-4 mt-3 rounded-xl shadow-md overflow-hidden">
          <Image
            src="/bannerbg.png"
            width={700}
            height={420}
            alt="Balance Card"
            className="w-full h-auto block"
            priority
          />
          <div className="absolute top-0 left-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/walet.png" width={20} height={20} alt="Wallet" className="w-5 h-5 flex-shrink-0" />
              <h1 className="text-white text-base font-medium whitespace-nowrap">Balance</h1>
            </div>
            <h1 className="text-white text-3xl font-bold whitespace-nowrap">
              {balance === null ? "Loading..." : `₹ ${balance.toFixed(2)}`}
            </h1>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gradient-to-b from-[#f9d45a] to-[#b07b1f] w-28 mx-4 rounded-xl flex justify-center py-4 my-5">
          <Image
            src="/upi.png"
            width={48}
            height={48}
            alt="UPI"
            className="w-10 h-auto object-contain"
          />
        </div>

        {/* Deposit Amount Section */}
        <div className="bg-white/10 rounded-xl mx-4 pb-5 px-3 my-4">
          <div className="flex items-center p-3 gap-2">
            <Image src="/selectr.png" width={24} height={24} alt="Deposit Icon" className="w-6 h-6" />
            <h1 className="text-base text-white font-semibold">Deposit Amount</h1>
          </div>

          {/* Amount Buttons */}
          <div className="grid grid-cols-3 gap-2 px-1">
            {["350", "1000", "2000", "5000", "10000", "25000", "40000", "75000", "100000"].map((value) => (
              <button
                key={value}
                className={`border-2 p-2 rounded-xl flex justify-center items-center hover:bg-[#c4933f] hover:text-white text-base transition-colors ${
                  amount === value
                    ? "bg-[#c4933f] text-white border-[#c4933f]"
                    : "border-[#c4933f] text-[#c4933f]"
                }`}
                onClick={() => setAmount(value)}
              >
                ₹{value}
              </button>
            ))}
          </div>

          {/* Input + Button */}
          <div className="mx-1 mt-4">
            <input
              className="p-2 w-full bg-[#4d4d4c] rounded-lg border-l-2 text-white border-black text-sm"
              placeholder="Enter or select recharge amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
            />
            <button
              className="w-full bg-[#c4933f] p-2.5 mt-4 text-white font-bold text-base rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeposit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Deposit"}
            </button>
          </div>
        </div>

        {/* Deposit Instructions */}
        <div className="bg-[#4d4d4c] rounded-xl mx-4 pb-5 my-4">
          <div className="flex items-center p-3 gap-2">
            <Image src="/selectr.png" width={24} height={24} alt="Instructions" className="w-6 h-6" />
            <h1 className="text-base text-white font-semibold">Deposit Instruction</h1>
          </div>
          <div className="border-2 p-3 mx-2 rounded-xl">
            <ul className="text-gray-400 text-xs font-semibold space-y-1">
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
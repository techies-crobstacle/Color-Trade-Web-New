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
  const presetAmounts = ["350", "1000", "2000", "5000", "10000", "25000"];

  const displayBalance = Number(balance || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.realdaddygame.com";
      const response = await fetch(`${API_BASE}/api/wallet/deposit/initiate`, {
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

      // Helper: try to find a payment URL in common places or nested objects
      const findPaymentUrl = (obj: any): string | null => {
        if (!obj || typeof obj !== 'object') return null;
        const keys = Object.keys(obj);
        for (const k of keys) {
          const v = obj[k];
          if (typeof v === 'string') {
            if (/^https?:\/\//i.test(v) && (v.includes('http') || v.includes('pay') || v.includes('upi') || v.includes('razor') || v.includes('koifish') || v.includes('pay'))) return v;
          } else if (typeof v === 'object') {
            const nested = findPaymentUrl(v);
            if (nested) return nested;
          }
        }
        // check common known keys as fallback
        return (
          obj.paymentUrl || obj.payUrl || obj.pay_url || obj.paymentLink || obj.redirectUrl || obj.url || null
        );
      };

      // Order id finder (move up so we can reference it in all branches)
      const findOrderId = (obj: any): string | null => {
        if (!obj || typeof obj !== 'object') return null;
        const candidates = ['orderId','order_id','mchOrderNo','payOrderId','pay_order_id','orderNo','id','order'];
        for (const c of candidates) {
          if (obj[c]) return String(obj[c]);
        }
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          if (v && typeof v === 'object') {
            const nested = findOrderId(v);
            if (nested) return nested;
          }
        }
        return null;
      };

      const paymentUrl =
        findPaymentUrl(result) ||
        findPaymentUrl(result.data) ||
        null;

      // Robust success detection: server may return a message saying 'initiated' even when payload shape varies
      const isSuccess =
        result?.success === true ||
        result?.status === 'success' ||
        result?.status === 1 ||
        result?.code === 200 ||
        (response.ok && !!paymentUrl) ||
        (typeof result?.message === 'string' && /initiated|created|order created|order initiated/i.test(result.message));

      const orderId = findOrderId(result) || findOrderId(result.data) || null;

      console.log('Detected paymentUrl:', paymentUrl, 'isSuccess:', isSuccess, 'rawMessage:', result.message, 'orderId:', orderId);

      if (isSuccess && paymentUrl) {
        // Open payment URL in a new tab and do not poll/reload parent.
        toast.success('Opening payment gateway in a new tab...');
        const newWin = window.open(paymentUrl, '_blank');
        toast.info('Payment opened in a new tab. Return to this page to check deposit history.');
        // Do not poll or reload the parent window; leave status checks to manual refresh/history.
        return;
      } else {
          // If server reported success (message like 'initiated') but we couldn't find a payment URL,
          // show an informational toast instead of a failure and log details for debugging.
          const errMsg = result.message || result.msg || result.error || "Try again later";
          if (/initiated|created|order created|order initiated/i.test(errMsg) || isSuccess) {
            console.warn('Initiation response without payment URL:', { result, paymentUrl });
            const orderIdFallback = orderId || result.data?.orderId || result.data?.payOrderId || null;
            toast.info(`Deposit initiated: ${errMsg}. ${orderIdFallback ? 'Order: ' + orderIdFallback : ''} Check deposit history for status.`);
          } else {
            toast.error(`Payment failed: ${errMsg}`);
          }
        }
    } catch (error) {
      toast.error("Error processing deposit. Please try again.");
      console.error("Deposit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151515] text-white">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#1f1f1f]/95 backdrop-blur">
        <div className="relative px-4 py-4">
          <Link href="/wallet" className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2">
            <Image src="/back-white.png" width={18} height={18} alt="Back" />
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold">Add Money</h1>
            <p className="text-xs text-gray-400">Recharge your wallet securely</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-3xl border border-[#d4a64a]/30 bg-gradient-to-br from-[#3a2c13] via-[#25211a] to-[#111] p-5 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#f5d57a]">Available Balance</p>
              <h2 className="mt-2 text-4xl font-black">₹{balance === null ? "..." : displayBalance}</h2>
              <p className="mt-2 text-xs text-gray-300">Your deposit reflects after gateway confirmation.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <Image src="/walet.png" width={34} height={34} alt="Wallet" />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Deposit Amount</h2>
              <p className="text-xs text-gray-400">Choose a quick amount or enter manually</p>
            </div>
            <div className="rounded-xl bg-[#c4933f]/20 px-3 py-2 text-xs font-bold text-[#f6d371]">
              UPI / Bank
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map((value) => (
              <button
                key={value}
                type="button"
                className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                  amount === value
                    ? "border-[#f6d371] bg-[#c4933f] text-black"
                    : "border-white/10 bg-black/20 text-white hover:border-[#c4933f]"
                }`}
                onClick={() => setAmount(value)}
              >
                ₹{Number(value).toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Custom Amount</label>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl font-black text-[#f6d371]">₹</span>
              <input
                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-gray-600"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
              />
            </div>
          </div>

          <button
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#f8d86a] to-[#b88527] px-4 py-3 font-black text-black shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleDeposit}
            disabled={loading}
          >
            {loading ? "Creating Deposit..." : "Proceed to Payment"}
          </button>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
          <h3 className="font-bold">Deposit Instructions</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            <li>Always pay using the active payment page opened from this app.</li>
            <li>Do not reuse old QR codes or saved UPI IDs.</li>
            <li>After payment, return to the app and check deposit history.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Page;
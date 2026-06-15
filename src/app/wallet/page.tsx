'use client';

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useSocket } from "@/contexts/SocketContext";
import Image from "next/image";
import Footer from "@/Components/CommonComponents/Footer";
import Link from "next/link";
import useRequireAuth from "@/hooks/useRequireAuth";

const Wallet = () => {
  useRequireAuth();
  const [loading, setLoading] = useState(true);
  const { setShowHeaderFooter } = useLayout();
  const { isConnected, balance, refreshBalance } = useSocket();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  useEffect(() => {
    if (isConnected) {
      refreshBalance();
    }
  }, [isConnected, refreshBalance]);

  useEffect(() => {
    setLoading(!isConnected || balance === null);
  }, [isConnected, balance]);

  const totalWalletLimit = 1000000;
  const handleBackButtonClick = () => {
    window.history.back();
  };

  const progressPercentage = balance !== null ? Math.min((balance / totalWalletLimit) * 100, 100) : 0;
  const formattedBalance = Number(balance || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const walletActions = [
    {
      href: "/addMoney",
      icon: "/deposit.png",
      title: "Add Money",
      subtitle: "Recharge wallet",
      accent: "from-emerald-400/20 to-emerald-500/5",
    },
    {
      href: "/withMoney",
      icon: "/withdrawal.png",
      title: "Withdraw",
      subtitle: "Send to bank",
      accent: "from-red-400/20 to-red-500/5",
    },
    {
      href: "/deposithistory",
      icon: "/dep-history.png",
      title: "Deposits",
      subtitle: "Recharge history",
      accent: "from-[#f8d86a]/20 to-[#b88527]/5",
    },
    {
      href: "/withdrawalhistory",
      icon: "/withd-history.png",
      title: "Withdrawals",
      subtitle: "Payout history",
      accent: "from-blue-400/20 to-blue-500/5",
    },
  ];

  return (
    <div className="min-h-screen bg-[#151515] pb-20 text-white">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#1f1f1f]/95 backdrop-blur">
        <div className="relative px-4 py-4">
          <button
            onClick={handleBackButtonClick}
            className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2"
            aria-label="Go back"
          >
            <Image src="/back-white.png" alt="back-button" width={18} height={18} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">Wallet</h1>
            <p className="text-xs text-gray-400">Manage deposits, withdrawals, and history</p>
          </div>
        </div>
      </div>

      <main className="px-4 py-5">
        <section className="overflow-hidden rounded-3xl border border-[#d4a64a]/30 bg-gradient-to-br from-[#3a2c13] via-[#25211a] to-[#111] p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#f5d57a]">Total Wallet Balance</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight">
                {!isConnected ? "Login" : loading ? "..." : `₹${formattedBalance}`}
              </h2>
              <p className="mt-2 text-xs text-gray-300">
                {isConnected ? "Live balance synced from your wallet." : "Please login to view your balance."}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <Image className="h-9 w-9" src="/wallets.png" width={80} height={80} alt="Wallet Icon" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-black/25 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Wallet capacity</span>
              <span className="font-bold text-[#f6d371]">{loading ? "..." : `${progressPercentage.toFixed(2)}%`}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f8d86a] to-[#b88527]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500">Limit: ₹{totalWalletLimit.toLocaleString("en-IN")}</p>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/addMoney"
            className="rounded-3xl bg-gradient-to-r from-[#f8d86a] to-[#b88527] p-4 text-black shadow-lg transition hover:brightness-110"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-black/60">Primary</p>
            <h3 className="mt-1 text-xl font-black">Add Money</h3>
            <p className="mt-2 text-xs font-semibold text-black/70">Open payment gateway</p>
          </Link>
          <Link
            href="/withMoney"
            className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-lg transition hover:border-[#c4933f]"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Payout</p>
            <h3 className="mt-1 text-xl font-black">Withdraw</h3>
            <p className="mt-2 text-xs text-gray-400">Transfer to bank</p>
          </Link>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Wallet Actions</h2>
              <p className="text-xs text-gray-400">Quick access to money movement</p>
            </div>
            <Link href="/transactionhistory" className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#f6d371]">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {walletActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`rounded-3xl border border-white/10 bg-gradient-to-br ${action.accent} p-4 shadow-lg transition hover:border-[#c4933f]`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Image src={action.icon} width={30} height={30} alt={action.title} />
                </div>
                <h3 className="font-black">{action.title}</h3>
                <p className="mt-1 text-xs text-gray-400">{action.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Wallet;
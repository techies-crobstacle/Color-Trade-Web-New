"use client";

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useSocket } from "@/contexts/SocketContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Footer from "@/Components/CommonComponents/Footer";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function AccountPage() {
  useRequireAuth();
  const { setShowHeaderFooter } = useLayout();
  const { balance, onTokenChange } = useSocket();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    name: string;
    number: string;
    uid?: string;
  } | null>(null);

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found");
          setLoading(false);
          return;
        }

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";
        const res = await fetch(`${API_BASE}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }

        const result = await res.json();
        if (result.success) {
          setProfile({
            name: result.data.name,
            number: result.data.number.value,
            uid: result.data._id,
          });
        } else {
          console.warn("Profile fetch unsuccessful");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (balance !== null) setLoading(false);
  }, [balance]);

  const handleNav = (path: string) => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push(path);
    } else {
      toast.info("You will need to login to access that Page");
    }
  };

  const formattedBalance = Number(balance || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const walletShortcuts = [
    { label: "Wallet", path: "/wallet", icon: "/wallet.png", sub: "Overview" },
    { label: "Deposit", path: "/addMoney", icon: "/deposit.png", sub: "Add funds" },
    { label: "Withdraw", path: "/withMoney", icon: "/withdrawal.png", sub: "Bank payout" },
  ];

  const historyItems = [
    { label: "Bet History", sub: "View all game bets", icon: "/trnx.png", path: "/bethistory" },
    { label: "Transactions", sub: "All wallet activity", icon: "/trnsc.png", path: "/transactionhistory" },
    { label: "Deposits", sub: "Recharge history", icon: "/4-deposite.png", path: "/deposithistory" },
    { label: "Withdrawals", sub: "Payout history", icon: "/withd.png", path: "/withdrawalhistory" },
  ];

  const menuItems = [
    { label: "My Profile", path: "/profile", icon: "/promote.png" },
    { label: "Settings", path: "/changepassword", icon: "/setting.png" },
    { label: "About Us", path: "/about", icon: "/about.png" },
    { label: "Support", path: "/support", icon: "/ticket.png" },
    { label: "My Referral", path: "/referral", icon: "/mreferral.png" },
    { label: "App Download", path: "https://www.realdaddygame.com/app.apk", icon: "/app.png" },
    { label: "Join Telegram Channel", path: "/profile", icon: "/app.png" },
  ];

  return (
    <div className="min-h-screen bg-[#151515] pb-20 text-white">
      <div className="overflow-hidden rounded-b-[2.5rem] border-b border-[#d4a64a]/20 bg-gradient-to-br from-[#3a2c13] via-[#25211a] to-[#111] px-4 pb-24 pt-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="rounded-full border-2 border-[#f6d371]/40 bg-white/10 p-1">
            <Image
              src="/avatar2.png"
              width={96}
              height={96}
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-[#f6d371]">My Account</p>
            <h1 className="mt-1 truncate text-2xl font-black uppercase">
              {profile?.name || "Loading..."}
            </h1>
            <p className="mt-1 truncate text-sm text-gray-300">Mobile: {profile?.number || "Loading..."}</p>
            <p className="mt-2 inline-flex max-w-full rounded-full bg-black/25 px-3 py-1 text-[11px] font-bold text-[#f6d371]">
              <span className="truncate">UID | {profile?.uid || "Loading..."}</span>
            </p>
          </div>
        </div>
      </div>

      <main className="-mt-16 px-4">
        <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur">
          <p className="text-sm text-gray-300">Total Balance</p>
          <h2 className="mt-2 text-4xl font-black">
            {loading
              ? "Loading..."
              : balance == null
              ? "Login to view Balance"
              : `₹${formattedBalance}`}
          </h2>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {walletShortcuts.map(({ label, path, icon, sub }) => (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center transition hover:border-[#c4933f]"
              >
                <Image src={icon} width={34} height={34} alt={label} className="mx-auto h-8 w-8" />
                <span className="mt-2 block text-sm font-bold">{label}</span>
                <span className="mt-0.5 block text-[10px] text-gray-500">{sub}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3">
            <h2 className="text-lg font-bold">History</h2>
            <p className="text-xs text-gray-400">Review game and wallet records</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {historyItems.map(({ label, sub, icon, path }) => (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 text-left shadow-lg transition hover:border-[#c4933f]"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Image src={icon} width={32} height={32} alt={label} />
                </div>
                <p className="font-black">{label}</p>
                <p className="mt-1 text-xs text-gray-400">{sub}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.07] p-2 shadow-lg">
          {menuItems.map(({ label, path, icon }) => (
            <button
              key={`${label}-${path}`}
              onClick={() => handleNav(path)}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-black/20">
                  <Image src={icon} width={28} height={28} alt={label} />
                </span>
                <span className="truncate font-bold">{label}</span>
              </div>
              <Image
                src="/right-next.svg"
                width={24}
                height={24}
                alt="Next"
                className="h-6 w-6 flex-shrink-0 opacity-70"
              />
            </button>
          ))}
        </section>

      {/* Log Out */}
      <div className="mt-5 flex justify-center">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
            onTokenChange(null);
            router.push("/");
            toast.success("You are Logged out");
          }}
          className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 py-3 font-black text-red-300 transition hover:bg-red-500/20"
        >
          Log Out
        </button>
      </div>
      </main>

      <Footer />
    </div>
  );
}
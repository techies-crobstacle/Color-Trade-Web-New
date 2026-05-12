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

        const res = await fetch("https://ctbackend.crobstacle.com/api/users/profile", {
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

  return (
    <div className="flex-1 bg-[#242424]">
      {/* Section 1 - Profile Header */}
      <div className="bg-[linear-gradient(90deg,#FAE59F_0%,#C4933F_100%)] rounded-b-[3rem] px-5 pt-6 pb-28">
        <div className="flex gap-3 items-center justify-center">
          <Image
            src="/avatar2.png"
            width={100}
            height={100}
            alt="Avatar"
            className="rounded-full w-20 h-20 flex-shrink-0"
          />
          <div className="text-white flex flex-col font-semibold items-start gap-1 min-w-0">
            <h1 className="uppercase text-xl truncate max-w-[200px]">
              {profile?.name || "Loading..."}
            </h1>
            <h1 className="bg-orange-200 rounded-full px-2 text-xs text-red-500 truncate max-w-[200px]">
              UID | {profile?.uid || "Loading..."}
            </h1>
            <h1 className="text-sm whitespace-nowrap">
              Mobile : {profile?.number || "Loading..."}
            </h1>
          </div>
        </div>
      </div>

      {/* Section 2 - Balance Card */}
      <div className="px-4">
        <div className="bg-[#4b4b4a] text-white rounded-xl shadow-lg p-5 -mt-16 text-center">
          <p className="font-semibold text-base">Total Balance</p>
          <p className="my-2 text-xl font-bold">
            {loading
              ? "Loading..."
              : balance == null
              ? "Login to view Balance"
              : `₹ ${balance.toFixed(2)}`}
          </p>
          <div className="flex items-center mt-5 font-semibold">
            <button
              onClick={() => handleNav("/wallet")}
              className="flex basis-1/3 flex-col items-center"
            >
              <Image
                src="/wallet.png"
                width={40}
                height={40}
                alt="Wallet"
                className="w-10 h-10"
              />
              <span className="text-sm mt-1">Wallet</span>
            </button>
            <button
              onClick={() => handleNav("/addMoney")}
              className="flex basis-1/3 flex-col items-center"
            >
              <Image
                src="/deposit.png"
                width={40}
                height={40}
                alt="Deposit"
                className="w-10 h-10"
              />
              <span className="text-sm mt-1">Deposit</span>
            </button>
            <button
              onClick={() => handleNav("/withMoney")}
              className="flex basis-1/3 flex-col items-center"
            >
              <Image
                src="/withdrawal.png"
                width={40}
                height={40}
                alt="Withdrawal"
                className="w-10 h-10"
              />
              <span className="text-sm mt-1">Withdrawal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3 - History Grid */}
      <div className="bg-[#242424]">
        <div className="grid grid-cols-2 mt-5 gap-3 px-4">
          {[
            { label: "Bet", sub: "My Bet History", icon: "/trnx.png", path: "/bethistory" },
            { label: "Transaction", sub: "My Transaction History", icon: "/trnsc.png", path: "/transactionhistory" },
            { label: "Deposit", sub: "My Deposit History", icon: "/4-deposite.png", path: "/deposithistory" },
            { label: "Withdraw", sub: "My Withdraw History", icon: "/withd.png", path: "/withdrawalhistory" },
          ].map(({ label, sub, icon, path }) => (
            <button
              key={path}
              onClick={() => handleNav(path)}
              className="flex bg-[#333332] text-white p-3 items-center rounded-lg gap-2 w-full overflow-hidden"
            >
              <Image
                src={icon}
                width={36}
                height={36}
                alt={label}
                className="w-9 h-9 flex-shrink-0"
              />
              <div className="text-left overflow-hidden">
                <p className="text-base font-medium whitespace-nowrap">{label}</p>
                <p className="text-[10px] text-gray-200 truncate">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Section 4 - Menu Options */}
        <div className="my-5 px-4">
          <div className="rounded-lg bg-[#333332] text-white p-3 space-y-1">
            {[
              { label: "My Profile", path: "/profile", icon: "/promote.png" },
              { label: "Settings", path: "/changepassword", icon: "/setting.png" },
              { label: "About Us", path: "/about", icon: "/about.png" },
              { label: "Support", path: "/support", icon: "/ticket.png" },
              { label: "My-referral", path: "/referral", icon: "/mreferral.png" },
              
            ].map(({ label, path, icon }) => (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className="flex justify-between items-center px-2 py-3 w-full"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={icon}
                    width={40}
                    height={40}
                    alt={label}
                    className="w-10 h-10 flex-shrink-0"
                  />
                  <span className="font-semibold text-base whitespace-nowrap">{label}</span>
                </div>
                <Image
                  src="/right-next.svg"
                  width={28}
                  height={28}
                  alt="Next"
                  className="w-7 h-7 flex-shrink-0"
                />
              </button>
            ))}
            <button
              onClick={() => handleNav("https://diuvin.com/app.apk")}
              className="flex justify-between items-center px-2 py-3 w-full"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/app.png"
                  width={40}
                  height={40}
                  alt="App Download"
                  className="w-10 h-10 flex-shrink-0"
                />
                <span className="font-semibold text-base whitespace-nowrap">App Download</span>
              </div>
              <Image
                src="/right-next.svg"
                width={28}
                height={28}
                alt="Next"
                className="w-7 h-7 flex-shrink-0"
              />
            </button>
            <button
              onClick={() => handleNav("/profile")}
              className="flex justify-between items-center px-2 py-3 w-full"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/app.png"
                  width={40}
                  height={40}
                  alt="Telegram"
                  className="w-10 h-10 flex-shrink-0"
                />
                <span className="font-semibold text-base whitespace-nowrap">Join Telegram Channel!</span>
              </div>
              <Image
                src="/right-next.svg"
                width={28}
                height={28}
                alt="Next"
                className="w-7 h-7 flex-shrink-0"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Log Out */}
      <div className="flex justify-center px-4">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
            onTokenChange(null);
            router.push("/");
            toast.success("You are Logged out");
          }}
          className="mb-24 rounded-full py-2.5 w-full font-semibold border-2 border-[#e1b252] text-[#e1b252] text-base"
        >
          Log Out
        </button>
      </div>

      <Footer />
    </div>
  );
}
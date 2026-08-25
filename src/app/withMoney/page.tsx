"use client";

import { useLayout } from "@/contexts/LayoutContext";
import { useSocket } from "@/contexts/SocketContext";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaRupeeSign, FaLock } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";

type BankDetails = {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  city: string;
  province: string;
};

type WalletDetails = {
  balance: number;
  maxWithdrawable: number;
  withdrawalFee?: {
    type: "fixed" | "percent";
    value: number;
  };
};

const EMPTY_BANK_DETAILS: BankDetails = {
  accountName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  city: "",
  province: "",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.realdaddygame.com";

const Page = () => {
  const { setShowHeaderFooter } = useLayout();
  const { balance, refreshBalance } = useSocket();

  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBankDetails, setLoadingBankDetails] = useState(true);

  const [bankDetails, setBankDetails] = useState<BankDetails>(EMPTY_BANK_DETAILS);
  const [savedBankDetails, setSavedBankDetails] = useState<BankDetails | null>(null);
  const [useSavedBankDetails, setUseSavedBankDetails] = useState(true);
  const [saveBankDetailsForFuture, setSaveBankDetailsForFuture] = useState(true);
  const [ifscLookupLoading, setIfscLookupLoading] = useState(false);
  const [ifscLookupMessage, setIfscLookupMessage] = useState("");
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);

  const displayBalance = walletDetails?.balance ?? balance;
  const maxWithdrawable = walletDetails?.maxWithdrawable ?? balance ?? 0;

  const fetchWalletDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok && result?.data) {
        setWalletDetails({
          balance: Number(result.data.balance || 0),
          maxWithdrawable: Number(result.data.maxWithdrawable || 0),
          withdrawalFee: result.data.withdrawalFee,
        });
      }
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    }
  };

  useEffect(() => {
    setShowHeaderFooter(false);

    const fetchBankDetails = async () => {
      setLoadingBankDetails(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/users/bank-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok && data?.data?.hasBankDetails && data?.data?.bankDetails) {
          const fetchedBankDetails: BankDetails = {
            accountName: data.data.bankDetails.accountName || "",
            accountNumber: data.data.bankDetails.accountNumber || "",
            ifscCode: data.data.bankDetails.ifscCode || "",
            bankName: data.data.bankDetails.bankName || "",
            city: data.data.bankDetails.city || "",
            province: data.data.bankDetails.province || "",
          };
          setSavedBankDetails(fetchedBankDetails);
          setBankDetails(fetchedBankDetails);
          setUseSavedBankDetails(true);
        } else {
          setSavedBankDetails(null);
          setBankDetails(EMPTY_BANK_DETAILS);
          setUseSavedBankDetails(false);
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
      } finally {
        setLoadingBankDetails(false);
      }
    };

    fetchBankDetails();
    fetchWalletDetails();
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  useEffect(() => {
    if (useSavedBankDetails) {
      setIfscLookupLoading(false);
      setIfscLookupMessage("");
      return;
    }

    const ifsc = bankDetails.ifscCode.trim().toUpperCase();
    if (ifsc.length < 11) {
      setIfscLookupLoading(false);
      setIfscLookupMessage("");
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIfscLookupLoading(true);
      setIfscLookupMessage("");
      try {
        const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Invalid IFSC code");
        }

        const data = await response.json();
        setBankDetails((prev) => ({
          ...prev,
          bankName: data?.BANK || prev.bankName,
          city: data?.CITY || prev.city,
          province: data?.STATE || prev.province,
        }));
        setIfscLookupMessage("Bank details auto-filled from IFSC.");
      } catch (error) {
        if (!controller.signal.aborted) {
          setIfscLookupMessage("Could not fetch bank details from IFSC.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIfscLookupLoading(false);
        }
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [bankDetails.ifscCode, useSavedBankDetails]);

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    if (Number(amount) > maxWithdrawable) {
      toast.error(`Maximum withdrawable amount is ₹${maxWithdrawable.toFixed(2)} including withdrawal charges.`);
      return;
    }

    const activeBankDetails = useSavedBankDetails ? savedBankDetails : bankDetails;

    if (!activeBankDetails?.accountName || !activeBankDetails?.accountNumber || !activeBankDetails?.ifscCode) {
      toast.error("Please enter complete bank details.");
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

      const response = await fetch(`${API_BASE_URL}/api/wallet/withdraw/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          useSavedBankDetails,
          saveBankDetails: !useSavedBankDetails && saveBankDetailsForFuture,
          bankDetails: activeBankDetails,
        }),
      });

      const result = await response.json();
      console.log("Withdrawal response:", JSON.stringify(result, null, 2));

      const isSuccess =
        result.success === true ||
        result.status === "success" ||
        result.status === 1 ||
        result.code === 200 ||
        response.ok;

      if (isSuccess) {
        toast.success(`Withdrawal request submitted successfully!`);
        if (result.transactionId || result.txnId || result.orderId) {
          toast.info(`Transaction ID: ${result.transactionId || result.txnId || result.orderId}`);
        }
        setAmount("");
        setPassword("");
        if (!useSavedBankDetails && saveBankDetailsForFuture) {
          setSavedBankDetails(activeBankDetails);
          setUseSavedBankDetails(true);
        }
        refreshBalance();
        fetchWalletDetails();
      } else {
        toast.error(`Withdrawal failed: ${result.message || result.msg || "Try again later"}`);
      }
    } catch (error) {
      toast.error("Error processing withdrawal. Please try again.");
      console.error(error);
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
            <h1 className="text-lg font-bold">Withdraw Money</h1>
            <p className="text-xs text-gray-400">Send wallet balance to your bank account</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 pb-8">
        <div className="rounded-3xl border border-[#d4a64a]/30 bg-gradient-to-br from-[#3a2c13] via-[#25211a] to-[#111] p-5 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#f5d57a]">Wallet Balance</p>
              <h2 className="mt-2 text-4xl font-black">
                ₹{displayBalance === null ? "..." : Number(displayBalance || 0).toFixed(2)}
              </h2>
              <p className="mt-2 text-xs text-gray-300">
                Max withdrawable after charges: ₹{Number(maxWithdrawable || 0).toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <Image src="/walet.png" width={34} height={34} alt="Wallet" />
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Bank Details</h2>
            <p className="text-xs text-gray-400">Choose a saved account or add a new one</p>
          </div>

          {loadingBankDetails ? (
            <p className="text-sm text-gray-300">Loading bank details...</p>
          ) : (
            <>
              {savedBankDetails && (
                <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-xs text-emerald-200 mb-1">Saved Account</p>
                  <p className="text-base text-white font-bold">{savedBankDetails.accountName}</p>
                  <p className="text-xs text-gray-300 mt-1">
                    A/C ending {savedBankDetails.accountNumber.slice(-4)} | IFSC {savedBankDetails.ifscCode}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className={`rounded-full px-4 py-2 text-xs font-bold ${useSavedBankDetails ? "bg-emerald-500 text-black" : "bg-white/10 text-gray-200"}`}
                      onClick={() => setUseSavedBankDetails(true)}
                    >
                      Use This Account
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-4 py-2 text-xs font-bold ${!useSavedBankDetails ? "bg-[#c4933f] text-black" : "bg-white/10 text-gray-200"}`}
                      onClick={() => setUseSavedBankDetails(false)}
                    >
                      Change Account
                    </button>
                  </div>
                </div>
              )}

              {!useSavedBankDetails && (
                <>
                  {[
            { label: "Account Holder Name", placeholder: "Enter account holder name", key: "accountName", type: "text" },
            { label: "Account Number", placeholder: "Enter account number", key: "accountNumber", type: "text" },
            { label: "IFSC Code", placeholder: "Enter IFSC code (11 characters)", key: "ifscCode", type: "text", maxLength: 11, uppercase: true },
            { label: "Bank Name", placeholder: "Enter bank name", key: "bankName", type: "text" },
            { label: "City", placeholder: "Enter city", key: "city", type: "text" },
            { label: "Province / State", placeholder: "Enter province or state", key: "province", type: "text" },
                  ].map(({ label, placeholder, key, type, maxLength, uppercase }) => (
            <div className="mb-3" key={key}>
              <label className="text-xs text-gray-300 mb-1 block">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                className={`w-full rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#c4933f] ${uppercase ? "uppercase" : ""}`}
                value={bankDetails[key as keyof typeof bankDetails]}
                maxLength={maxLength}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    [key]: uppercase ? e.target.value.toUpperCase() : e.target.value,
                  })
                }
              />
              {key === "ifscCode" && (
                <p className="text-[11px] mt-1 text-gray-300">
                  {ifscLookupLoading ? "Fetching bank details from IFSC..." : ifscLookupMessage}
                </p>
              )}
            </div>
                  ))}

                  <label className="flex items-center gap-2 text-xs text-gray-200 mt-1">
                    <input
                      type="checkbox"
                      checked={saveBankDetailsForFuture}
                      onChange={(e) => setSaveBankDetailsForFuture(e.target.checked)}
                    />
                    Save this account for future withdrawals
                  </label>
                </>
              )}

              {!savedBankDetails && (
                <p className="text-xs text-yellow-300">No saved bank details found. Add bank details to continue.</p>
              )}
            </>
          )}
        </div>

        {/* Withdrawal Form */}
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Withdrawal Amount</h2>
            <p className="text-xs text-gray-400">Amount plus charge must fit your wallet balance</p>
          </div>

          <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 p-3">
            <FaRupeeSign className="text-[#f6d371] mr-2 text-base flex-shrink-0" />
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              max={maxWithdrawable}
              className="bg-transparent w-full outline-none text-white text-xl font-bold placeholder:text-gray-600"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {amount && (
              <IoCloseCircleOutline
                className="text-white cursor-pointer text-lg flex-shrink-0 ml-2"
                onClick={() => setAmount("")}
              />
            )}
          </div>
          <div className="mt-3 rounded-2xl bg-black/20 p-3 text-xs text-gray-300">
            <p>Maximum withdrawable: ₹{Number(maxWithdrawable || 0).toFixed(2)}</p>
            {walletDetails?.withdrawalFee && walletDetails.withdrawalFee.value > 0 && (
              <p>
                Withdrawal charge: {walletDetails.withdrawalFee.type === "percent"
                  ? `${walletDetails.withdrawalFee.value}%`
                  : `₹${walletDetails.withdrawalFee.value}`}
                . Enter an amount within the maximum so balance covers amount + charge.
              </p>
            )}
          </div>

          <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 p-3 mt-3">
            <FaLock className="text-[#f6d371] mr-2 text-base flex-shrink-0" />
            <input
              type="password"
              placeholder="Enter login password"
              className="bg-transparent w-full outline-none text-white text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#f8d86a] to-[#b88527] px-4 py-3 font-black text-black shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </div>

        {/* Withdrawal Instructions */}
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
          <h3 className="font-bold">Withdrawal Instructions</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            <li>Withdrawal requests are usually processed within 24 hours.</li>
            <li>Ensure account number, IFSC, and account holder name are correct.</li>
            <li>Minimum withdrawal amount is ₹100.</li>
            <li>Your wallet is debited immediately when the payout request is accepted.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Page;
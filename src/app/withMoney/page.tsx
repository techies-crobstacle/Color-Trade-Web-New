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

const EMPTY_BANK_DETAILS: BankDetails = {
  accountName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  city: "",
  province: "",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";

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
    <div className="min-h-screen bg-[#242424]">
      {/* Header */}
      <div className="bg-[#333332] flex justify-between py-3 items-center px-4 shadow-md">
        <Link href="/wallet" className="flex items-center justify-center w-7 h-7">
          <Image
            src="/back-white.png"
            width={28}
            height={28}
            alt="Back"
            className="w-7 h-7 object-contain"
          />
        </Link>
        <h1 className="text-lg text-white font-semibold">Withdraw</h1>
        {/* Spacer to keep title centered */}
        <div className="w-7" />
      </div>

      {/* Content */}
      <div className="bg-[#242424] min-h-screen pb-6">

        {/* Wallet Balance Card */}
        <div className="relative mx-4 mt-3 rounded-xl shadow-md overflow-hidden">
          {/* Full card image — chip and dots are part of the image itself */}
          <Image
            src="/bannerbg.png"
            width={700}
            height={420}
            alt="Balance Card"
            className="w-full h-auto block"
            priority
          />
          {/* Text overlay — top-left */}
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

        {/* Bank Details Section */}
        <div className="bg-white/10 shadow-md rounded-lg p-4 mx-4 mt-4">
          <h2 className="text-base text-white font-semibold flex items-center gap-2 mb-3">
            <Image src="/selectr.png" width={20} height={20} alt="Bank Icon" className="w-5 h-5" />
            Bank Details
          </h2>

          {loadingBankDetails ? (
            <p className="text-xs text-gray-200">Loading bank details...</p>
          ) : (
            <>
              {savedBankDetails && (
                <div className="mb-4 rounded-lg border border-white/20 bg-black/20 p-3">
                  <p className="text-xs text-gray-300 mb-1">Saved Account</p>
                  <p className="text-sm text-white font-semibold">{savedBankDetails.accountName}</p>
                  <p className="text-xs text-gray-200 mt-1">
                    A/C ending {savedBankDetails.accountNumber.slice(-4)} | IFSC {savedBankDetails.ifscCode}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold ${useSavedBankDetails ? "bg-green-600 text-white" : "bg-white/10 text-gray-200"}`}
                      onClick={() => setUseSavedBankDetails(true)}
                    >
                      Use This Account
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold ${!useSavedBankDetails ? "bg-amber-500 text-black" : "bg-white/10 text-gray-200"}`}
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
              <label className="text-xs text-gray-100 mb-1 block">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                className={`bg-white/10 w-full outline-none text-white text-sm p-2 rounded-md ${uppercase ? "uppercase" : ""}`}
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
        <div className="bg-white/10 shadow-md rounded-lg p-4 mx-4 mt-4">
          <h2 className="text-base text-white font-semibold flex items-center gap-2">
            <Image src="/selectr.png" width={20} height={20} alt="Withdraw Icon" className="w-5 h-5" />
            Withdrawal Form
          </h2>

          <div className="flex items-center bg-white/10 rounded-md p-2 mt-3">
            <FaRupeeSign className="text-green-600 mr-2 text-sm flex-shrink-0" />
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              className="bg-transparent w-full outline-none text-white text-sm"
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

          <div className="flex items-center bg-white/10 rounded-md p-2 mt-3">
            <FaLock className="text-green-600 mr-2 text-sm flex-shrink-0" />
            <input
              type="password"
              placeholder="Enter login password"
              className="bg-transparent w-full outline-none text-white text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="mt-4 w-full bg-gradient-to-b from-[#f9d45a] to-[#b07b1f] text-gray-700 font-semibold py-2.5 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </div>

        {/* Withdrawal Instructions */}
        <div className="bg-white/10 rounded-xl mx-4 pb-5 my-4">
          <div className="flex items-center p-3 gap-2">
            <Image src="/selectr.png" width={24} height={24} alt="Instructions" className="w-6 h-6" />
            <h1 className="text-base text-white font-semibold">Withdrawal Instruction</h1>
          </div>
          <div className="p-3 mx-2 rounded-xl">
            <ul className="text-gray-400 text-xs font-semibold space-y-1">
              <li>Withdrawal requests are processed within 24 hours.</li>
              <li>Ensure your bank details are correct.</li>
              <li>IFSC code must be exactly 11 characters.</li>
              <li>Minimum withdrawal amount is ₹100.</li>
              <li>Contact support if facing issues.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Page;
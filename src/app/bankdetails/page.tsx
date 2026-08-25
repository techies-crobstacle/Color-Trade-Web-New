"use client";

import { useLayout } from "@/contexts/LayoutContext";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.realdaddygame.com";

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

export default function BankDetailsPage() {
  const { setShowHeaderFooter } = useLayout();

  const [bankDetails, setBankDetails] = useState<BankDetails>(EMPTY_BANK_DETAILS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ifscLookupLoading, setIfscLookupLoading] = useState(false);
  const [ifscLookupMessage, setIfscLookupMessage] = useState("");

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  useEffect(() => {
    const fetchBankDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login first");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/bank-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok && data?.data?.hasBankDetails && data?.data?.bankDetails) {
          setBankDetails({
            accountName: data.data.bankDetails.accountName || "",
            accountNumber: data.data.bankDetails.accountNumber || "",
            ifscCode: data.data.bankDetails.ifscCode || "",
            bankName: data.data.bankDetails.bankName || "",
            city: data.data.bankDetails.city || "",
            province: data.data.bankDetails.province || "",
          });
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);

  useEffect(() => {
    const ifsc = bankDetails.ifscCode.trim().toUpperCase();
    if (ifsc.length < 11) {
      setIfscLookupMessage("");
      setIfscLookupLoading(false);
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
  }, [bankDetails.ifscCode]);

  const handleUpdate = async () => {
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
      toast.error("Account Name, Account Number, and IFSC Code are required.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/bank-details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bankDetails }),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success("Bank details updated successfully!");
        window.history.back();
      } else {
        toast.error(result.message || result.error || "Failed to update bank details");
      }
    } catch (error) {
      toast.error("Error updating bank details. Please try again.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#242424]">
      {/* Header */}
      <div className="bg-[#333332] flex justify-between py-3 items-center px-4 shadow-md">
        <button onClick={() => window.history.back()} className="flex items-center justify-center w-7 h-7">
          <Image
            src="/back-white.png"
            width={28}
            height={28}
            alt="Back"
            className="w-7 h-7 object-contain"
          />
        </button>
        <h1 className="text-lg text-white font-semibold">Bank Details</h1>
        {/* Spacer to keep title centered */}
        <div className="w-7" />
      </div>

      <div className="p-4 sm:p-5 mt-4">
        <div className="bg-white/10 shadow-md rounded-lg p-4">
          <h2 className="text-base text-white font-semibold flex items-center gap-2 mb-4">
            <Image src="/bankcard.png" width={20} height={20} alt="Bank Icon" className="w-5 h-5 invert" />
            Update Bank Information
          </h2>

          {loading ? (
            <p className="text-sm text-gray-300">Loading bank details...</p>
          ) : (
            <>
              {[
                { label: "Account Holder Name*", placeholder: "Enter account holder name", key: "accountName", type: "text" },
                { label: "Account Number*", placeholder: "Enter account number", key: "accountNumber", type: "text" },
                { label: "IFSC Code*", placeholder: "Enter IFSC code (11 characters)", key: "ifscCode", type: "text", maxLength: 11, uppercase: true },
                { label: "Bank Name", placeholder: "Enter bank name", key: "bankName", type: "text" },
                { label: "City", placeholder: "Enter city", key: "city", type: "text" },
                { label: "Province / State", placeholder: "Enter province or state", key: "province", type: "text" },
              ].map(({ label, placeholder, key, type, maxLength, uppercase }) => (
                <div className="mb-4" key={key}>
                  <label className="text-xs text-gray-200 mb-1.5 block font-semibold">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className={`bg-black/20 border border-white/10 w-full outline-none text-white text-sm p-2.5 rounded-lg focus:border-yellow-500/50 transition-colors ${uppercase ? "uppercase" : ""}`}
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

              <button
                className="mt-6 w-full bg-gradient-to-b from-[#f9d45a] to-[#b07b1f] text-gray-900 font-bold py-3 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Bank Details"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
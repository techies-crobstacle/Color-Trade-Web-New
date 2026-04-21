"use client";

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import Image from "next/image";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

const TransactionHistory = () => {
  const { setShowHeaderFooter } = useLayout();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://ctbackend.crobstacle.com/api/wallet/transactions";

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Failed to show Transaction");
          setLoading(false);
          return;
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();

        setTransactions(data.data?.data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleBackButtonClick = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#242424]">
      {/* Header Section */}
      <div className="bg-[#333332] px-3 sm:px-5">
        <div className="relative">
          <button
            onClick={handleBackButtonClick}
            className="absolute left-0 top-[13px] sm:top-[15px]"
          >
            <Image
              src="/back-white.png"
              alt="back-button"
              width={100}
              height={100}
              className="w-4 sm:w-5"
            />
          </button>
        </div>
        <h1 className="text-lg sm:text-xl font-semibold text-white text-center py-3">
          Transaction History
        </h1>
      </div>

      {/* Transactions Section */}
      <div className="px-3 sm:px-5 pb-6">
        {loading ? (
          <p className="text-center mt-5 text-sm sm:text-base">Loading transactions...</p>
        ) : transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-start p-3 sm:p-4 bg-white/10 text-white my-3 sm:my-4 rounded-xl shadow-sm"
            >
              <div className="flex-1 min-w-0 pr-2">
                <h1 className="text-base sm:text-lg font-bold uppercase truncate">
                  {transaction.type}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {new Date(transaction.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <h1 
                  className={`text-sm sm:text-xl font-bold ${
                    transaction.type === "debit" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {transaction.status}
                </h1>
                <p
                  className={`text-sm sm:text-md font-semibold mt-1 ${
                    transaction.type === "debit" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {transaction.type === "debit"
                    ? `- ₹${Math.abs(transaction.amount)}`
                    : `+ ₹${transaction.amount}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center mt-5 text-sm sm:text-base text-gray-600">
            No transactions found
          </p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
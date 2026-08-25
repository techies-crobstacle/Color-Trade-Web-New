"use client";

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import MoneyTransactionList, { MoneyTransaction } from "@/Components/MoneyTransactionList";

const TransactionHistory = () => {
  const { setShowHeaderFooter } = useLayout();

  const [transactions, setTransactions] = useState<MoneyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.realdaddygame.com") + "/api/wallet/transactions";

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

  return (
    <MoneyTransactionList
      title="Transaction History"
      subtitle="All wallet deposits, withdrawals, and money activity"
      transactions={transactions}
      loading={loading}
    />
  );
};

export default TransactionHistory;
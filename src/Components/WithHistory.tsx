"use client";

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import MoneyTransactionList, { MoneyTransaction } from "@/Components/MoneyTransactionList";

export default function WithHistory() {
  const { setShowHeaderFooter } = useLayout();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  const [transactions, setTransactions] = useState<MoneyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.realdaddygame.com") + "/api/wallet/transactions";

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
      title="Withdrawal History"
      subtitle="Track withdrawal requests, charges, and payout status"
      transactions={transactions}
      loading={loading}
      filter={(tx) => tx.category === "money" && tx.type === "debit"}
      emptyText="No withdrawals found"
    />
  );
}
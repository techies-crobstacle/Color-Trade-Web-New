"use client";

import Image from "next/image";

export interface MoneyTransaction {
  _id?: string;
  id?: string | number;
  type: "credit" | "debit" | string;
  amount: number;
  grossAmount?: number | null;
  feeAmount?: number;
  netAmount?: number | null;
  status: string;
  createdAt: string;
  category?: string;
  description?: string;
}

type Props = {
  title: string;
  subtitle: string;
  transactions: MoneyTransaction[];
  loading: boolean;
  filter?: (transaction: MoneyTransaction) => boolean;
  emptyText?: string;
};

const formatMoney = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getStatusClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (["completed", "success", "paid"].includes(normalized)) return "bg-emerald-500/15 text-emerald-300";
  if (["pending", "processing"].includes(normalized)) return "bg-amber-500/15 text-amber-300";
  return "bg-red-500/15 text-red-300";
};

export default function MoneyTransactionList({
  title,
  subtitle,
  transactions,
  loading,
  filter,
  emptyText = "No transactions found",
}: Props) {
  const visibleTransactions = filter ? transactions.filter(filter) : transactions;
  const totalCredit = visibleTransactions
    .filter((tx) => tx.type === "credit")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const totalDebit = visibleTransactions
    .filter((tx) => tx.type === "debit")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#151515] text-white">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#1f1f1f]/95 backdrop-blur">
        <div className="relative px-4 py-4">
          <button
            onClick={() => window.history.back()}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2"
            aria-label="Go back"
          >
            <Image src="/back-white.png" alt="back-button" width={18} height={18} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-xs text-emerald-200">Money In</p>
            <p className="mt-1 text-xl font-black text-emerald-300">{formatMoney(totalCredit)}</p>
          </div>
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
            <p className="text-xs text-red-200">Money Out</p>
            <p className="mt-1 text-xl font-black text-red-300">{formatMoney(totalDebit)}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#c4933f] border-t-transparent" />
          </div>
        ) : visibleTransactions.length > 0 ? (
          <div className="space-y-3">
            {visibleTransactions.map((transaction) => {
              const isDebit = transaction.type === "debit";
              const feeAmount = Number(transaction.feeAmount || 0);

              return (
                <div
                  key={transaction._id || transaction.id || `${transaction.type}-${transaction.createdAt}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            isDebit ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          {isDebit ? "-" : "+"}
                        </span>
                        <div>
                          <p className="font-bold">{transaction.description || (isDebit ? "Withdrawal" : "Deposit")}</p>
                          <p className="text-xs text-gray-400">{new Date(transaction.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${isDebit ? "text-red-300" : "text-emerald-300"}`}>
                        {isDebit ? "-" : "+"}
                        {formatMoney(Math.abs(Number(transaction.amount || 0)))}
                      </p>
                      <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusClass(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  {feeAmount > 0 && (
                    <div className="mt-3 rounded-xl bg-black/20 px-3 py-2 text-xs text-gray-300">
                      Fee included: <span className="font-semibold text-white">{formatMoney(feeAmount)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-12 text-center">
            <p className="font-semibold text-gray-200">{emptyText}</p>
            <p className="mt-1 text-sm text-gray-500">Your recent wallet activity will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

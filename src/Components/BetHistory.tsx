// // "use client";

// // import React, { useEffect, useState } from "react";
// // import { useLayout } from "@/contexts/LayoutContext";
// // import Image from "next/image";

// // interface Transaction {
// //   id: string; // use string because IDs usually are strings
// //   type: "credit" | "debit";
// //   category: string;
// //   amount: number;
// //   createdAt: string;
// // }

// // export default function BetHistory() {
// //   const { setShowHeaderFooter } = useLayout();
// //   const [transactions, setTransactions] = useState<Transaction[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     setShowHeaderFooter(false);
// //     return () => setShowHeaderFooter(true);
// //   }, [setShowHeaderFooter]);

// //   useEffect(() => {
// //     async function fetchTransactions() {
// //       const token = localStorage.getItem("token");
// //       if (!token) {
// //         setLoading(false);
// //         return;
// //       }
// //       try {
// //         const response = await fetch("https://ctbackend.crobstacle.com/api/wallet/transactions", {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         });
// //         if (!response.ok) throw new Error("Failed to fetch");
// //         const data = await response.json();
// //         // Assign only game category transactions
// //         setTransactions(data.data?.data.filter((t: any) => t.category === "game"));
// //       } catch (error) {
// //         console.error("Error fetching transactions:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     fetchTransactions();
// //   }, []);

// //   const handleBackButtonClick = () => {
// //     window.history.back();
// //   };

// //   return (
// //     <div className="min-h-[100vh] bg-green-50 relative">
// //       <div className="bg-[#1ab266] px-5">
// //         <div className="relative">
// //           <button onClick={handleBackButtonClick} className="absolute left-0 top-[15px]">
// //             <Image src="/back-white.png" alt="back-button" width={100} height={100} className="w-5" />
// //           </button>
// //         </div>
// //         <h1 className="text-xl font-semibold text-white text-center py-3">Bet History</h1>
// //       </div>

// //       <div className="px-5">
// //         {loading ? (
// //           <p className="text-center mt-5">Loading transactions...</p>
// //         ) : transactions.length === 0 ? (
// //           <p className="text-center mt-5">No game transactions found</p>
// //         ) : (
// //           transactions.map((transaction) => (
// //             <div key={transaction.id} className="flex justify-between p-4 bg-white my-4 rounded-xl">
// //               <div>
// //                 <h1 className="text-lg font-bold uppercase">{transaction.type}</h1>
// //                 <p className="text-sm">{new Date(transaction.createdAt).toLocaleString()}</p>
// //               </div>
// //               <div>
// //                 <h1
// //                   className={`text-xl font-bold ${
// //                     transaction.type === "debit" ? "text-red-500" : "text-green-600"
// //                   }`}
// //                 >
// //                   {transaction.type === "debit" ? "Loss" : "Profit"}
// //                 </h1>
// //                 <p
// //                   className={`text-md font-semibold ${
// //                     transaction.type === "debit" ? "text-red-500" : "text-green-600"
// //                   }`}
// //                 >
// //                   {transaction.type === "debit"
// //                     ? `- ₹ ${Math.abs(transaction.amount)}`
// //                     : `+ ₹ ${transaction.amount}`}
// //                 </p>
// //               </div>
// //             </div>
// //           ))
// //         )}
// //       </div>
// //     </div>
// //   );
// // }



// "use client";

// import React, { useEffect, useState } from "react";
// import { useLayout } from "@/contexts/LayoutContext";
// import Image from "next/image";

// interface Transaction {
//   id: string; // use string because IDs usually are strings
//   type: "credit" | "debit";
//   category: string;
//   amount: number;
//   createdAt: string;
// }

// export default function BetHistory() {
//   const { setShowHeaderFooter } = useLayout();
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setShowHeaderFooter(false);
//     return () => setShowHeaderFooter(true);
//   }, [setShowHeaderFooter]);

//   useEffect(() => {
//     async function fetchTransactions() {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await fetch("https://ctbackend.crobstacle.com/api/wallet/transactions", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (!response.ok) throw new Error("Failed to fetch");
//         const data = await response.json();
//         // Assign only game category transactions
//         // Explicitly cast as Transaction[] before filtering, for type safety
//         const allTransactions: Transaction[] = data.data?.data ?? [];
//         setTransactions(
//           allTransactions.filter((t) => t.category === "game")
//         );
//       } catch (error) {
//         console.error("Error fetching transactions:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchTransactions();
//   }, []);

//   const handleBackButtonClick = () => {
//     window.history.back();
//   };

//   return (
//     <div className="min-h-[100vh] bg-green-50 relative">
//       <div className="bg-[#1ab266] px-5">
//         <div className="relative">
//           <button onClick={handleBackButtonClick} className="absolute left-0 top-[15px]">
//             <Image src="/back-white.png" alt="back-button" width={100} height={100} className="w-5" />
//           </button>
//         </div>
//         <h1 className="text-xl font-semibold text-white text-center py-3">Bet History</h1>
//       </div>

//       <div className="px-5">
//         {loading ? (
//           <p className="text-center mt-5">Loading transactions...</p>
//         ) : transactions.length === 0 ? (
//           <p className="text-center mt-5">No game transactions found</p>
//         ) : (
//           transactions.map((transaction) => (
//             <div key={transaction.id} className="flex justify-between p-4 bg-white my-4 rounded-xl">
//               <div>
//                 <h1 className="text-lg font-bold uppercase">{transaction.type}</h1>
//                 <p className="text-sm">{new Date(transaction.createdAt).toLocaleString()}</p>
//               </div>
//               <div>
//                 <h1
//                   className={`text-xl font-bold ${
//                     transaction.type === "debit" ? "text-red-500" : "text-green-600"
//                   }`}
//                 >
//                   {transaction.type === "debit" ? "Loss" : "Profit"}
//                 </h1>
//                 <p
//                   className={`text-md font-semibold ${
//                     transaction.type === "debit" ? "text-red-500" : "text-green-600"
//                   }`}
//                 >
//                   {transaction.type === "debit"
//                     ? `- ₹ ${Math.abs(transaction.amount)}`
//                     : `+ ₹ ${transaction.amount}`}
//                 </p>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import Image from "next/image";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  category: string;
  amount: number;
  createdAt: string;
}

export default function BetHistory() {
  const { setShowHeaderFooter } = useLayout();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  useEffect(() => {
    async function fetchTransactions() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("https://ctbackend.crobstacle.com/api/wallet/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        const allTransactions: Transaction[] = data.data?.data ?? [];
        setTransactions(
          allTransactions.filter((t) => t.category === "game")
        );
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  const handleBackButtonClick = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-[#1ab266] px-3 sm:px-5">
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
          Bet History
        </h1>
      </div>

      {/* Transactions */}
      <div className="px-3 sm:px-5 pb-6">
        {loading ? (
          <p className="text-center mt-5 text-sm sm:text-base">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center mt-5 text-sm sm:text-base text-gray-600">
            No game transactions found
          </p>
        ) : (
          transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex justify-between items-start p-3 sm:p-4 bg-white my-3 sm:my-4 rounded-xl shadow-sm"
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
                    transaction.type === "debit" ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {transaction.type === "debit" ? "Loss" : "Profit"}
                </h1>
                <p
                  className={`text-sm sm:text-md font-semibold mt-1 ${
                    transaction.type === "debit" ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {transaction.type === "debit"
                    ? `- ₹${Math.abs(transaction.amount)}`
                    : `+ ₹${transaction.amount}`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
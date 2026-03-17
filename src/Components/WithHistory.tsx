// "use client";

// import React, { useEffect, useState } from "react";
// import { useLayout } from "@/contexts/LayoutContext";
// import Image from "next/image";

// interface Transaction {
//   id: number;
//   type: string; // Deposit, Withdrawal, etc.
//   amount: number;
//   status: string; // Success, Failed, etc.
//   createdAt: string;
//   category: string; // e.g. "money"
// }

// export default function WithHistory() {
//   const { setShowHeaderFooter } = useLayout();

//   useEffect(() => {
//     setShowHeaderFooter(false);
//     return () => setShowHeaderFooter(true);
//   }, [setShowHeaderFooter]);

//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);

//   const API_URL = "https://ctbackend.crobstacle.com/api/wallet/transactions";

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           alert("Failed to show Transaction ");
//           setLoading(false);
//           return;
//         }

//         const response = await fetch(API_URL, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (!response.ok) {
//           throw new Error("Failed to fetch transactions");
//         }
//         const data = await response.json();

//         setTransactions(data.data?.data || []);
//       } catch (error) {
//         console.error("Error fetching transactions:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTransactions();
//   }, []);

//   const handleBackButtonClick = () => {
//     window.history.back();
//   };

//   return (
//     <div className="min-h-[100vh] bg-green-50 relative">
//       {/* Header section */}
//       <div className="bg-[#1ab266] px-5">
//         <div className="relative">
//           <button onClick={handleBackButtonClick} className="absolute left-0 top-[15px]">
//             <Image src="/back-white.png" alt="back-button" width={100} height={100} className="w-5" />
//           </button>
//         </div>
//         <h1 className="text-xl font-semibold text-white text-center py-3">Withdrawal History</h1>
//       </div>

//       {/* Transactions Section */}
//       <div className="px-5">
//         {loading ? (
//           <p className="text-center mt-5">Loading transactions...</p>
//         ) : transactions.filter(tx => tx.category === "money" && tx.type === "debit").length > 0 ? (
//           transactions
//             .filter(tx => tx.category === "money" && tx.type === "debit")
//             .map((transaction) => (
//               <div key={transaction.id} className="flex justify-between p-4 bg-white my-4 rounded-xl">
//                 <div>
//                   <h1 className="text-lg font-bold uppercase">{transaction.type}</h1>
//                   <p className="text-sm">{new Date(transaction.createdAt).toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <h1 className="text-xl text-red-500 font-bold">{transaction.status}</h1>
//                   <p
//                     className={`text-md font-semibold ${
//                       transaction.amount < 0 ? "text-red-500" : "text-red-500"
//                     }`}
//                   >
//                     {transaction.amount < 0
//                       ? `- ₹ ${Math.abs(transaction.amount)}`
//                       : `- ₹ ${transaction.amount}`}
//                   </p>
//                 </div>
//               </div>
//             ))
//         ) : (
//           <p className="text-center mt-5">No transactions found</p>
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
  id: number;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  category: string;
}

export default function WithHistory() {
  const { setShowHeaderFooter } = useLayout();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://ctbackend.crobstacle.com/api/wallet/transactions";

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
    <div className="min-h-screen bg-green-50">
      {/* Header section */}
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
          Withdrawal History
        </h1>
      </div>

      {/* Transactions Section */}
      <div className="px-3 sm:px-5 pb-6">
        {loading ? (
          <p className="text-center mt-5 text-sm sm:text-base">Loading transactions...</p>
        ) : transactions.filter(tx => tx.category === "money" && tx.type === "debit").length > 0 ? (
          transactions
            .filter(tx => tx.category === "money" && tx.type === "debit")
            .map((transaction) => (
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
                  <h1 className="text-sm sm:text-xl text-red-500 font-bold">
                    {transaction.status}
                  </h1>
                  <p className="text-sm sm:text-md font-semibold mt-1 text-red-500">
                    {transaction.amount < 0
                      ? `- ₹${Math.abs(transaction.amount)}`
                      : `- ₹${transaction.amount}`}
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
}
// // wallet page that uses the global socket context

// 'use client';

// import React, { useEffect, useState } from "react";
// import { useLayout } from "@/contexts/LayoutContext";
// import { useSocket } from "@/contexts/SocketContext";
// import Image from "next/image";
// import Footer from "@/Components/CommonComponents/Footer";
// import Link from "next/link";
// import useRequireAuth from "@/hooks/useRequireAuth";

// const Wallet = () => {
//   useRequireAuth();
//   const [loading, setLoading] = useState(true);
//   const { setShowHeaderFooter } = useLayout();
//   const {  isConnected, balance, refreshBalance } = useSocket();

//   // Handle header/footer visibility
//   useEffect(() => {
//     setShowHeaderFooter(false);
//     return () => setShowHeaderFooter(true);
//   }, [setShowHeaderFooter]);

//   // Refresh balance when component mounts and when connection status changes
//   useEffect(() => {
//     if (isConnected) {
//       refreshBalance();
//     }
//   }, [isConnected, refreshBalance]);

//   // Update loading state based on connection and balance
//   useEffect(() => {
//     setLoading(!isConnected || balance === null);
//   }, [isConnected, balance]);

//   const totalWalletLimit = 1000000;
//   const handleBackButtonClick = () => {
//     window.history.back();
//   };

//   const progressPercentage = balance !== null ? (balance / totalWalletLimit) * 100 : 0;
//   const circleCircumference = 2 * Math.PI * 50;
//   const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

//   return (
//     <div className="">
//       {/* Wallet Section */}
//       <div className="flex-1">
//         <div className="bg-[#1ab266] px-5 pt-3 pb-6 h-full">
//           <div className="relative flex flex-col gap-3 items-center text-white">
//             <h1 className="text-2xl mb-3">Wallet</h1>
//             <Image
//               className="w-14 mx-auto"
//               src="/wallets.png"
//               width={160}
//               height={160}
//               alt="Wallet Icon"
//             />

//             {/* Display balance or loading/error states */}
//             <h1 className="text-xl font-semibold">Total Amount</h1>
//             <h1 className="text-base">
//               {!isConnected
//                 ? "Please login to view your Balance"
//                 : loading
//                 ? "Loading..."
//                 : `₹${balance?.toFixed(2)}`}
//             </h1>

//             {/* Back button */}
//             <button
//               onClick={handleBackButtonClick}
//               className="absolute left-0 top-[7px]"
//             >
//               <Image
//                 src="/back-white.png"
//                 alt="back-button"
//                 width={100}
//                 height={100}
//                 className="w-5"
//               />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Progress Bar Section */}
//       <div className="px-5 flex flex-col text-center py-10 gap-8">
//         <div className="flex flex-col justify-center items-center gap-2">
//           {/* Circular Progress Bar */}
//           <div className="relative flex justify-center items-center">
//             <svg
//               className="transform rotate-90"
//               width="120"
//               height="120"
//               viewBox="0 0 120 120"
//             >
//               {/* Background Circle */}
//               <circle
//                 cx="60"
//                 cy="60"
//                 r="50"
//                 stroke="#e6e6e6"
//                 strokeWidth="10"
//                 fill="none"
//               />
//               {/* Foreground Circle for progress */}
//               <circle
//                 cx="60"
//                 cy="60"
//                 r="50"
//                 stroke="#1ab266"
//                 strokeWidth="10"
//                 fill="none"
//                 strokeDasharray={circleCircumference}
//                 strokeDashoffset={strokeDashoffset}
//                 strokeLinecap="round"
//               />
//             </svg>

//             {/* Display Progress Percentage */}
//             <div className="absolute text-center">
//               <h1 className="text-2xl">
//                 {loading ? "..." : `${progressPercentage.toFixed(2)}%`}
//               </h1>
//             </div>
//           </div>
//           <h1 className="text-center font-semibold text-[#1ab266]">
//             <span className="text-black">Current Amount:</span>{" "}
//             {!isConnected ? "Login to view Amount" : `₹${loading ? "..." : balance?.toFixed(2)}`}
//           </h1>
//         </div>

//         {/* Add to Wallet Button */}
//         <Link href="/addMoney">
//           <div className="bg-[#1ab266] py-2 font-semibold text-white text-xl w-full rounded-3xl cursor-pointer select-none">
//             ADD TO WALLET
//           </div>
//         </Link>

//         {/* Wallet Actions */}
//         <div className="flex justify-center py-5 font-semibold text-sm">
//           <Link
//             href="/addMoney"
//             className="rounded-md basis-1/4 flex flex-col items-center gap-3"
//           >
//             <Image
//               className="w-12 p-2 rounded-lg shadow-lg"
//               src="/deposit.png"
//               width={100}
//               height={100}
//               alt="Wallet Icon"
//             />
//             <h1>Add <br /> Money</h1>
//           </Link>

//           <Link
//             href="/withMoney"
//             className="rounded-md basis-1/4 flex flex-col items-center gap-3"
//           >
//             <Image
//               className="w-12 p-2 rounded-lg shadow-lg"
//               src="/withdrawal.png"
//               width={100}
//               height={100}
//               alt="Withdrawal Icon"
//             />
//             <h1>Withdrawal Money</h1>
//           </Link>

//           <Link
//             href="/deposithistory"
//             className="rounded-md basis-1/4 flex flex-col items-center gap-3"
//           >
//             <Image
//               className="w-12 p-2 rounded-lg shadow-lg"
//               src="/dep-history.png"
//               width={100}
//               height={100}
//               alt="deposit history"
//             />
//             <h1>Deposit <br /> History</h1>
//           </Link>

//           <Link
//             href="/withdrawalhistory"
//             className="rounded-md basis-1/4 flex flex-col items-center gap-3"
//           >
//             <Image
//               className="w-12 p-2 rounded-lg shadow-lg"
//               src="/withd-history.png"
//               width={100}
//               height={100}
//               alt="Wallet Icon"
//             />
//             <h1>Withdrawal History</h1>
//           </Link>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default Wallet;

'use client';

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useSocket } from "@/contexts/SocketContext";
import Image from "next/image";
import Footer from "@/Components/CommonComponents/Footer";
import Link from "next/link";
import useRequireAuth from "@/hooks/useRequireAuth";

const Wallet = () => {
  useRequireAuth();
  const [loading, setLoading] = useState(true);
  const { setShowHeaderFooter } = useLayout();
  const { isConnected, balance, refreshBalance } = useSocket();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  useEffect(() => {
    if (isConnected) {
      refreshBalance();
    }
  }, [isConnected, refreshBalance]);

  useEffect(() => {
    setLoading(!isConnected || balance === null);
  }, [isConnected, balance]);

  const totalWalletLimit = 1000000;
  const handleBackButtonClick = () => {
    window.history.back();
  };

  const progressPercentage = balance !== null ? (balance / totalWalletLimit) * 100 : 0;
  const circleCircumference = 2 * Math.PI * 50;
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  return (
    <div className="">
      {/* Wallet Section */}
      <div className="flex-1">
        <div className="bg-[#1ab266] px-4 sm:px-5 pt-2 sm:pt-3 pb-5 sm:pb-6 h-full">
          <div className="relative flex flex-col gap-2 sm:gap-3 items-center text-white">
            <h1 className="text-xl sm:text-2xl mb-2 sm:mb-3">Wallet</h1>
            <Image
              className="w-12 sm:w-14 mx-auto"
              src="/wallets.png"
              width={160}
              height={160}
              alt="Wallet Icon"
            />

            {/* Display balance or loading/error states */}
            <h1 className="text-lg sm:text-xl font-semibold">Total Amount</h1>
            <h1 className="text-sm sm:text-base">
              {!isConnected
                ? "Please login to view your Balance"
                : loading
                ? "Loading..."
                : `₹${balance?.toFixed(2)}`}
            </h1>

            {/* Back button */}
            <button
              onClick={handleBackButtonClick}
              className="absolute left-0 top-[5px] sm:top-[7px]"
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
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="px-4 sm:px-5 flex flex-col text-center py-6 sm:py-10 gap-5 sm:gap-8">
        <div className="flex flex-col justify-center items-center gap-2">
          {/* Circular Progress Bar */}
          <div className="relative flex justify-center items-center">
            <svg
              className="transform rotate-90"
              width="100"
              height="100"
              viewBox="0 0 120 120"
            >
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#e6e6e6"
                strokeWidth="10"
                fill="none"
              />
              {/* Foreground Circle for progress */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#1ab266"
                strokeWidth="10"
                fill="none"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Display Progress Percentage */}
            <div className="absolute text-center">
              <h1 className="text-xl sm:text-2xl">
                {loading ? "..." : `${progressPercentage.toFixed(2)}%`}
              </h1>
            </div>
          </div>
          <h1 className="text-center font-semibold text-[#1ab266] text-sm sm:text-base">
            <span className="text-black">Current Amount:</span>{" "}
            {!isConnected ? "Login to view Amount" : `₹${loading ? "..." : balance?.toFixed(2)}`}
          </h1>
        </div>

        {/* Add to Wallet Button */}
        <Link href="/addMoney">
          <div className="bg-[#1ab266] py-2 font-semibold text-white text-lg sm:text-xl w-full rounded-3xl cursor-pointer select-none">
            ADD TO WALLET
          </div>
        </Link>

        {/* Wallet Actions */}
        <div className="flex justify-center py-3 sm:py-5 font-semibold text-xs sm:text-sm gap-2">
          <Link
            href="/addMoney"
            className="rounded-md basis-1/4 flex flex-col items-center gap-2 sm:gap-3"
          >
            <Image
              className="w-10 sm:w-12 p-2 rounded-lg shadow-lg"
              src="/deposit.png"
              width={100}
              height={100}
              alt="Wallet Icon"
            />
            <h1 className="text-center leading-tight">
              Add <br /> Money
            </h1>
          </Link>

          <Link
            href="/withMoney"
            className="rounded-md basis-1/4 flex flex-col items-center gap-2 sm:gap-3"
          >
            <Image
              className="w-10 sm:w-12 p-2 rounded-lg shadow-lg"
              src="/withdrawal.png"
              width={100}
              height={100}
              alt="Withdrawal Icon"
            />
            <h1 className="text-center leading-tight">
              Withdrawal Money
            </h1>
          </Link>

          <Link
            href="/deposithistory"
            className="rounded-md basis-1/4 flex flex-col items-center gap-2 sm:gap-3"
          >
            <Image
              className="w-10 sm:w-12 p-2 rounded-lg shadow-lg"
              src="/dep-history.png"
              width={100}
              height={100}
              alt="deposit history"
            />
            <h1 className="text-center leading-tight">
              Deposit <br /> History
            </h1>
          </Link>

          <Link
            href="/withdrawalhistory"
            className="rounded-md basis-1/4 flex flex-col items-center gap-2 sm:gap-3"
          >
            <Image
              className="w-10 sm:w-12 p-2 rounded-lg shadow-lg"
              src="/withd-history.png"
              width={100}
              height={100}
              alt="Wallet Icon"
            />
            <h1 className="text-center leading-tight">
              Withdrawal History
            </h1>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Wallet;
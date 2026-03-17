// "use client";

// import { useLayout } from "@/contexts/LayoutContext";
// import useRequireAuth from "@/hooks/useRequireAuth";
// import Image from "next/image";
// import React, { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useSocket } from "@/contexts/SocketContext"; // Use global socket context now

// export default function WalletInfo() {
//   const { setShowHeaderFooter } = useLayout();
//   const router = useRouter();

//   useRequireAuth();

//   // Get live balance and refresh function from socket context
//   const { balance, refreshBalance, isConnected } = useSocket();

//   useEffect(() => {
//     setShowHeaderFooter(false);
//     return () => setShowHeaderFooter(true);
//   }, [setShowHeaderFooter]);

//   // Ask for latest balance on mount
//   useEffect(() => {
//     if (isConnected) {
//       refreshBalance();
//     }
//   }, [isConnected, refreshBalance]);

//   // Handler for Back button
//   const back = () => {
//     router.push("/");
//   };

//   return (
//     <>
//       <div className="bg-green-500 rounded-b-[55px] pb-12 p-2">
//         <Image
//           onClick={back}
//           className="absolute left-4 top-4 w-5 h-5 cursor-pointer"
//           src="/leftArrow.png"
//           alt="Back"
//           width={24}
//           height={24}
//         />

//         <div className="flex justify-center">
//           <Image
//             className="w-24 h-10"
//             src="/headerlogo.png"
//             alt="Logo"
//             width={96}
//             height={40}
//           />
//         </div>

//         <div className="bg-[url('/walletbg.png')] bg-center bg-cover bg-white mx-5 rounded-2xl p-4 my-3">
//           <div className="flex justify-center gap-2 items-center">
//             <h1 className="text-2xl font-bold">
//               {!isConnected
//                 ? "Login to view balance"
//                 : balance === null
//                 ? "Loading..."
//                 : `₹ ${balance.toFixed(2)}`}
//             </h1>
//             <Image
//               onClick={() => refreshBalance()}
//               className={`w-4 h-4 cursor-pointer ${!isConnected ? "opacity-50 pointer-events-none" : ""}`}
//               src="/refresh.png"
//               width={16}
//               height={16}
//               alt="Refresh"
//             />
//           </div>

//           <div className="flex justify-center gap-2 items-center">
//             <Image
//               className="w-5 h-5"
//               src="/wallet.png"
//               width={20}
//               height={20}
//               alt="Wallet"
//             />
//             <h1 className="text-md font-sm">Wallet Balance</h1>
//           </div>
//           <div className="grid grid-cols-2 justify-between mt-10 gap-5">
//             <Link href="/addMoney">
//               <button className="bg-green-600 p-2 w-full md:px-16 rounded-3xl text-white text-lg font-semibold">
//                 Deposit
//               </button>
//             </Link>
//             <Link href="/withMoney">
//               <button className="bg-green-600 p-2  w-full md:px-16 rounded-3xl text-white text-lg font-semibold">
//                 Withdraw
//               </button>
//             </Link>
//           </div>
//         </div>

//         {/* Marquee section */}
//         <div className="bg-white mx-5 rounded-full my-4 py-1 flex justify-between items-center p-2">
//           <h1 className="text-2xl">⭐</h1>
//           <div className="overflow-hidden">
//             <div className="whitespace-nowrap animate-marquee py-2">
//               <h1 className="font-sm">
//                 Your satisfaction is our top priority. Play at your own risk.
//               </h1>
//             </div>
//           </div>
//           <button className="p-1 px-4 text-sm bg-red-500 text-white rounded-full font-semibold">
//             Details
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import { useLayout } from "@/contexts/LayoutContext";
import useRequireAuth from "@/hooks/useRequireAuth";
import Image from "next/image";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/contexts/SocketContext";

export default function WalletInfo() {
  const { setShowHeaderFooter } = useLayout();
  const router = useRouter();

  useRequireAuth();

  const { balance, refreshBalance, isConnected } = useSocket();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  useEffect(() => {
    if (isConnected) {
      refreshBalance();
    }
  }, [isConnected, refreshBalance]);

  const back = () => {
    router.push("/");
  };

  return (
    <>
      <div className="bg-[#333332] text-white rounded-b-[55px] pb-8 sm:pb-12 p-2">
        <Image
          onClick={back}
          className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer"
          src="/leftArrow.png"
          alt="Back"
          width={24}
          height={24}
        />

        <div className="flex justify-center pt-1">
          <Image
            className="w-20 h-8 sm:w-24 sm:h-10"
            src="/headerlogo1.png"
            alt="Logo"
            width={96}
            height={40}
          />
        </div>

        <div className="bg-[url('/walletbg.webp')] bg-center bg-cover bg-white/10 mx-4 sm:mx-5 rounded-2xl p-3 sm:p-4 my-3">
          <div className="flex justify-center gap-2 items-center">
            <h1 className="text-xl sm:text-2xl font-bold">
              {!isConnected
                ? "Login to view balance"
                : balance === null
                  ? "Loading..."
                  : `₹ ${balance.toFixed(2)}`}
            </h1>
            <Image
              onClick={() => refreshBalance()}
              className={`w-4 h-4 cursor-pointer ${!isConnected ? "opacity-50 pointer-events-none" : ""}`}
              src="/refresh.png"
              width={16}
              height={16}
              alt="Refresh"
            />
          </div>

          <div className="flex justify-center gap-2 items-center mt-1">
            {/* updated wallet svg logo */}
            <svg
              viewBox="0 0 40 40"
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              fill="none"
            >
              <path
                opacity="0.5"
                d="M24.7493 6.58594L24.7494 23.2826H10.4327C6.98268 23.2826 4.16602 26.0993 4.16602 29.5493V13.0693C4.16602 11.0859 5.38268 9.31927 7.23268 8.61927L20.466 3.61927C22.5327 2.8526 24.7493 4.36927 24.7493 6.58594ZM37.5977 23.2826V26.7159C37.5977 27.6326 36.8643 28.3826 35.931 28.4159H32.6643C30.8643 28.4159 29.2143 27.0993 29.0643 25.2993C28.9643 24.2493 29.3643 23.2659 30.0643 22.5826C30.681 21.9493 31.531 21.5826 32.4643 21.5826H35.931C36.8643 21.6159 37.5977 22.3659 37.5977 23.2826Z"
                fill="currentColor"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M29.066 25.2993C28.966 24.2493 29.366 23.266 30.066 22.5827C30.6827 21.9493 31.5327 21.5827 32.466 21.5827H35.8327V19.1827C35.8327 15.7327 33.016 12.916 29.566 12.916H10.4327C6.98268 12.916 4.16602 15.7327 4.16602 19.1827V30.3993C4.16602 33.8493 6.98268 36.666 10.4327 36.666H29.566C33.016 36.666 35.8327 33.8493 35.8327 30.3993V28.416H32.666C30.866 28.416 29.216 27.0993 29.066 25.2993ZM22.4167 22.5H10.75C10.0667 22.5 9.5 21.9333 9.5 21.25C9.5 20.5667 10.0667 20 10.75 20H22.4167C23.1 20 23.6667 20.5667 23.6667 21.25C23.6667 21.9333 23.1 22.5 22.4167 22.5Z"
                fill="currentColor"
              />
            </svg>

            <h1 className="text-sm sm:text-md font-sm">Wallet Balance</h1>
          </div>

          <div className="grid grid-cols-2 justify-between mt-6 sm:mt-10 gap-3 sm:gap-5">
            <Link href="/addMoney" className="w-full">
              <button className="bg-green-600 p-2 w-full rounded-3xl text-white text-base sm:text-lg font-semibold">
                Deposit
              </button>
            </Link>
            <Link href="/withMoney" className="w-full">
              <button className="bg-[#d23838] p-2 w-full rounded-3xl text-white text-base sm:text-lg font-semibold">
                Withdraw
              </button>
            </Link>
          </div>
        </div>

        {/* Marquee section */}
        <div className="bg-white/10 mx-4 sm:mx-5 rounded-full my-4 py-1 flex justify-between items-center p-2 gap-1 sm:gap-2">
          <h1 className="text-xl sm:text-2xl flex-shrink-0">⭐</h1>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="whitespace-nowrap animate-marquee py-2">
              <h1 className="text-xs text-white sm:text-sm">
                Your satisfaction is our top priority. Play at your own risk.
              </h1>
            </div>
          </div>
          <button className="p-1 px-3 sm:px-4 text-xs sm:text-sm bg-red-500 text-white rounded-full font-semibold flex-shrink-0">
            Details
          </button>
        </div>
      </div>
    </>
  );
}

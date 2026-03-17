// "use client";

// import Min3Game4 from "@/Components/Games/Min3Game4";
// import WalletInfo from "@/Components/Games/WalletInfo";
// import Image from "next/image";
// import Link from "next/link";
// import React from "react";

// export default function page() {

//   const tabs = [
//     { id: "3MinGame1", label: "Game 1", img: "/clock.png", route: "/game1" },
//     { id: "3MinGame2", label: "Game 2", img: "/clock.png", route: "/game2" },
//     { id: "3MinGame3", label: "Game 3", img: "/clock.png", route: "/game3" },
//     { id: "3MinGame4", label: "Game 4", img: "/clock.png", route: "/game4" },
//   ];

//   return (
//     <div className="bg-green-100 min-h-[100vh]">
//       <WalletInfo />

//       <div className="bg-white rounded-2xl -mt-9 mx-3">
//         <div className="w-full p-4 bg-white rounded-2xl mt-4">
//           <div className="flex space-x-2 mb-4 shadow-md rounded-xl">
//             {tabs.map((tab) => (
//               <Link href={tab.route} key={tab.id} className="basis-1/4">
//                 <div
//                   className={`flex flex-col items-center gap-2 px-4 py-1 rounded-xl cursor-pointer ${
//                     tab.id === "3MinGame4"
//                       ? "bg-gradient-to-b from-green-600 to-green-400 text-white"
//                       : "bg-white text-gray-700"
//                   }`}
//                 >
//                   <Image
//                     className={`w-7 ${tab.id === "3MinGame4" ? "" : "grayscale"}`}
//                     src={tab.img}
//                     alt=""
//                     width={100}
//                     height={100}
//                   />
//                   <h1
//                     className={`text-[10px] md:text-[13px] font-semibold ${
//                       tab.id === "3MinGame4" ? "text-white" : "text-gray-400"
//                     }`}
//                   >
//                     Win Go
//                   </h1>
//                   <p
//                     className={`text-sm -mt-2 md:text-md ${
//                       tab.id === "3MinGame4" ? "text-white" : "text-gray-400"
//                     }`}
//                   >
//                     {tab.label}
//                   </p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//           <Min3Game4 />
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import Min3Game4 from "@/Components/Games/Min3Game4";
// import WalletInfo from "@/Components/Games/WalletInfo";
// import Image from "next/image";
// import Link from "next/link";
// import React from "react";

// export default function page() {
//   const tabs = [
//     { id: "3MinGame1", label: "Game 1", route: "/game1" },
//     { id: "3MinGame2", label: "Game 2", route: "/game2" },
//     { id: "3MinGame3", label: "Game 3", route: "/game3" },
//     { id: "3MinGame4", label: "Game 4", route: "/game4" },
//   ];

//   return (
//     <div className="bg-[#333332] min-h-[100vh]">
//       <WalletInfo />

//       <div className="bg-[#333332] rounded-2xl -mt-9 mx-2 sm:mx-3">
//         <div className="w-full p-2 sm:p-4 bg-[#333332] rounded-2xl mt-4">
//           <div className="flex gap-1 sm:gap-2 mb-4 shadow-md bg-white/10 rounded-xl overflow-hidden">
//             {tabs.map((tab) => {
//               const isActive = tab.id === "3MinGame4";

//               return (
//                 <Link href={tab.route} key={tab.id} className="flex-1 min-w-0">
//                   <div
//                     className={`flex flex-col items-center bg-white/10 justify-center gap-1 sm:gap-1 px-1.5 sm:px-4 py-2 sm:py-1 rounded-xl cursor-pointer transition-colors ${
//                       isActive
//                         ? "bg-gradient-to-b from-[#FAE59F] to-[#C4933F] text-white"
//                         : "bg-[#333332] text-gray-700"
//                     }`}
//                   >
//                     <Image
//                       className="w-5 h-5 sm:w-7 sm:h-7 flex-shrink-0"
//                       src={
//                         isActive ? "/clockColored.webp" : "/clockNoColor.webp"
//                       }
//                       alt=""
//                       width={28}
//                       height={28}
//                     />

//                     <h1
//                       className={`text-[12px] sm:text-[12px] md:text-[13px] font-semibold leading-tight ${
//                         isActive ? "text-white" : "text-gray-400"
//                       }`}
//                     >
//                       Win Go
//                     </h1>

//                     <p
//                       className={`text-[11px] sm:text-[11px] md:text-sm -mt-0.5 sm:-mt-2 leading-tight ${
//                         isActive ? "text-white" : "text-gray-400"
//                       }`}
//                     >
//                       {tab.label}
//                     </p>
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>
//           <Min3Game4 />
//         </div>
//       </div>
//     </div>
//   );
// }

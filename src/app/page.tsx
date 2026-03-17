// "use client";

// import React from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import PayoutTable from "@/Components/LandingPageComponents/Payout";

// export default function Home() {
//   const router = useRouter();

//   const handleGameClick = (route: string) => {
//     const token =
//       typeof window !== "undefined" ? localStorage.getItem("token") : null;
//     if (token) {
//       router.push(route);
//     } else {
//       toast.info("You will need to login first to access this game");
//     }
//   };

//   // const colors = ["Green", "Violet", "Red"]; // example reuse if needed

//   return (
//     <>
//       <div className="overflow-hidden mx-auto bg-green-100 px-5 flex flex-col gap-5 py-20">
//         {/* Section 1 */}
//         <div>
//           <Image
//             src="/image1.png"
//             alt="image"
//             width={645}
//             height={300}
//             className="rounded-lg"
//           />
//         </div>

//         <div className="bg-white rounded-full flex justify-between items-center px-2 py-1">
//           <h1 className="text-2xl">⭐</h1>
//           <div className="overflow-hidden text-sm">
//             <div className="whitespace-nowrap animate-marquee py-2">
//               <h1 className="">
//                 Your satisfaction is our top Priority. Please fill your card
//                 information correctly.
//               </h1>
//             </div>{" "}
//           </div>
//           <button className="py-1 px-4 text-sm bg-[#1ab266] text-white rounded-full font-semibold">
//             Details
//           </button>
//         </div>

//         {/* Section 2: Games */}
//         <div className="text-center bg-cover rounded-lg">
//           <h1 className="text-2xl font-bold text-black mb-5">
//             Play Exciting Games
//           </h1>
//           <div className="flex flex-col text-left gap-8">
//             {/* Game 1 */}
//             <div
//               onClick={() => handleGameClick("/game1")}
//               className="flex-1 cursor-pointer"
//             >
//               <div className="bg-gradient-to-r from-green-600 rounded-t-xl p-4 relative">
//                 <h3 className="text-white text-xl font-bold mb-2">
//                   Game 1 
//                 </h3>
//                 <p className="text-gray-200 font-semibold text-sm md:text-base w-[60%] md:w-auto ">
//                   Guess Number, Green, Purple, Red to Win
//                 </p>
//                 <Image
//                   alt="940 balls"
//                   src="/940balls.png"
//                   width={290}
//                   height={216}
//                   className="absolute -top-4 right-0 w-36"
//                 />
//               </div>
//               <div className="bg-white p-4 rounded-b-xl">
//                 <div className="flex justify-between items-center">
//                   <div className="flex gap-4 items-center">
//                     <Image
//                       alt="Player avatar"
//                       src="/avatar2.png"
//                       width={40}
//                       height={40}
//                     />
//                     <h4 className="text-base font-semibold">Name of Person</h4>
//                   </div>
//                   <p className="text-sm text-gray-800 font-semibold">
//                     Won Rs 11294
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Game 2 */}
//             <div
//               onClick={() => handleGameClick("/game2")}
//               className="flex-1 cursor-pointer"
//             >
//               <div className="bg-gradient-to-r from-green-600 rounded-t-xl p-4 relative">
//                 <h3 className="text-white text-xl font-bold mb-2">
//                    Game 2 
//                 </h3>
//                 <p className="text-gray-200 font-semibold text-sm md:text-base w-[60%] md:w-auto ">
//                   Guess Number, Green, Purple, Red to Win
//                 </p>
//                 <Image
//                   alt="940 balls"
//                   src="/940balls.png"
//                   width={290}
//                   height={216}
//                   className="absolute -top-4 right-0 w-36"
//                 />
//               </div>
//               <div className="bg-white p-4 rounded-b-xl">
//                 <div className="flex justify-between items-center">
//                   <div className="flex gap-4 items-center">
//                     <Image
//                       alt="Player avatar"
//                       src="/avatar2.png"
//                       width={40}
//                       height={40}
//                     />
//                     <h4 className="text-base font-semibold">Name of Person</h4>
//                   </div>
//                   <p className="text-sm text-gray-800 font-semibold">
//                     Won Rs 11294
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Game 3 */}
//             <div
//               onClick={() => handleGameClick("/game3")}
//               className="flex-1 cursor-pointer"
//             >
//               <div className="bg-gradient-to-r from-green-600 rounded-t-xl p-4 relative">
//                 <h3 className="text-white text-xl font-bold mb-2">
//                    Game 3 
//                 </h3>
//                 <p className="text-gray-200 font-semibold text-sm md:text-base w-[60%] md:w-auto ">
//                   Guess Number, Green, Purple, Red to Win
//                 </p>
//                 <Image
//                   alt="940 balls"
//                   src="/940balls.png"
//                   width={290}
//                   height={216}
//                   className="absolute -top-4 right-0 w-36"
//                 />
//               </div>
//               <div className="bg-white p-4 rounded-b-xl">
//                 <div className="flex justify-between items-center">
//                   <div className="flex gap-4 items-center">
//                     <Image
//                       alt="Player avatar"
//                       src="/avatar2.png"
//                       width={40}
//                       height={40}
//                     />
//                     <h4 className="text-base font-semibold">Name of Person</h4>
//                   </div>
//                   <p className="text-sm text-gray-800 font-semibold">
//                     Won Rs 11294
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Game 4 */}
//             <div
//               onClick={() => handleGameClick("/game4")}
//               className="flex-1 cursor-pointer"
//             >
//               <div className="bg-gradient-to-r from-green-600 rounded-t-xl p-4 relative">
//                 <h3 className="text-white text-xl font-bold mb-2">
//                    Game 4 
//                 </h3>
//                 <p className="text-gray-200 font-semibold text-sm  md:text-base w-[60%] md:w-auto ">
//                   Guess Number, Green, Purple, Red to Win
//                 </p>
//                 <Image
//                   alt="940 balls"
//                   src="/940balls.png"
//                   width={290}
//                   height={216}
//                   className="absolute -top-4 right-0 w-36"
//                 />
//               </div>
//               <div className="bg-white p-4 rounded-b-xl">
//                 <div className="flex justify-between items-center">
//                   <div className="flex gap-4 items-center">
//                     <Image
//                       alt="Player avatar"
//                       src="/avatar2.png"
//                       width={40}
//                       height={40}
//                     />
//                     <h4 className="text-base font-semibold">Name of Person</h4>
//                   </div>
//                   <p className="text-sm text-gray-800 font-semibold">
//                     Won Rs 11294
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Section 4 */}
//         <div>
//           <PayoutTable />
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import PayoutTable from "@/Components/LandingPageComponents/Payout";

export default function Home() {
  const router = useRouter();

  const handleGameClick = (route: string) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.push(route);
    } else {
      toast.info("You will need to login first to access this game");
    }
  };

  return (
    <>
      <div className="overflow-hidden mx-auto bg-green-100 px-3 sm:px-5 flex flex-col gap-4 sm:gap-5 py-16 sm:py-20">
        {/* Section 1 - Hero Image */}
        <div className="pt-2">
          <Image
            src="/image1.png"
            alt="image"
            width={645}
            height={300}
            className="rounded-lg w-full h-auto"
          />
        </div>

        {/* Marquee Section */}
        <div className="bg-white rounded-full flex justify-between items-center px-2 py-1 gap-1 sm:gap-2">
          <h1 className="text-xl sm:text-2xl flex-shrink-0">⭐</h1>
          <div className="overflow-hidden text-xs sm:text-sm flex-1 min-w-0">
            <div className="whitespace-nowrap animate-marquee py-2">
              <h1>
                Your satisfaction is our top Priority. Please fill your card
                information correctly.
              </h1>
            </div>
          </div>
          <button className="py-1 px-3 sm:px-4 text-xs sm:text-sm bg-[#1ab266] text-white rounded-full font-semibold flex-shrink-0">
            Details
          </button>
        </div>

        {/* Section 2: Games */}
        <div className="text-center bg-cover rounded-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-5">
            Play Exciting Games
          </h1>
          <div className="flex flex-col text-left gap-5 sm:gap-8">
            {/* Game 1 */}
            <div
              onClick={() => handleGameClick("/game1")}
              className="flex-1 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-green-600 rounded-t-xl p-3 sm:p-4 relative min-h-[90px] sm:min-h-[100px]">
                <h3 className="text-white text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  Game 1
                </h3>
                <p className="text-gray-200 font-semibold text-xs sm:text-sm md:text-base w-[55%] sm:w-[60%] md:w-auto pr-2">
                  Guess Number, Green, Purple, Red to Win
                </p>
                <Image
                  alt="940 balls"
                  src="/940balls.png"
                  width={290}
                  height={216}
                  className="absolute -top-3 sm:-top-4 right-0 w-28 sm:w-36"
                />
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-b-xl">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex gap-2 sm:gap-4 items-center min-w-0">
                    <Image
                      alt="Player avatar"
                      src="/avatar2.png"
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                    />
                    <h4 className="text-sm sm:text-base font-semibold truncate">
                      Name of Person
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-semibold whitespace-nowrap">
                    Won Rs 11294
                  </p>
                </div>
              </div>
            </div>

            {/* Game 2 */}
            <div
              onClick={() => handleGameClick("/game2")}
              className="flex-1 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-green-600 rounded-t-xl p-3 sm:p-4 relative min-h-[90px] sm:min-h-[100px]">
                <h3 className="text-white text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  Game 2
                </h3>
                <p className="text-gray-200 font-semibold text-xs sm:text-sm md:text-base w-[55%] sm:w-[60%] md:w-auto pr-2">
                  Guess Number, Green, Purple, Red to Win
                </p>
                <Image
                  alt="940 balls"
                  src="/940balls.png"
                  width={290}
                  height={216}
                  className="absolute -top-3 sm:-top-4 right-0 w-28 sm:w-36"
                />
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-b-xl">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex gap-2 sm:gap-4 items-center min-w-0">
                    <Image
                      alt="Player avatar"
                      src="/avatar2.png"
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                    />
                    <h4 className="text-sm sm:text-base font-semibold truncate">
                      Name of Person
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-semibold whitespace-nowrap">
                    Won Rs 11294
                  </p>
                </div>
              </div>
            </div>

            {/* Game 3 */}
            <div
              onClick={() => handleGameClick("/game3")}
              className="flex-1 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-green-600 rounded-t-xl p-3 sm:p-4 relative min-h-[90px] sm:min-h-[100px]">
                <h3 className="text-white text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  Game 3
                </h3>
                <p className="text-gray-200 font-semibold text-xs sm:text-sm md:text-base w-[55%] sm:w-[60%] md:w-auto pr-2">
                  Guess Number, Green, Purple, Red to Win
                </p>
                <Image
                  alt="940 balls"
                  src="/940balls.png"
                  width={290}
                  height={216}
                  className="absolute -top-3 sm:-top-4 right-0 w-28 sm:w-36"
                />
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-b-xl">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex gap-2 sm:gap-4 items-center min-w-0">
                    <Image
                      alt="Player avatar"
                      src="/avatar2.png"
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                    />
                    <h4 className="text-sm sm:text-base font-semibold truncate">
                      Name of Person
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-semibold whitespace-nowrap">
                    Won Rs 11294
                  </p>
                </div>
              </div>
            </div>

            {/* Game 4 */}
            <div
              onClick={() => handleGameClick("/game4")}
              className="flex-1 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-green-600 rounded-t-xl p-3 sm:p-4 relative min-h-[90px] sm:min-h-[100px]">
                <h3 className="text-white text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  Game 4
                </h3>
                <p className="text-gray-200 font-semibold text-xs sm:text-sm md:text-base w-[55%] sm:w-[60%] md:w-auto pr-2">
                  Guess Number, Green, Purple, Red to Win
                </p>
                <Image
                  alt="940 balls"
                  src="/940balls.png"
                  width={290}
                  height={216}
                  className="absolute -top-3 sm:-top-4 right-0 w-28 sm:w-36"
                />
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-b-xl">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex gap-2 sm:gap-4 items-center min-w-0">
                    <Image
                      alt="Player avatar"
                      src="/avatar2.png"
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                    />
                    <h4 className="text-sm sm:text-base font-semibold truncate">
                      Name of Person
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-semibold whitespace-nowrap">
                    Won Rs 11294
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 - Payout Table */}
        <div>
          <PayoutTable />
        </div>
      </div>
    </>
  );
}
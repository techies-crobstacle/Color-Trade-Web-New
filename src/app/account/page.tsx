// "use client";

// import React, { useEffect, useState } from "react";
// import { useLayout } from "@/contexts/LayoutContext";
// import { useSocket } from "@/contexts/SocketContext";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import Footer from "@/Components/CommonComponents/Footer";
// import useRequireAuth from "@/hooks/useRequireAuth";

// export default function AccountPage() {
//   useRequireAuth();
//   const { setShowHeaderFooter } = useLayout();
//   const { balance } = useSocket(); // Use balance and refresh from socket
//   const router = useRouter(); 

//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState<{
//     name: string;
//     number: string;
//     uid?: string;
//   } | null>(null);

//   useEffect(() => {
//     setShowHeaderFooter(false);
//     return () => setShowHeaderFooter(true);
//   }, [setShowHeaderFooter]);

//   // Profile fetch effect remains unchanged

//   useEffect(() => {
//   const fetchProfile = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.warn("No token found");
//         setLoading(false);
//         return;
//       }

//       const res = await fetch("https://ctbackend.crobstacle.com/api/users/profile", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!res.ok) {
//         throw new Error(`Failed to fetch profile: ${res.status}`);
//       }

//       const result = await res.json();
//       if (result.success) {
//         setProfile({
//           name: result.data.name,
//           number: result.data.number.value,
//           uid: result.data._id,
//         });
//       } else {
//         console.warn("Profile fetch unsuccessful");
//       }
//     } catch (error) {
//       console.error("Error fetching profile:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   fetchProfile();
// }, []);


//   // Manage loading state with socket balance
//   useEffect(() => {
//     if (balance !== null) setLoading(false);
//   }, [balance]);

//   const handleNav = (path: string) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       router.push(path);
//     } else {
//       toast.info("You will need to login to access that Page");
//     }
//   };

//   return (
//     <div className="flex-1">
//       {/* Section 1 */}
//       <div className="bg-[#1ab266] rounded-b-[4rem] px-10 pt-8 pb-32">
//         <div className="flex gap-3 items-center justify-center">
//           <Image
//             src="/avatar2.png"
//             width={100}
//             height={100}
//             alt="Avatar"
//             className="rounded-full"
//           />
//           <div className="text-white flex flex-col font-semibold items-start gap-1">
//             <h1 className="uppercase text-2xl">{profile?.name || "Loading..."}</h1>
//             <h1 className="bg-orange-200 rounded-full px-2 text-sm text-red-500">
//               UID | {profile?.uid || "Loading..."}
//             </h1>
//             <h1 className="text-sm">Mobile : {profile?.number || "Loading..."}</h1>
//           </div>
//         </div>
//       </div>

//       {/* Section 2 */}
//       <div className="px-5">
//         <div className="bg-green-50 rounded-lg shadow-lg p-5 -mt-28 text-center">
//           <p className="font-semibold">Total Balance</p>
//           <p className="my-2">
//             {loading
//               ? "Loading..."
//               : balance == null
//               ? "Login to view Balance"
//               : `₹ ${balance.toFixed(2)}`}
//           </p>
//           <div className="flex items-center mt-5 font-semibold">
//             <button
//               onClick={() => handleNav("/wallet")}
//               className="flex basis-1/3 flex-col items-center"
//             >
//               <Image src="/wallet.png" width={40} height={40} alt="Wallet" />
//               <span className="text-sm mt-1">Wallet</span>
//             </button>
//             <button
//               onClick={() => handleNav("/addMoney")}
//               className="flex basis-1/3 flex-col items-center"
//             >
//               <Image src="/deposit.png" width={40} height={40} alt="Deposit" />
//               <span className="text-sm mt-1">Deposit</span>
//             </button>
//             <button
//               onClick={() => handleNav("/withMoney")}
//               className="flex basis-1/3 flex-col items-center"
//             >
//               <Image
//                 src="/withdrawal.png"
//                 width={40}
//                 height={40}
//                 alt="Withdrawal"
//               />
//               <span className="text-sm mt-1">Withdrawal</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Section 3 */}
//       <div className="bg-white container grid grid-cols-2 mt-5 gap-3 px-5">
//         <button
//           onClick={() => handleNav("/bethistory")}
//           className="flex bg-green-100 p-3 items-center rounded-lg gap-2"
//         >
//           <Image src="/trnx.png" width={36} height={36} alt="Bet History" />
//           <div>
//             <p className="text-lg text-left">Bet</p>
//             <p className="text-xs text-gray-500">My Bet History</p>
//           </div>
//         </button>
//         <button
//           onClick={() => handleNav("/transactionhistory")}
//           className="flex bg-green-100 p-3 items-center text-left rounded-lg gap-2"
//         >
//           <Image src="/trnsc.png" width={36} height={36} alt="Trans. History" />
//           <div>
//             <p className="text-lg text-left">Transaction</p>
//             <p className="text-xs text-gray-500">My Transaction History</p>
//           </div>
//         </button>
//         <button
//           onClick={() => handleNav("/deposithistory")}
//           className="flex bg-green-100 p-3 items-center rounded-lg gap-2"
//         >
//           <Image
//             src="/4-deposite.png"
//             width={36}
//             height={36}
//             alt="Deposit History"
//           />
//           <div>
//             <p className="text-lg text-left">Deposit</p>
//             <p className="text-xs text-gray-500">My Deposit History</p>
//           </div>
//         </button>
//         <button
//           onClick={() => handleNav("/withdrawalhistory")}
//           className="flex bg-green-100 p-3 items-center rounded-lg gap-2"
//         >
//           <Image
//             src="/withd.png"
//             width={36}
//             height={36}
//             alt="Withdrawal History"
//           />
//           <div>
//             <p className="text-lg text-left">Withdraw</p>
//             <p className="text-xs text-gray-500">My Withdraw History</p>
//           </div>
//         </button>
//       </div>

//       {/* Section 4 */}
//       <div className="my-5 px-5">
//         <div className="rounded-lg bg-green-50 p-3 space-y-2">
//           {[
//             { label: "My Profile", path: "/profile", icon: "/promote.png" },
//             { label: "Settings", path: "/changepassword", icon: "/setting.png" },
//             { label: "About Us", path: "/about", icon: "/about.png" },
//             { label: "Support", path: "/support", icon: "/ticket.png" },
//           ].map(({ label, path, icon }) => (
//             <button
//               key={path}
//               onClick={() => handleNav(path)}
//               className="flex justify-between items-center px-2 py-3 w-full"
//             >
//               <div className="flex items-center gap-3">
//                 <Image src={icon} width={40} height={40} alt={label} />
//                 <span className="font-semibold">{label}</span>
//               </div>
//               <Image src="/next.png" width={28} height={28} alt="Next" />
//             </button>
//           ))}
//           <button
//             onClick={() => handleNav("https://diuvin.com/app.apk")}
//             className="flex justify-between items-center px-2 py-3 w-full"
//           >
//             <div className="flex items-center gap-3">
//               <Image src="/app.png" width={40} height={40} alt="App Download" />
//               <span className="font-semibold">App Download</span>
//             </div>
//             <Image src="/next.png" width={28} height={28} alt="Next" />
//           </button>
//           <button
//             onClick={() => handleNav("/profile")}
//             className="flex justify-between items-center px-2 py-3 w-full"
//           >
//             <div className="flex items-center gap-3">
//               <Image src="/app.png" width={40} height={40} alt="Telegram" />
//               <span className="font-semibold">Join Telegram Channel!</span>
//             </div>
//             <Image src="/next.png" width={28} height={28} alt="Next" />
//           </button>
//         </div>
//       </div>

//       {/* Log Out */}
//       <div className="flex justify-center px-5">
//         <button
//           onClick={() => {
//             localStorage.removeItem("token");
//             router.push("/");
//             toast.success("You are Logged out");
//           }}
//           className="mb-24 rounded-full py-2 bg-[#1ab266] w-full font-semibold text-white"
//         >
//           Log Out
//         </button>
//       </div>

//       <Footer />
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useSocket } from "@/contexts/SocketContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Footer from "@/Components/CommonComponents/Footer";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function AccountPage() {
  useRequireAuth();
  const { setShowHeaderFooter } = useLayout();
  const { balance, onTokenChange } = useSocket();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    name: string;
    number: string;
    uid?: string;
  } | null>(null);

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found");
          setLoading(false);
          return;
        }

        const res = await fetch("https://ctbackend.crobstacle.com/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }

        const result = await res.json();
        if (result.success) {
          setProfile({
            name: result.data.name,
            number: result.data.number.value,
            uid: result.data._id,
          });
        } else {
          console.warn("Profile fetch unsuccessful");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (balance !== null) setLoading(false);
  }, [balance]);

  const handleNav = (path: string) => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push(path);
    } else {
      toast.info("You will need to login to access that Page");
    }
  };

  return (
    <div className="flex-1">
      {/* Section 1 - Profile Header */}
      <div className="bg-[#1ab266] rounded-b-[3rem] sm:rounded-b-[4rem] px-5 sm:px-10 pt-6 sm:pt-8 pb-24 sm:pb-32">
        <div className="flex gap-2 sm:gap-3 items-center justify-center">
          <Image
            src="/avatar2.png"
            width={100}
            height={100}
            alt="Avatar"
            className="rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
          />
          <div className="text-white flex flex-col font-semibold items-start gap-0.5 sm:gap-1">
            <h1 className="uppercase text-lg sm:text-xl md:text-2xl truncate max-w-[180px] sm:max-w-none">
              {profile?.name || "Loading..."}
            </h1>
            <h1 className="bg-orange-200 rounded-full px-2 text-xs sm:text-sm text-red-500">
              UID | {profile?.uid || "Loading..."}
            </h1>
            <h1 className="text-xs sm:text-sm">
              Mobile : {profile?.number || "Loading..."}
            </h1>
          </div>
        </div>
      </div>

      {/* Section 2 - Balance Card */}
      <div className="px-4 sm:px-5">
        <div className="bg-green-50 rounded-lg shadow-lg p-4 sm:p-5 -mt-20 sm:-mt-28 text-center">
          <p className="font-semibold text-sm sm:text-base">Total Balance</p>
          <p className="my-2 text-lg sm:text-xl font-bold">
            {loading
              ? "Loading..."
              : balance == null
              ? "Login to view Balance"
              : `₹ ${balance.toFixed(2)}`}
          </p>
          <div className="flex items-center mt-4 sm:mt-5 font-semibold">
            <button
              onClick={() => handleNav("/wallet")}
              className="flex basis-1/3 flex-col items-center"
            >
              <Image 
                src="/wallet.png" 
                width={40} 
                height={40} 
                alt="Wallet"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="text-xs sm:text-sm mt-1">Wallet</span>
            </button>
            <button
              onClick={() => handleNav("/addMoney")}
              className="flex basis-1/3 flex-col items-center"
            >
              <Image 
                src="/deposit.png" 
                width={40} 
                height={40} 
                alt="Deposit"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="text-xs sm:text-sm mt-1">Deposit</span>
            </button>
            <button
              onClick={() => handleNav("/withMoney")}
              className="flex basis-1/3 flex-col items-center"
            >
              <Image
                src="/withdrawal.png"
                width={40}
                height={40}
                alt="Withdrawal"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="text-xs sm:text-sm mt-1">Withdrawal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3 - History Grid */}
      <div className="bg-white container grid grid-cols-2 mt-4 sm:mt-5 gap-2 sm:gap-3 px-4 sm:px-5">
        <button
          onClick={() => handleNav("/bethistory")}
          className="flex bg-green-100 p-2 sm:p-3 items-center rounded-lg gap-2"
        >
          <Image 
            src="/trnx.png" 
            width={36} 
            height={36} 
            alt="Bet History"
            className="w-8 h-8 sm:w-9 sm:h-9"
          />
          <div className="text-left">
            <p className="text-base sm:text-lg">Bet</p>
            <p className="text-[10px] sm:text-xs text-gray-500">My Bet History</p>
          </div>
        </button>
        <button
          onClick={() => handleNav("/transactionhistory")}
          className="flex bg-green-100 p-2 sm:p-3 items-center text-left rounded-lg gap-2"
        >
          <Image 
            src="/trnsc.png" 
            width={36} 
            height={36} 
            alt="Trans. History"
            className="w-8 h-8 sm:w-9 sm:h-9"
          />
          <div className="text-left">
            <p className="text-base sm:text-lg">Transaction</p>
            <p className="text-[10px] sm:text-xs text-gray-500">My Transaction History</p>
          </div>
        </button>
        <button
          onClick={() => handleNav("/deposithistory")}
          className="flex bg-green-100 p-2 sm:p-3 items-center rounded-lg gap-2"
        >
          <Image
            src="/4-deposite.png"
            width={36}
            height={36}
            alt="Deposit History"
            className="w-8 h-8 sm:w-9 sm:h-9"
          />
          <div className="text-left">
            <p className="text-base sm:text-lg">Deposit</p>
            <p className="text-[10px] sm:text-xs text-gray-500">My Deposit History</p>
          </div>
        </button>
        <button
          onClick={() => handleNav("/withdrawalhistory")}
          className="flex bg-green-100 p-2 sm:p-3 items-center rounded-lg gap-2"
        >
          <Image
            src="/withd.png"
            width={36}
            height={36}
            alt="Withdrawal History"
            className="w-8 h-8 sm:w-9 sm:h-9"
          />
          <div className="text-left">
            <p className="text-base sm:text-lg">Withdraw</p>
            <p className="text-[10px] sm:text-xs text-gray-500">My Withdraw History</p>
          </div>
        </button>
      </div>

      {/* Section 4 - Menu Options */}
      <div className="my-4 sm:my-5 px-4 sm:px-5">
        <div className="rounded-lg bg-green-50 p-2 sm:p-3 space-y-1 sm:space-y-2">
          {[
            { label: "My Profile", path: "/profile", icon: "/promote.png" },
            { label: "Settings", path: "/changepassword", icon: "/setting.png" },
            { label: "About Us", path: "/about", icon: "/about.png" },
            { label: "Support", path: "/support", icon: "/ticket.png" },
          ].map(({ label, path, icon }) => (
            <button
              key={path}
              onClick={() => handleNav(path)}
              className="flex justify-between items-center px-2 py-2 sm:py-3 w-full"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Image 
                  src={icon} 
                  width={40} 
                  height={40} 
                  alt={label}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
                <span className="font-semibold text-sm sm:text-base">{label}</span>
              </div>
              <Image 
                src="/next.png" 
                width={28} 
                height={28} 
                alt="Next"
                className="w-5 h-5 sm:w-7 sm:h-7"
              />
            </button>
          ))}
          <button
            onClick={() => handleNav("https://diuvin.com/app.apk")}
            className="flex justify-between items-center px-2 py-2 sm:py-3 w-full"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="/app.png" 
                width={40} 
                height={40} 
                alt="App Download"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="font-semibold text-sm sm:text-base">App Download</span>
            </div>
            <Image 
              src="/next.png" 
              width={28} 
              height={28} 
              alt="Next"
              className="w-5 h-5 sm:w-7 sm:h-7"
            />
          </button>
          <button
            onClick={() => handleNav("/profile")}
            className="flex justify-between items-center px-2 py-2 sm:py-3 w-full"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="/app.png" 
                width={40} 
                height={40} 
                alt="Telegram"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="font-semibold text-sm sm:text-base">Join Telegram Channel!</span>
            </div>
            <Image 
              src="/next.png" 
              width={28} 
              height={28} 
              alt="Next"
              className="w-5 h-5 sm:w-7 sm:h-7"
            />
          </button>
        </div>
      </div>

      {/* Log Out */}
      <div className="flex justify-center px-4 sm:px-5">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            // Clear cookie so middleware also treats the session as ended
            document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
            onTokenChange(null); // disconnect socket immediately
            router.push("/");
            toast.success("You are Logged out");
          }}
          className="mb-24 rounded-full py-2 sm:py-2.5 bg-[#1ab266] w-full font-semibold text-white text-sm sm:text-base"
        >
          Log Out
        </button>
      </div>

      <Footer />
    </div>
  );
}
// "use client";

// import { useLayout } from "@/contexts/LayoutContext";
// import { useSocket } from "@/contexts/SocketContext";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { FaRupeeSign, FaLock } from "react-icons/fa";
// import { IoCloseCircleOutline } from "react-icons/io5";
// import { toast } from "react-toastify";

// const Page = () => {
//   const { setShowHeaderFooter } = useLayout();
//   const { balance, refreshBalance } = useSocket();

//   const [amount, setAmount] = useState("");
//   const [password, setPassword] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedBank, setSelectedBank] = useState("");

//   const handleWithdraw = async () => {
//     if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
//       toast.error("Please enter a valid withdrawal amount.");
//       return;
//     }
//     if (!password) {
//       toast.error("Please enter your password.");
//       return;
//     }
//     if (!selectedBank) {
//       toast.error("Please select a bank.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Unauthorized: No token found. Please log in again.");
//         setLoading(false);
//         return;
//       }
//       const response = await fetch("https://ctbackend.crobstacle.com/api/wallet/withdraw", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           amount: Number(amount),
//           password,
//           bank: selectedBank,
//         }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         toast.success(`Withdrawal successful: ₹${amount}`);
//         setAmount("");
//         setPassword("");
//         setSelectedBank("");
//         refreshBalance();
//       } else {
//         toast.error(`Withdrawal failed: ${result.message || "Try again later"}`);
//       }
//     } catch {
//       toast.error("Error processing withdrawal. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     setShowHeaderFooter(false);
//     return () => setShowHeaderFooter(true);
//   }, [setShowHeaderFooter]);

//   return (
//     <div className="min-h-screen">
//       {/* Header */}
//       <div className="bg-white flex justify-between py-3 items-center px-3 shadow-md">
//         <Link href="/wallet">
//           <Image src="/left-arrow.png" width={20} height={20} alt="Back" className="w-5 h-5" />
//         </Link>
//         <h1 className="text-lg sm:text-xl font-semibold">Withdraw</h1>
//         <div className="w-5"></div>
//       </div>

//       {/* Content */}
//       <div className="bg-green-50 min-h-screen pb-6">
//         {/* Wallet Balance */}
//         <div className="p-4 sm:p-5 bg-[url('/bannerbg.png')] bg-cover mx-3 sm:mx-4 mt-3 rounded-xl shadow-md">
//           <div className="flex items-center gap-2">
//             <Image src="/walet.png" width={20} height={20} alt="Wallet" className="w-5 h-5" />
//             <h1 className="text-white text-base sm:text-xl">Balance</h1>
//           </div>
//           <div className="flex items-center gap-3 mt-2 mb-12 sm:mb-16">
//             <h1 className="text-white text-2xl sm:text-3xl font-bold">
//               {balance === null ? "Loading..." : `₹ ${balance.toFixed(2)}`}
//             </h1>
//           </div>
//         </div>

//         {/* Bank selection */}
//         <div className="relative mx-3 sm:mx-4 my-4 sm:my-5">
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="bg-white text-base sm:text-lg font-semibold text-black w-full py-2 sm:py-3 rounded-lg border shadow-md flex justify-between items-center px-3 sm:px-4"
//           >
//             <span className="truncate">{selectedBank || "Select Bank Details"}</span>
//             <span
//               className={`text-gray-500 transform transition-transform ml-2 ${
//                 isOpen ? "rotate-180" : "rotate-0"
//               }`}
//             >
//               &#9662;
//             </span>
//           </button>
//           {isOpen && (
//             <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//               <ul className="py-2">
//                 {["State Bank of India", "Punjab Bank of India"].map((bank) => (
//                   <li
//                     key={bank}
//                     className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
//                     onClick={() => {
//                       setSelectedBank(bank);
//                       setIsOpen(false);
//                     }}
//                   >
//                     {bank}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Withdrawal Form */}
//         <div className="bg-white shadow-md rounded-lg p-3 sm:p-4 mx-3 sm:mx-4 mt-4">
//           <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
//             <Image 
//               src="/selectr.png" 
//               width={20} 
//               height={20} 
//               alt="Withdraw Icon" 
//               className="w-5 h-5 sm:w-6 sm:h-6"
//             />
//             Withdrawal Form
//           </h2>
          
//           {/* Amount Input */}
//           <div className="flex items-center bg-gray-100 rounded-md p-2 sm:p-3 mt-3">
//             <FaRupeeSign className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" />
//             <input
//               type="number"
//               placeholder="Enter withdrawal amount"
//               className="bg-transparent w-full outline-none text-gray-700 text-sm sm:text-base"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//             />
//             {amount && (
//               <IoCloseCircleOutline
//                 className="text-gray-500 cursor-pointer text-lg sm:text-xl flex-shrink-0 ml-2"
//                 onClick={() => setAmount("")}
//               />
//             )}
//           </div>
          
//           {/* Password Input */}
//           <div className="flex items-center bg-gray-100 rounded-md p-2 sm:p-3 mt-3">
//             <FaLock className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" />
//             <input
//               type="password"
//               placeholder="Enter login password"
//               className="bg-transparent w-full outline-none text-gray-700 text-sm sm:text-base"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
          
//           {/* Withdraw Button */}
//           <button
//             className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 sm:py-3 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
//             onClick={handleWithdraw}
//             disabled={loading}
//           >
//             {loading ? "Processing..." : "Withdraw"}
//           </button>
//         </div>

//         {/* Withdrawal Instruction */}
//         <div className="bg-white rounded-xl mx-3 sm:mx-4 pb-5 sm:pb-6 my-4">
//           <div className="flex items-center p-2 sm:p-3 gap-2 sm:gap-3">
//             <Image
//               className="w-6 h-6 sm:w-7 sm:h-7"
//               src="/selectr.png"
//               width={500}
//               height={500}
//               alt="Instructions"
//             />
//             <h1 className="text-base sm:text-lg font-semibold">Withdrawal Instruction</h1>
//           </div>
//           <div className="border-2 p-3 sm:p-4 mx-2 rounded-xl">
//             <ul className="text-gray-400 text-xs sm:text-sm font-semibold space-y-1">
//               <li>Need to bet 0.00 to be able to withdraw.</li>
//               <li>Always pay on an active QR code or UPI ID.</li>
//               <li>Contact support if facing issues.</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;





// "use client";

// import { useLayout } from "@/contexts/LayoutContext";
// import { useSocket } from "@/contexts/SocketContext";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { FaRupeeSign, FaLock } from "react-icons/fa";
// import { IoCloseCircleOutline } from "react-icons/io5";
// import { toast } from "react-toastify";

// const Page = () => {
//   const { setShowHeaderFooter } = useLayout();
//   const { balance, refreshBalance } = useSocket();

//   const [amount, setAmount] = useState("");
//   const [password, setPassword] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedBank, setSelectedBank] = useState("");
  
//   // Bank details (fetch from your backend or user profile)
//   const [bankDetails, setBankDetails] = useState({
//     accountName: "",
//     accountNumber: "",
//     ifscCode: "",
//     bankName: "",
//   });

//   useEffect(() => {
//     setShowHeaderFooter(false);
    
//     // Fetch user's saved bank details
//     const fetchBankDetails = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await fetch("https://ctbackend.crobstacle.com/api/user/bank-details", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
//         if (response.ok && data.banks) {
//           setBankDetails(data.banks[0] || {}); // Use first saved bank
//         }
//       } catch (error) {
//         console.error("Error fetching bank details:", error);
//       }
//     };
    
//     fetchBankDetails();
    
//     return () => setShowHeaderFooter(true);
//   }, [setShowHeaderFooter]);

//   const handleWithdraw = async () => {
//     if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
//       toast.error("Please enter a valid withdrawal amount.");
//       return;
//     }
//     if (!password) {
//       toast.error("Please enter your password.");
//       return;
//     }
//     if (!selectedBank) {
//       toast.error("Please select a bank.");
//       return;
//     }
//     if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
//       toast.error("Bank details not found. Please add bank details first.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Unauthorized: No token found. Please log in again.");
//         setLoading(false);
//         return;
//       }

//       // Call your new withdrawal API that integrates with payment gateway
//       const response = await fetch("/api/payment/withdraw", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           amount: Number(amount),
//           password,
//           bank: selectedBank,
//           accountName: bankDetails.accountName,
//           accountNumber: bankDetails.accountNumber,
//           ifscCode: bankDetails.ifscCode,
//           bankName: bankDetails.bankName,
//         }),
//       });

//       const result = await response.json();

//       if (response.ok && result.success) {
//         toast.success(`Withdrawal request submitted successfully!`);
//         toast.info(`Transaction ID: ${result.transactionId}`);
//         setAmount("");
//         setPassword("");
//         refreshBalance();
//       } else {
//         toast.error(`Withdrawal failed: ${result.message || "Try again later"}`);
//       }
//     } catch (error) {
//       toast.error("Error processing withdrawal. Please try again.");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       {/* Header */}
//       <div className="bg-white flex justify-between py-3 items-center px-3 shadow-md">
//         <Link href="/wallet">
//           <Image src="/left-arrow.png" width={20} height={20} alt="Back" className="w-5 h-5" />
//         </Link>
//         <h1 className="text-lg sm:text-xl font-semibold">Withdraw</h1>
//         <div className="w-5"></div>
//       </div>

//       {/* Content */}
//       <div className="bg-green-50 min-h-screen pb-6">
//         {/* Wallet Balance */}
//         <div className="p-4 sm:p-5 bg-[url('/bannerbg.png')] bg-cover mx-3 sm:mx-4 mt-3 rounded-xl shadow-md">
//           <div className="flex items-center gap-2">
//             <Image src="/walet.png" width={20} height={20} alt="Wallet" className="w-5 h-5" />
//             <h1 className="text-white text-base sm:text-xl">Balance</h1>
//           </div>
//           <div className="flex items-center gap-3 mt-2 mb-12 sm:mb-16">
//             <h1 className="text-white text-2xl sm:text-3xl font-bold">
//               {balance === null ? "Loading..." : `₹ ${balance.toFixed(2)}`}
//             </h1>
//           </div>
//         </div>

//         {/* Bank selection */}
//         <div className="relative mx-3 sm:mx-4 my-4 sm:my-5">
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="bg-white text-base sm:text-lg font-semibold text-black w-full py-2 sm:py-3 rounded-lg border shadow-md flex justify-between items-center px-3 sm:px-4"
//           >
//             <span className="truncate">{selectedBank || "Select Bank Details"}</span>
//             <span
//               className={`text-gray-500 transform transition-transform ml-2 ${
//                 isOpen ? "rotate-180" : "rotate-0"
//               }`}
//             >
//               &#9662;
//             </span>
//           </button>
//           {isOpen && (
//             <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//               <ul className="py-2">
//                 {bankDetails.accountNumber ? (
//                   <li
//                     className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
//                     onClick={() => {
//                       setSelectedBank(`${bankDetails.bankName} - ${bankDetails.accountNumber}`);
//                       setIsOpen(false);
//                     }}
//                   >
//                     <div className="font-semibold">{bankDetails.bankName}</div>
//                     <div className="text-xs text-gray-600">{bankDetails.accountNumber}</div>
//                     <div className="text-xs text-gray-600">{bankDetails.ifscCode}</div>
//                   </li>
//                 ) : (
//                   <li className="px-3 sm:px-4 py-2 text-sm text-gray-500">
//                     No bank details found. Please add bank details.
//                   </li>
//                 )}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Withdrawal Form */}
//         <div className="bg-white shadow-md rounded-lg p-3 sm:p-4 mx-3 sm:mx-4 mt-4">
//           <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
//             <Image 
//               src="/selectr.png" 
//               width={20} 
//               height={20} 
//               alt="Withdraw Icon" 
//               className="w-5 h-5 sm:w-6 sm:h-6"
//             />
//             Withdrawal Form
//           </h2>
          
//           {/* Amount Input */}
//           <div className="flex items-center bg-gray-100 rounded-md p-2 sm:p-3 mt-3">
//             <FaRupeeSign className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" />
//             <input
//               type="number"
//               placeholder="Enter withdrawal amount"
//               className="bg-transparent w-full outline-none text-gray-700 text-sm sm:text-base"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//             />
//             {amount && (
//               <IoCloseCircleOutline
//                 className="text-gray-500 cursor-pointer text-lg sm:text-xl flex-shrink-0 ml-2"
//                 onClick={() => setAmount("")}
//               />
//             )}
//           </div>
          
//           {/* Password Input */}
//           <div className="flex items-center bg-gray-100 rounded-md p-2 sm:p-3 mt-3">
//             <FaLock className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" />
//             <input
//               type="password"
//               placeholder="Enter login password"
//               className="bg-transparent w-full outline-none text-gray-700 text-sm sm:text-base"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
          
//           {/* Withdraw Button */}
//           <button
//             className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 sm:py-3 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
//             onClick={handleWithdraw}
//             disabled={loading}
//           >
//             {loading ? "Processing..." : "Withdraw"}
//           </button>
//         </div>

//         {/* Withdrawal Instruction */}
//         <div className="bg-white rounded-xl mx-3 sm:mx-4 pb-5 sm:pb-6 my-4">
//           <div className="flex items-center p-2 sm:p-3 gap-2 sm:gap-3">
//             <Image
//               className="w-6 h-6 sm:w-7 sm:h-7"
//               src="/selectr.png"
//               width={500}
//               height={500}
//               alt="Instructions"
//             />
//             <h1 className="text-base sm:text-lg font-semibold">Withdrawal Instruction</h1>
//           </div>
//           <div className="border-2 p-3 sm:p-4 mx-2 rounded-xl">
//             <ul className="text-gray-400 text-xs sm:text-sm font-semibold space-y-1">
//               <li>Withdrawal requests are processed within 24 hours.</li>
//               <li>Ensure your bank details are correct.</li>
//               <li>Minimum withdrawal amount is ₹100.</li>
//               <li>Contact support if facing issues.</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;




// "use client";

// import { useLayout } from "@/contexts/LayoutContext";
// import { useSocket } from "@/contexts/SocketContext";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { FaRupeeSign, FaLock } from "react-icons/fa";
// import { IoCloseCircleOutline } from "react-icons/io5";
// import { toast } from "react-toastify";

// const Page = () => {
//   const { setShowHeaderFooter } = useLayout();
//   const { balance, refreshBalance } = useSocket();

//   const [amount, setAmount] = useState("");
//   const [password, setPassword] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedBank, setSelectedBank] = useState("");
  
//   // Bank details
//   const [bankDetails, setBankDetails] = useState({
//     accountName: "",
//     accountNumber: "",
//     ifscCode: "",
//     bankName: "",
//   });

//   // Manual bank entry mode
//   const [manualEntry, setManualEntry] = useState(false);

//   useEffect(() => {
//     setShowHeaderFooter(false);
    
//     // Fetch user's saved bank details
//     const fetchBankDetails = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await fetch("https://ctbackend.crobstacle.com/api/user/bank-details", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
        
//         if (response.ok && data.banks && data.banks.length > 0) {
//           const firstBank = data.banks[0];
//           setBankDetails(firstBank);
//           // Auto-select the bank
//           setSelectedBank(`${firstBank.bankName} - ${firstBank.accountNumber}`);
//         } else {
//           // No bank details found, enable manual entry
//           setManualEntry(true);
//           toast.info("Please enter your bank details");
//         }
//       } catch (error) {
//         console.error("Error fetching bank details:", error);
//         setManualEntry(true);
//       }
//     };
    
//     fetchBankDetails();
    
//     return () => setShowHeaderFooter(true);
//   }, [setShowHeaderFooter]);

//   const handleWithdraw = async () => {
//     if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
//       toast.error("Please enter a valid withdrawal amount.");
//       return;
//     }
//     if (!password) {
//       toast.error("Please enter your password.");
//       return;
//     }
//     if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
//       toast.error("Please enter complete bank details.");
//       return;
//     }
//     if (!bankDetails.accountName) {
//       toast.error("Please enter account holder name.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Unauthorized: No token found. Please log in again.");
//         setLoading(false);
//         return;
//       }

//       // Call withdrawal API
//       const response = await fetch("/api/payment/withdraw", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           amount: Number(amount),
//           password,
//           accountName: bankDetails.accountName,
//           accountNumber: bankDetails.accountNumber,
//           ifscCode: bankDetails.ifscCode,
//           bankName: bankDetails.bankName || "Bank",
//         }),
//       });

//       const result = await response.json();

//       if (response.ok && result.success) {
//         toast.success(`Withdrawal request submitted successfully!`);
//         toast.info(`Transaction ID: ${result.transactionId}`);
//         setAmount("");
//         setPassword("");
//         refreshBalance();
//       } else {
//         toast.error(`Withdrawal failed: ${result.message || "Try again later"}`);
//       }
//     } catch (error) {
//       toast.error("Error processing withdrawal. Please try again.");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       {/* Header */}
//       <div className="bg-white flex justify-between py-3 items-center px-3 shadow-md">
//         <Link href="/wallet">
//           <Image src="/left-arrow.png" width={20} height={20} alt="Back" className="w-5 h-5" />
//         </Link>
//         <h1 className="text-lg sm:text-xl font-semibold">Withdraw</h1>
//         <div className="w-5"></div>
//       </div>

//       {/* Content */}
//       <div className="bg-green-50 min-h-screen pb-6">
//         {/* Wallet Balance */}
//         <div className="p-4 sm:p-5 bg-[url('/bannerbg.png')] bg-cover mx-3 sm:mx-4 mt-3 rounded-xl shadow-md">
//           <div className="flex items-center gap-2">
//             <Image src="/walet.png" width={20} height={20} alt="Wallet" className="w-5 h-5" />
//             <h1 className="text-white text-base sm:text-xl">Balance</h1>
//           </div>
//           <div className="flex items-center gap-3 mt-2 mb-12 sm:mb-16">
//             <h1 className="text-white text-2xl sm:text-3xl font-bold">
//               {balance === null ? "Loading..." : `₹ ${balance.toFixed(2)}`}
//             </h1>
//           </div>
//         </div>

//         {/* Bank Details Section */}
//         <div className="bg-white shadow-md rounded-lg p-3 sm:p-4 mx-3 sm:mx-4 mt-4">
//           <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-3">
//             <Image 
//               src="/selectr.png" 
//               width={20} 
//               height={20} 
//               alt="Bank Icon" 
//               className="w-5 h-5 sm:w-6 sm:h-6"
//             />
//             Bank Details
//           </h2>

//           {/* Account Name */}
//           <div className="mb-3">
//             <label className="text-xs sm:text-sm text-gray-600 mb-1 block">Account Holder Name</label>
//             <input
//               type="text"
//               placeholder="Enter account holder name"
//               className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md"
//               value={bankDetails.accountName}
//               onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
//             />
//           </div>

//           {/* Account Number */}
//           <div className="mb-3">
//             <label className="text-xs sm:text-sm text-gray-600 mb-1 block">Account Number</label>
//             <input
//               type="text"
//               placeholder="Enter account number"
//               className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md"
//               value={bankDetails.accountNumber}
//               onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
//             />
//           </div>

//           {/* IFSC Code */}
//           <div className="mb-3">
//             <label className="text-xs sm:text-sm text-gray-600 mb-1 block">IFSC Code</label>
//             <input
//               type="text"
//               placeholder="Enter IFSC code (11 characters)"
//               className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md uppercase"
//               value={bankDetails.ifscCode}
//               onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
//               maxLength={11}
//             />
//           </div>

//           {/* Bank Name */}
//           <div className="mb-3">
//             <label className="text-xs sm:text-sm text-gray-600 mb-1 block">Bank Name</label>
//             <input
//               type="text"
//               placeholder="Enter bank name"
//               className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md"
//               value={bankDetails.bankName}
//               onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
//             />
//           </div>
//         </div>

//         {/* Withdrawal Form */}
//         <div className="bg-white shadow-md rounded-lg p-3 sm:p-4 mx-3 sm:mx-4 mt-4">
//           <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
//             <Image 
//               src="/selectr.png" 
//               width={20} 
//               height={20} 
//               alt="Withdraw Icon" 
//               className="w-5 h-5 sm:w-6 sm:h-6"
//             />
//             Withdrawal Form
//           </h2>
          
//           {/* Amount Input */}
//           <div className="flex items-center bg-gray-100 rounded-md p-2 sm:p-3 mt-3">
//             <FaRupeeSign className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" />
//             <input
//               type="number"
//               placeholder="Enter withdrawal amount"
//               className="bg-transparent w-full outline-none text-gray-700 text-sm sm:text-base"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//             />
//             {amount && (
//               <IoCloseCircleOutline
//                 className="text-gray-500 cursor-pointer text-lg sm:text-xl flex-shrink-0 ml-2"
//                 onClick={() => setAmount("")}
//               />
//             )}
//           </div>
          
//           {/* Password Input */}
//           <div className="flex items-center bg-gray-100 rounded-md p-2 sm:p-3 mt-3">
//             <FaLock className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" />
//             <input
//               type="password"
//               placeholder="Enter login password"
//               className="bg-transparent w-full outline-none text-gray-700 text-sm sm:text-base"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
          
//           {/* Withdraw Button */}
//           <button
//             className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 sm:py-3 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
//             onClick={handleWithdraw}
//             disabled={loading}
//           >
//             {loading ? "Processing..." : "Withdraw"}
//           </button>
//         </div>

//         {/* Withdrawal Instruction */}
//         <div className="bg-white rounded-xl mx-3 sm:mx-4 pb-5 sm:pb-6 my-4">
//           <div className="flex items-center p-2 sm:p-3 gap-2 sm:gap-3">
//             <Image
//               className="w-6 h-6 sm:w-7 sm:h-7"
//               src="/selectr.png"
//               width={500}
//               height={500}
//               alt="Instructions"
//             />
//             <h1 className="text-base sm:text-lg font-semibold">Withdrawal Instruction</h1>
//           </div>
//           <div className="border-2 p-3 sm:p-4 mx-2 rounded-xl">
//             <ul className="text-gray-400 text-xs sm:text-sm font-semibold space-y-1">
//               <li>Withdrawal requests are processed within 24 hours.</li>
//               <li>Ensure your bank details are correct.</li>
//               <li>IFSC code must be exactly 11 characters.</li>
//               <li>Minimum withdrawal amount is ₹100.</li>
//               <li>Contact support if facing issues.</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;




"use client";

import { useLayout } from "@/contexts/LayoutContext";
import { useSocket } from "@/contexts/SocketContext";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaRupeeSign, FaLock } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";

const Page = () => {
  const { setShowHeaderFooter } = useLayout();
  const { balance, refreshBalance } = useSocket();

  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Bank details
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    city: "",
    province: "",
  });

  useEffect(() => {
    setShowHeaderFooter(false);
    
    // Fetch user's saved bank details
    const fetchBankDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://ctbackend.crobstacle.com/api/user/bank-details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        
        if (response.ok && data.banks && data.banks.length > 0) {
          const firstBank = data.banks[0];
          setBankDetails(firstBank);
        } else {
          toast.info("Please enter your bank details");
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
      }
    };
    
    fetchBankDetails();
    
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
      toast.error("Please enter complete bank details.");
      return;
    }
    if (!bankDetails.accountName) {
      toast.error("Please enter account holder name.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized: No token found. Please log in again.");
        setLoading(false);
        return;
      }

      // Call withdrawal API
      const response = await fetch("https://ctbackend.crobstacle.com/api/wallet/withdraw/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          bankDetails: {
            accountName: bankDetails.accountName,
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            bankName: bankDetails.bankName || "Bank",
            city: bankDetails.city,
            province: bankDetails.province,
          },
        }),
      });

      const result = await response.json();
      console.log('Withdrawal response:', JSON.stringify(result, null, 2));

      const isSuccess =
        result.success === true ||
        result.status === 'success' ||
        result.status === 1 ||
        result.code === 200 ||
        response.ok;

      if (isSuccess) {
        toast.success(`Withdrawal request submitted successfully!`);
        if (result.transactionId || result.txnId || result.orderId) {
          toast.info(`Transaction ID: ${result.transactionId || result.txnId || result.orderId}`);
        }
        setAmount("");
        setPassword("");
        refreshBalance();
      } else {
        toast.error(`Withdrawal failed: ${result.message || result.msg || "Try again later"}`);
      }
    } catch (error) {
      toast.error("Error processing withdrawal. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white flex justify-between py-3 items-center px-3 shadow-md">
        <Link href="/wallet">
          <Image src="/left-arrow.png" width={20} height={20} alt="Back" className="w-5 h-5" />
        </Link>
        <h1 className="text-lg sm:text-xl font-semibold">Withdraw</h1>
        <div className="w-5"></div>
      </div>

      {/* Content */}
      <div className="bg-green-50 min-h-screen pb-6">
        {/* Wallet Balance */}
        <div className="p-4 sm:p-5 bg-[url('/bannerbg.png')] bg-cover mx-3 sm:mx-4 mt-3 rounded-xl shadow-md">
          <div className="flex items-center gap-2">
            <Image src="/walet.png" width={20} height={20} alt="Wallet" className="w-5 h-5" />
            <h1 className="text-white text-base sm:text-xl">Balance</h1>
          </div>
          <div className="flex items-center gap-3 mt-2 mb-12 sm:mb-16">
            <h1 className="text-white text-2xl sm:text-3xl font-bold">
              {balance === null ? "Loading..." : `₹ ${balance.toFixed(2)}`}
            </h1>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="bg-white shadow-md rounded-lg p-3 sm:p-4 mx-3 sm:mx-4 mt-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-3">
            <Image 
              src="/selectr.png" 
              width={20} 
              height={20} 
              alt="Bank Icon" 
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            Bank Details
          </h2>

          {/* Account Name */}
          <div className="mb-3">
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">Account Holder Name</label>
            <input
              type="text"
              placeholder="Enter account holder name"
              className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md"
              value={bankDetails.accountName}
              onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
            />
          </div>

          {/* Account Number */}
          <div className="mb-3">
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">Account Number</label>
            <input
              type="text"
              placeholder="Enter account number"
              className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
            />
          </div>

          {/* IFSC Code */}
          <div className="mb-3">
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">IFSC Code</label>
            <input
              type="text"
              placeholder="Enter IFSC code (11 characters)"
              className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md uppercase"
              value={bankDetails.ifscCode}
              onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
              maxLength={11}
            />
          </div>

          {/* Bank Name */}
          <div className="mb-3">
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">Bank Name</label>
            <input
              type="text"
              placeholder="Enter bank name"
              className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
            />
          </div>

          {/* City */}
          <div className="mb-3">
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">City</label>
            <input
              type="text"
              placeholder="Enter city"
              className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md"
              value={bankDetails.city}
              onChange={(e) => setBankDetails({...bankDetails, city: e.target.value})}
            />
          </div>

          {/* Province / State */}
          <div className="mb-3">
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">Province / State</label>
            <input
              type="text"
              placeholder="Enter province or state"
              className="bg-gray-100 w-full outline-none text-gray-700 text-sm sm:text-base p-2 sm:p-3 rounded-md"
              value={bankDetails.province}
              onChange={(e) => setBankDetails({...bankDetails, province: e.target.value})}
            />
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white shadow-md rounded-lg p-3 sm:p-4 mx-3 sm:mx-4 mt-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Image 
              src="/selectr.png" 
              width={20} 
              height={20} 
              alt="Withdraw Icon" 
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            Withdrawal Form
          </h2>
          
          {/* Amount Input */}
          <div className="flex items-center bg-gray-100 rounded-md p-2 sm:p-3 mt-3">
            <FaRupeeSign className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" />
            <input
              type="number"
              placeholder="Enter withdrawal amount"
              className="bg-transparent w-full outline-none text-gray-700 text-sm sm:text-base"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {amount && (
              <IoCloseCircleOutline
                className="text-gray-500 cursor-pointer text-lg sm:text-xl flex-shrink-0 ml-2"
                onClick={() => setAmount("")}
              />
            )}
          </div>
          
          {/* Password Input */}
          <div className="flex items-center bg-gray-100 rounded-md p-2 sm:p-3 mt-3">
            <FaLock className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" />
            <input
              type="password"
              placeholder="Enter login password"
              className="bg-transparent w-full outline-none text-gray-700 text-sm sm:text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {/* Withdraw Button */}
          <button
            className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 sm:py-3 rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </div>

        {/* Withdrawal Instruction */}
        <div className="bg-white rounded-xl mx-3 sm:mx-4 pb-5 sm:pb-6 my-4">
          <div className="flex items-center p-2 sm:p-3 gap-2 sm:gap-3">
            <Image
              className="w-6 h-6 sm:w-7 sm:h-7"
              src="/selectr.png"
              width={500}
              height={500}
              alt="Instructions"
            />
            <h1 className="text-base sm:text-lg font-semibold">Withdrawal Instruction</h1>
          </div>
          <div className="border-2 p-3 sm:p-4 mx-2 rounded-xl">
            <ul className="text-gray-400 text-xs sm:text-sm font-semibold space-y-1">
              <li>Withdrawal requests are processed within 24 hours.</li>
              <li>Ensure your bank details are correct.</li>
              <li>IFSC code must be exactly 11 characters.</li>
              <li>Minimum withdrawal amount is ₹100.</li>
              <li>Contact support if facing issues.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

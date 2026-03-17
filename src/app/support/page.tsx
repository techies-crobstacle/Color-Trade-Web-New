//   "use client";

//   import { useLayout } from "@/contexts/LayoutContext";
//   import React, { useState, useEffect } from "react";
//   import Image from "next/image";
// import { toast } from "react-toastify";

//   function Support() {

//     const { setShowHeaderFooter } = useLayout();

//     useEffect(() => {
//       setShowHeaderFooter(false);
//       return () => setShowHeaderFooter(true); // Reset on unmount
//     }, [setShowHeaderFooter]);

//     const [name, setName] = useState("");
//     const [type, setType] = useState("");
//     const [whatsappNumber, setWhatsappNumber] = useState("");
//     const [message, setMessage] = useState("");
//     const [errorMessage, ] = useState("");
//     const [successMessage,] = useState("");

//     const handleBackButtonClick = () => {
//       window.history.back();
//     };

//     const handleWhatsappNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//       const value = e.target.value;
//       // Remove any non-numeric characters and limit to 15 digits
//       const sanitizedValue = value.replace(/\D/g, "").slice(0, 15); // Whatsapp numbers can be longer, so setting limit to 15
//       setWhatsappNumber(sanitizedValue);
//     };


// //     const handleSubmit = async (e: React.FormEvent) => {
// //   e.preventDefault();

// //   // Client-side validation
// //   if (!name || !type || !whatsappNumber || !message) {
// //     setErrorMessage("All fields are required.");
// //     return;
// //   }

// //   if (!/^\d{10,15}$/.test(whatsappNumber)) {
// //     setErrorMessage("Please enter a valid Whatsapp number.");
// //     return;
// //   }

// //   setErrorMessage(""); // Clear previous error message
// //   setSuccessMessage(""); // Clear previous success message

// //   try {
// //     const res = await fetch("https://ctbackend.crobstacle.com/api/queries/submit", {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({
// //         name,
// //         number: whatsappNumber,
// //         queryType: type,
// //         message,
// //       }),
// //     });

// //     const data = await res.json();

// //     if (res.ok && data.status === "success") {
// //       setSuccessMessage("Your message has been sent successfully.");
// //       // Optionally reset the form
// //       setName("");
// //       setType("");
// //       setWhatsappNumber("");
// //       setMessage("");
// //     } else {
// //       setErrorMessage(data.message || "Failed to send message.");
// //     }
// //   } catch (error) {
// //     console.error("API error:", error);
// //     setErrorMessage("Something went wrong. Please try again later.");
// //   }
// // };


// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!name || !type || !whatsappNumber || !message) {
//     toast.error("All fields are required.");
//     return;
//   }

//   if (!/^\d{10,15}$/.test(whatsappNumber)) {
//     toast.error("Please enter a valid Whatsapp number.");
//     return;
//   }

//   try {
//     const res = await fetch("https://ctbackend.crobstacle.com/api/queries/submit", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name,
//         number: whatsappNumber,
//         queryType: type,
//         message,
//       }),
//     });

//     const data = await res.json();

//     if (res.ok && data.status === "success") {
//       toast.success("Your message has been sent successfully.");
//       setName("");
//       setType("");
//       setWhatsappNumber("");
//       setMessage("");
//     } else {
//       toast.error(data.message || "Failed to send message.");
//     }
//   } catch (error) {
//     console.error("API error:", error);
//     toast.error("Something went wrong. Please try again later.");
//   }
// };

//     return (
//       <div className="min-h-[100vh] bg-white relative">
//         {/* Section 1: Header */}
//         <div className="bg-[#1ab266] px-5">
//           <div className="relative">
//             {/* Back button */}
//             <button
//               onClick={handleBackButtonClick}
//               className="absolute left-0 top-[15px]"
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
//           <h1 className="text-xl font-semibold text-white text-center py-3">Contact Us</h1>
//         </div>

//         {/* Section 2: Form */}
//         <div className="px-5 py-10">
//           <form className="space-y-5" onSubmit={handleSubmit}>
//             {/* Name Field */}
//             <div className="mb-4">
//               <div className="flex items-center mb-3 gap-2">
//                 {/* <Image
//                   className="w-5"
//                   src="/user.png"
//                   width={100}
//                   height={100}
//                   alt="User Icon"
//                 /> */}
//                 <h1 className="font-semibold">Enter your Full Name</h1>
//               </div>
//               <input
//                 type="text"
//                 className="bg-gray-200 text-black p-2 rounded-md w-full"
//                 placeholder="Enter your name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//               />
//             </div>

//             {/* Type Field (Select Box) */}
//             <div className="mb-4">
//               <div className="flex items-center mb-3 gap-2">
//                 {/* <Image
//                   className="w-5"
//                   src="/question.png"
//                   width={100}
//                   height={100}
//                   alt="Type Icon"
//                 /> */}
//                 <h1 className="font-semibold">Select your Query Type</h1>
//               </div>
//               <select
//                 value={type}
//                 onChange={(e) => setType(e.target.value)}
//                 className="bg-gray-200 text-black p-2 rounded-md w-full"
//                 required
//               >
//                 <option value="">Select</option>
//                 <option value="Consult">Consult</option>
//                 <option value="Recharge Problem">Recharge Problem</option>
//                 <option value="Withdraw Problem">Withdraw Problem</option>
//                 <option value="Game Problem">Game Problem</option>
//                 <option value="other">other</option>
//               </select>
//             </div>

//             {/* Whatsapp Number Field */}
//             <div className="mb-4">
//               <div className="flex items-center mb-3 gap-2">
//                 {/* <Image
//                   className="w-5"
//                   src="/whatsapp.png"
//                   width={100}
//                   height={100}
//                   alt="Whatsapp Icon"
//                 /> */}
//                 <h1 className="font-semibold">Enter your Whatsapp Number</h1>
//               </div>
//               <input
//                 type="text"
//                 className="bg-gray-200 text-black p-2 rounded-md w-full"
//                 placeholder="Enter your Whatsapp number"
//                 value={whatsappNumber}
//                 onChange={handleWhatsappNumberInput}
//                 maxLength={15}
//                 required
//               />
//             </div>

//             {/* Message Field */}
//             <div className="mb-4">
//               <div className="flex items-center mb-3 gap-2">
//                 {/* <Image
//                   className="w-5"
//                   src="/message.png"
//                   width={100}
//                   height={100}
//                   alt="Message Icon"
//                 /> */}
//                 <h1 className="font-semibold">Enter your Message</h1>
//               </div>
//               <textarea
//                 className="bg-gray-200 text-black p-2 rounded-md w-full"
//                 placeholder="Enter your message"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 required
//               />
//             </div>

//             {/* Submit Button */}
//             <div className="flex flex-col items-center gap-4">
//               {errorMessage && <p className="text-red-500">{errorMessage}</p>}
//               {successMessage && <p className="text-green-500">{successMessage}</p>}
//               <button type="submit" className="bg-[#1ab266] p-2 rounded-full px-16 text-white font-semibold">
//                 Send Message
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   export default Support;

"use client";

import { useLayout } from "@/contexts/LayoutContext";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

function Support() {
  const { setShowHeaderFooter } = useLayout();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleBackButtonClick = () => {
    window.history.back();
  };

  const handleWhatsappNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/\D/g, "").slice(0, 15);
    setWhatsappNumber(sanitizedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !type || !whatsappNumber || !message) {
      toast.error("All fields are required.");
      return;
    }

    if (!/^\d{10,15}$/.test(whatsappNumber)) {
      toast.error("Please enter a valid Whatsapp number.");
      return;
    }

    try {
      const res = await fetch("https://ctbackend.crobstacle.com/api/queries/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          number: whatsappNumber,
          queryType: type,
          message,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        toast.success("Your message has been sent successfully.");
        setName("");
        setType("");
        setWhatsappNumber("");
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Section 1: Header */}
      <div className="bg-[#1ab266] px-3 sm:px-5">
        <div className="relative">
          {/* Back button */}
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
          Contact Us
        </h1>
      </div>

      {/* Section 2: Form */}
      <div className="px-3 sm:px-5 py-6 sm:py-10">
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <div className="flex items-center mb-2 sm:mb-3 gap-2">
              <h1 className="font-semibold text-sm sm:text-base">Enter your Full Name</h1>
            </div>
            <input
              type="text"
              className="bg-gray-200 text-black p-2 sm:p-3 rounded-md w-full text-sm sm:text-base"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Type Field (Select Box) */}
          <div className="mb-4">
            <div className="flex items-center mb-2 sm:mb-3 gap-2">
              <h1 className="font-semibold text-sm sm:text-base">Select your Query Type</h1>
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-gray-200 text-black p-2 sm:p-3 rounded-md w-full text-sm sm:text-base"
              required
            >
              <option value="">Select</option>
              <option value="Consult">Consult</option>
              <option value="Recharge Problem">Recharge Problem</option>
              <option value="Withdraw Problem">Withdraw Problem</option>
              <option value="Game Problem">Game Problem</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Whatsapp Number Field */}
          <div className="mb-4">
            <div className="flex items-center mb-2 sm:mb-3 gap-2">
              <h1 className="font-semibold text-sm sm:text-base">Enter your Whatsapp Number</h1>
            </div>
            <input
              type="text"
              className="bg-gray-200 text-black p-2 sm:p-3 rounded-md w-full text-sm sm:text-base"
              placeholder="Enter your Whatsapp number"
              value={whatsappNumber}
              onChange={handleWhatsappNumberInput}
              maxLength={15}
              required
            />
          </div>

          {/* Message Field */}
          <div className="mb-4">
            <div className="flex items-center mb-2 sm:mb-3 gap-2">
              <h1 className="font-semibold text-sm sm:text-base">Enter your Message</h1>
            </div>
            <textarea
              className="bg-gray-200 text-black p-2 sm:p-3 rounded-md w-full text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              type="submit"
              className="bg-[#1ab266] p-2 sm:p-3 rounded-full px-12 sm:px-16 text-white font-semibold text-sm sm:text-base hover:bg-[#159955] transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Support;
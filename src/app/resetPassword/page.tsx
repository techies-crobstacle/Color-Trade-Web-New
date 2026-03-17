// "use client";
// import React, { useState, useEffect } from "react";
// import { useLayout } from "@/contexts/LayoutContext";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// const ContinueScreen = () => {

//   const { setShowHeaderFooter } = useLayout();

//   useEffect(() => {
//     setShowHeaderFooter(false);
//     return () => setShowHeaderFooter(true); // Reset on unmount
//   }, [setShowHeaderFooter]);

//   const [inputValue, setInputValue] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const router = useRouter();

//   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setInputValue(event.target.value);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Basic validation for mobile number format
//     if (!/^\d{10}$/.test(inputValue)) {
//       setErrorMessage("Please enter a valid 10-digit mobile number.");
//       return;
//     }

//     try {
//       const response = await fetch("https://ctbackend.crobstacle.com/api/auth/forget-password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ number: inputValue }), // Send mobile number as "number"
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Something went wrong");
//       }

//       // Navigate to the ResetPasswordScreen with the mobile number as a query parameter
//       router.push(`/newPassword?number=${inputValue}`);
//       toast.success("Password reset Successfully");
//     } catch (error) {
//       if (error instanceof Error) {
//         setErrorMessage(error.message);
//       } else {
//         setErrorMessage("An unexpected error occurred.");
//       }
//     }
//   };

//   return (
//     <div className="min-h-[100vh]">
//       {/* Header Section */}
//       <div className="bg-[#1ab266] px-5 pt-2 pb-6">
//         <div className="relative">
//           <Image
//             className="w-36 mx-auto mb-6"
//             src="/headerlogo.png"
//             width={320}
//             height={120}
//             alt="logo"
//           />
//         </div>
//         <h1 className="text-xl font-semibold text-white">Enter your details</h1>
//         <p className="text-white text-sm font-light mt-2">
//           Enter your mobile number to continue
//         </p>
//       </div>

//       {/* Input Section */}
//       <div className="p-5">
//         <form className="py-5" onSubmit={handleSubmit}>
//           <div className="mb-5">
//             <label className="block text-gray-700 font-semibold mb-2">
//               Mobile Number
//             </label>
//             <input
//               className="w-full bg-gray-200 text-black p-2 rounded-md"
//               type="text"
//               placeholder="Enter mobile number"
//               value={inputValue}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           {/* Error Message */}
//           {errorMessage && (
//             <p className="text-red-500 text-center">{errorMessage}</p>
//           )}

//           {/* Submit Button */}
//           <div className="flex flex-col items-center gap-4">
//             <button
//               type="submit"
//               className="bg-green-500 text-white p-2 w-96 rounded-full"
//             >
//               Continue
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ContinueScreen;
"use client";
import React, { useState, useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ContinueScreen = () => {
  const { setShowHeaderFooter } = useLayout();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for mobile number format
    if (!/^\d{10}$/.test(inputValue)) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://ctbackend.crobstacle.com/api/auth/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number: inputValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Success - mobile number verified, proceed to password reset screen
      toast.success("Mobile number verified! Please set your new password.");
      router.push(`/newPassword?number=${inputValue}`);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-[#1ab266] px-3 sm:px-5 pt-2 pb-6 sm:pb-8">
        <div className="relative">
          <Image
            className="w-28 sm:w-36 mx-auto mb-4 sm:mb-6"
            src="/headerlogo.png"
            width={320}
            height={120}
            alt="logo"
          />
        </div>
        <h1 className="text-lg sm:text-xl font-semibold text-white">
          Forgot Password?
        </h1>
        <p className="text-white text-xs sm:text-sm font-light mt-2">
          Enter your registered mobile number to reset your password
        </p>
      </div>

      {/* Input Section */}
      <div className="p-3 sm:p-5">
        <form className="py-4 sm:py-5" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Mobile Number
            </label>
            <input
              className="w-full bg-gray-200 text-black p-2 sm:p-3 rounded-md text-sm sm:text-base"
              type="text"
              placeholder="Enter your 10-digit mobile number"
              value={inputValue}
              onChange={handleInputChange}
              maxLength={10}
              required
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-center text-sm sm:text-base mb-4">
              {errorMessage}
            </p>
          )}

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white p-2 sm:p-3 w-full max-w-sm rounded-full font-semibold text-sm sm:text-base hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContinueScreen;
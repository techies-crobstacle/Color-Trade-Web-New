"use client";

import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSocket } from "@/contexts/SocketContext";
import { Suspense } from "react";

export default function Login() {
  const [passwordVis, setPasswordVis] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const { onTokenChange } = useSocket();

  const handleImageClick = () => {
    setPasswordVis(!passwordVis);
  };

  const handlePhoneNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(sanitizedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      number: phoneNumber,
      password,
    };

    try {
      const response = await fetch("https://ctbackend.crobstacle.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        setErrorMessage(data.message || "Something went wrong");
        toast.error(data.message || "Something went wrong");
        return;
      }

      if (!data.data?.token) {
        setErrorMessage("❌ Token not received from API!");
        toast.error("❌ Token not received from API!");
        return;
      }

      setErrorMessage("");
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("showLoginPopup", "true");
      
      // Set cookie with production-friendly settings
      const isSecure = window.location.protocol === 'https:';
      const cookieString = `token=${data.data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      document.cookie = cookieString;
      
      onTokenChange(data.data.token);
      toast.success(data.message || "Login Successful");

      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (error) {
      setErrorMessage("Network error. Please try again later.");
      console.error("Network error:", error);
      toast.error("Network error. Please try again later.");
    }
  };

  const handleBackButtonClick = () => {
    window.history.back();
  };

  return (
    <Suspense>
      <div className="min-h-screen bg-[#242424]">
        {/* Section 1 - Header */}
        <div className="flex-1">
          <div className="bg-[#333332] px-4 sm:px-5 pt-2 pb-4 sm:pb-6">
            <div className="relative">
              <Image
                className="w-28 sm:w-36 mx-auto mb-4 sm:mb-6"
                src="/headerlogo1.png"
                width={320}
                height={120}
                alt="Logo"
              />
              {/* Back button */}
              <button 
                onClick={handleBackButtonClick} 
                className="absolute left-0 top-[12px] sm:top-[15px]"
                aria-label="Go back"
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
            <h1 className="text-lg sm:text-xl font-semibold text-white">Login</h1>
            <p className="text-white text-xs sm:text-sm font-light mt-1.5 sm:mt-2">
              Please login with your phone number or email
            </p>
            <p className="text-white text-xs sm:text-sm font-light">
              If you forget your password, please contact customer service
            </p>
          </div>
        </div>

        {/* Section 2 - Form */}
        <div className="p-4 sm:p-5 bg-[#242424]">
          <div className="flex flex-col items-center  pb-3 sm:pb-4 border-b-2 border-[#dcaf50] mb-4 sm:mb-5">
            <Image
              className="w-5 sm:w-6"
              src="/cellphone.png"
              width={432}
              height={578}
              alt="Phone icon"
            />
            <h1 className="text-center text-[#dcaf50] text-base sm:text-lg font-semibold mt-1">
              Login using Phone
            </h1>
          </div>

          <form className="py-3 sm:py-5" onSubmit={handleSubmit}>
            {/* Phone Number Field */}
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Image
                  className="w-4 sm:w-5"
                  src="/cellphone.png"
                  width={100}
                  height={100}
                  alt="Phone icon"
                />
                <h1 className="font-semibold text-sm text-white sm:text-base">Phone number</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <select className="bg-[#4d4d4c] text-white p-2 rounded-md text-sm sm:text-base flex-shrink-0">
                  <option value="+91">+91</option>
                </select>
                <input
                  className="bg-[#4d4d4c] text-white p-2 rounded-md w-full text-sm sm:text-base"
                  type="text"
                  placeholder="Enter mobile number"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={handlePhoneNumberInput}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-4 sm:mb-5">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Image
                    className="w-5 sm:w-6"
                    src="/forgetpassword.png"
                    width={100}
                    height={100}
                    alt="Password icon"
                  />
                  <h1 className="font-semibold text-white text-sm sm:text-base">Password</h1>
                </div>
                <input
                  className="w-full bg-[#4d4d4c] text-white p-2 rounded-md text-sm sm:text-base pr-10"
                  type={passwordVis ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Image
                  onClick={handleImageClick}
                  className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-[38px] sm:top-[42px] cursor-pointer"
                  src={passwordVis ? "/eye.png" : "/eye-hide.png"}
                  width={60}
                  height={60}
                  alt="Toggle password visibility"
                />
              </div>
              <div className="flex gap-2 my-2 sm:my-3">
                <input type="checkbox" className="w-4 sm:w-5 flex-shrink-0" />
                <h1 className="font-semibold text-gray-500 text-xs sm:text-base">
                  Remember password
                </h1>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-red-500 text-center text-sm mb-3">{errorMessage}</p>
            )}

            {/* Buttons */}
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <button
                type="submit"
                className="bg-gradient-to-b from-[#FAE59F] to-[#C4933F] text-[#713b00]  p-2.5 sm:p-2 max-w-96 w-full rounded-full text-sm sm:text-base font-bold"
              >
                Log in
              </button>
              <Link 
                href="/register" 
                className="text-center text-[#c4933f] border-2 border-[#c4933f] p-2.5 sm:p-2 rounded-full max-w-96 w-full text-sm sm:text-base font-medium"
              >
                Register
              </Link>
            </div>

            {/* Forgot Password Link */}
            <Link href="/resetPassword">
              <h1 className="text-center my-3 sm:my-2 text-[#c4933f] font-bold text-sm sm:text-base">
                Forgot password?
              </h1>
            </Link>
          </form>
        </div>
      </div>
    </Suspense>
  );
}
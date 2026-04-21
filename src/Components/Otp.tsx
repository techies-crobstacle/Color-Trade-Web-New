"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Make sure you have <ToastContainer /> somewhere in your root layout/page

const Otp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`)?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    if (!phone) {
      toast.error("Phone number is missing.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://ctbackend.crobstacle.com/api/auth/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: phone, otp: otpValue }),
      });

      if (response.ok) {
  const data = await response.json();
  
  // Check verification success
  if (data.number === phone && data.otp == otpValue) {
    toast.success("OTP Verified Successfully!");
  } else {
    toast.success("OTP verified successfully! Account Activated.");
  }
  
  // Redirect after short delay so toast can show
  setTimeout(() => {
    router.push("/login");
  }, 1000);
} else {
  toast.error("Invalid OTP. Please try again.");
}

    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackButtonClick = () => {
    window.history.back();
  };

  useEffect(() => {
    if (!phone) {
      window.location.href = "/register";
    }
  }, [phone]);

  return (
    <div className="min-h-[100vh] bg-[#242424]">
      {/* Section 1 */}
      <div className="flex-1">
        <div className="bg-[#333332] px-5 pt-2 pb-6">
          <div className="relative">
            <Image
              className="w-36 mx-auto mb-6"
              src="/headerlogo1.png"
              width={320}
              height={120}
              alt=""
            />
            {/* Back button */}
            <button
              onClick={handleBackButtonClick}
              className="absolute left-0 top-[15px]"
            >
              <Image
                src="/back-white.png"
                alt="back-button"
                width={100}
                height={100}
                className="w-5"
              />
            </button>
          </div>
          <h1 className="text-xl font-semibold text-white">Verify OTP</h1>
          <p className="text-white text-sm font-light mt-2">
            Enter your OTP received on the registered Mobile Number for verification
          </p>
        </div>
      </div>

      {/* Section 2 */}
      <div className="p-5">
        <div className="flex flex-col items-center pb-4 border-b-2 border-[#c4933f] mb-8">
          <Image className="w-6" src="/cellphone.png" width={432} height={578} alt="" />
          <h1 className="text-center text-[#c4933f] text-lg font-semibold">
            Verify your OTP!
          </h1>
        </div>
        {phone && (
          <div className="flex flex-col items-center mb-7">
            <p className="text-gray-50 font-medium">OTP sent to:</p>
            <p className="text-lg text-[#c4933f] font-semibold">{phone}</p>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="flex justify-center space-x-2 mb-7">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                className="w-12 h-12 text-center text-xl bg-[#4d4d4c] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fff]"
                inputMode="numeric"
              />
            ))}
          </div>

          <p className="font-light text-white mb-5">
            <Link href="" className="underline underline-offset-2">
              Resend OTP
            </Link>{" "}
            in <span className="text-[#c4933f]">02:59</span>
          </p>
          <button
            onClick={handleSubmit}
            className="bg-green-500 p-2 rounded-full px-16 text-white font-semibold"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Otp;

"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";


// Make sure you have <ToastContainer /> somewhere in your root layout/page

const Otp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(180); // 3 minutes in seconds

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
      const response = await fetch("https://ctbackend.crobstacle.com/api/auth/verifyotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: phone, otp: otpValue }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token if provided
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Store user details if provided
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        // Store announcements if needed
        if (data.announcements) {
          localStorage.setItem("announcements", JSON.stringify(data.announcements));
        }
        
        toast.success("OTP verified successfully! Account Activated.");
        
        // Redirect after short delay so toast can show
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        // Handle error message from backend
        const errorMessage = data.message || "Invalid or expired OTP. Please try again.";
        toast.error(errorMessage);
      }

    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!phone) {
      toast.error("Phone number is missing.");
      return;
    }
    
    if (timer > 0) {
      return; // Don't allow resend if timer is still running
    }

    setResendLoading(true);
    try {
      const response = await fetch("https://ctbackend.crobstacle.com/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: phone }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP has been resent successfully!");
        setTimer(180); // Reset timer to 3 minutes
        setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
      } else {
        const errorMessage = data.message || "Failed to resend OTP. Please try again.";
        toast.error(errorMessage);
      }

    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackButtonClick = () => {
    window.history.back();
  };

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Format timer to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
                className="w-12 h-12 text-center text-xl text-white bg-[#4d4d4c] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fff]"
                inputMode="numeric"
              />
            ))}
          </div>

          <p className="font-light text-white mb-5">
            {timer > 0 ? (
              <>
                Resend OTP in <span className="text-[#c4933f]">{formatTime(timer)}</span>
              </>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="underline underline-offset-2 text-white hover:text-[#c4933f] disabled:opacity-50"
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>
            )}
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

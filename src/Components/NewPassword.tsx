"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const NewPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const number = searchParams.get("number");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword || !number) {
      setErrorMessage("Please fill all the fields.");
      toast.error("Please fill all the fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";
      const response = await fetch(`${API_BASE}/api/auth/update-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: number,
            otp: otp,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success("Password reset successfully! Please login.");
      router.push("/login");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred while resetting the password.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!number) {
      router.push("/continue");
    }
  }, [number, router]);

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
          Reset Password
        </h1>
        <p className="text-white text-xs sm:text-sm font-light mt-2">
          Enter the OTP sent to your mobile number, then set a new password.
        </p>
      </div>

      {/* Input Section */}
      <div className="p-3 sm:p-5">
        <form className="py-4 sm:py-5" onSubmit={handleSubmit}>
          {/* Mobile Number (Disabled) */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Mobile Number
            </label>
            <input
              className="w-full bg-gray-300 text-gray-600 p-2 sm:p-3 rounded-md text-sm sm:text-base cursor-not-allowed"
              type="text"
              placeholder="Mobile number"
              value={number || ""}
              disabled
            />
          </div>

          {/* OTP Input */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Verify OTP
            </label>
            <input
              className="w-full bg-gray-200 text-black p-2 sm:p-3 rounded-md text-sm sm:text-base"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              required
            />
          </div>

          {/* New Password */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              New Password
            </label>
            <input
              className="w-full bg-gray-200 text-black p-2 sm:p-3 rounded-md text-sm sm:text-base"
              type="password"
              placeholder="Enter new password (min. 6 characters)"
              value={newPassword}
              onChange={handleNewPasswordChange}
              minLength={6}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Confirm New Password
            </label>
            <input
              className="w-full bg-gray-200 text-black p-2 sm:p-3 rounded-md text-sm sm:text-base"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              minLength={6}
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
          <div className="flex flex-col items-center gap-4 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white p-2 sm:p-3 w-full max-w-sm rounded-full font-semibold text-sm sm:text-base hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting Password..." : "Set New Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
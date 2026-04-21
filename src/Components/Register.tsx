"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [passwordVis, setPasswordVis] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const router = useRouter();

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
      name,
      password,
      number: phoneNumber,
    };
    try {
      const response = await fetch("https://ctbackend.crobstacle.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success(data.message || "Registration successful");
        setTimeout(() => {
          router.push(`/otp?phone=${phoneNumber}`);
        }, 1500);
      }
    } catch {
      toast.error("Network error. Please try again later.");
    }
  };

  const handleBackButtonClick = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen">
      {/* Section 1 - Header */}
      <div className="flex-1">
        <div className="bg-[#333332]  pt-2 px-4 sm:px-5 pb-4 sm:pb-6">
          <div className="relative">
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
            <Image
              className="w-28 sm:w-36 mx-auto mb-4 sm:mb-6"
              src="/headerlogo1.png"
              width={320}
              height={120}
              alt="Logo"
            />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-white">Register</h1>
          <p className="text-white text-xs sm:text-sm font-light mt-1.5 sm:mt-2">
            Please Register using your Mobile Number
          </p>
        </div>
      </div>

      {/* Section 2 - Form */}
      <div className="p-4 sm:p-5 bg-[#242424]">
        <div className="flex flex-col items-center  pb-3 sm:pb-4 border-b-2 border-[#c4933f] mb-4 sm:mb-5">
          <Image
            className="w-5 sm:w-6"
            src="/cellphone.png"
            width={432}
            height={578}
            alt="Phone icon"
          />
          <h1 className="text-center text-[#dcaf50] text-base sm:text-lg font-semibold mt-1">
            Register your Phone
          </h1>
        </div>

        <form className="py-3 sm:py-5" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <div className="flex items-center mb-2 sm:mb-3 gap-2">
              <Image 
                className="w-4 sm:w-5" 
                src="/user.png" 
                width={100} 
                height={100} 
                alt="User icon" 
              />
              <h1 className="font-semibold text-sm text-white sm:text-base">Full Name</h1>
            </div>
            <input
              type="text"
              className="bg-[#4d4d4c] text-white p-2 rounded-md w-full text-sm sm:text-base"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Phone Number Field */}
          <div className="mb-4">
            <div className="flex items-center mb-2 sm:mb-3 gap-2">
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
                <option  value="+91">+91</option>
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
          <div className="relative mb-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Image 
                className="w-5 sm:w-6" 
                src="/forgetpassword.png" 
                width={100} 
                height={100} 
                alt="Password icon" 
              />
              <h1 className="font-semibold text-white text-sm sm:text-base">Set password</h1>
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

          {/* Invite Code Field */}
          <div className="mb-4 sm:mb-5">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Image 
                className="w-5 sm:w-6" 
                src="/invitation.png" 
                width={100} 
                height={100} 
                alt="Invitation icon" 
              />
              <h1 className="font-semibold text-white text-sm sm:text-base">Invite code</h1>
            </div>
            <input
              type="text"
              className="p-2 bg-[#4d4d4c] text-white rounded-md w-full text-sm sm:text-base"
              placeholder="Enter invite code (optional)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>

          {/* Privacy Agreement */}
          <div className="flex gap-2 my-3">
            <input type="checkbox" className="w-4 sm:w-5 flex-shrink-0 mt-0.5" required />
            <h1 className="font-semibold text-gray-500 text-xs sm:text-base">
              I have read & agree{" "}
              <span className="text-red-500 cursor-pointer">
                [Privacy Agreement]
              </span>
            </h1>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button
              type="submit"
              className="bg-gradient-to-b from-[#FAE59F] to-[#C4933F] p-2.5 sm:p-2 rounded-full w-full max-w-xs text-gray-700 font-semibold text-sm sm:text-base"
            >
              Continue
            </button>
          </div>
        </form>
      </div>

      {/* Section 3 - Login Link */}
      <div className="flex flex-col bg-[#333332] items-center gap-4 pb-5 px-4">
        <span className="text-white font-semibold text-xs sm:text-sm text-center">
          Already have an Account?{" "}
          <Link
            href="/login"
            className="text-[#c4933f] underline underline-offset-2"
          >
            Login
          </Link>
        </span>
      </div>
    </div>
  );
}
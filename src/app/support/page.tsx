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
    <div className="min-h-screen bg-[#242424]">
      {/* Section 1: Header */}
      <div className="bg-[#333332] px-3 sm:px-5">
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
              <h1 className="font-semibold text-sm text-white sm:text-base">Enter your Full Name</h1>
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
              <h1 className="font-semibold text-white text-sm sm:text-base">Select your Query Type</h1>
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
              <h1 className="font-semibold text-white text-sm sm:text-base">Enter your Whatsapp Number</h1>
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
              <h1 className="font-semibold text-white text-sm sm:text-base">Enter your Message</h1>
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
              className="bg-[#c4832f] p-2 sm:p-3 rounded-full px-12 sm:px-16 text-white font-semibold text-sm sm:text-base hover:bg-[#c4831f] transition-colors"
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
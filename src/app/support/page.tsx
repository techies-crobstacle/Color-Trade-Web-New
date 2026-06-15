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
  const [showModal, setShowModal] = useState(false);
  const [queriesData, setQueriesData] = useState<any[]>([]);

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
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";
      const res = await fetch(`${API_BASE}/api/queries/submit`, {
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

  const handleContactClick = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";
      const res = await fetch(`${API_BASE}/api/queries/my-queries`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
      });

      if (!res.ok) {
        toast.error(`Failed to fetch queries: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();
      console.log("Queries data:", data);
      setQueriesData(data.queries || data.data || data);
      setShowModal(true);
    } catch (error) {
      console.error("API error:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
  <div className="min-h-screen bg-[#242424]">
    {/* Section 1: Header */}
    <div className="bg-[#333332] px-3 sm:px-5">
      <div className="relative flex items-center justify-between py-3">
        {/* Back button - Left */}
        <button
          onClick={handleBackButtonClick}
          className="w-4 sm:w-5"
        >
          <Image
            src="/back-white.png"
            alt="back-button"
            width={100}
            height={100}
            className="w-4 sm:w-5"
          />
        </button>

        {/* Contact Us - Center */}
        <h1 className="text-lg sm:text-xl font-semibold text-white absolute left-1/2 transform -translate-x-1/2">
          Contact Us
        </h1>

        {/* Contact Icon Button - Right */}
        <button
          onClick={handleContactClick}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
        >
          <img src="/contact.png" alt="my queries" className="w-full h-full" />
        </button>
      </div>
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

      {/* Modal for displaying queries */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-[#333332] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-lg sm:text-xl font-semibold text-white">My Queries</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-300 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {queriesData && queriesData.length > 0 ? (
                <div className="space-y-4">
                  {queriesData.map((query: any, index: number) => (
                    <div key={index} className="bg-[#242424] p-4 rounded-lg">
                      <div className="mb-2">
                        <span className="text-gray-400 text-sm">Name: </span>
                        <span className="text-white">{query.name}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-gray-400 text-sm">Type: </span>
                        <span className="text-white">{query.queryType}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-gray-400 text-sm">Number: </span>
                        <span className="text-white">{query.number}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-gray-400 text-sm">Message: </span>
                        <span className="text-white">{query.message}</span>
                      </div>
                      {query.status && (
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            query.status === 'pending' ? 'bg-yellow-600' : 
                            query.status === 'resolved' ? 'bg-green-600' : 'bg-gray-600'
                          }`}>
                            {query.status}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No queries found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Support;
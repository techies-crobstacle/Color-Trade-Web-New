"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";

export default function RiskAgreement() {
  const { setShowHeaderFooter } = useLayout();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);

  const handleBackButtonClick = () => {
    window.history.back();
  };

  return (
    <div className="bg-white flex-1 min-h-screen">
      {/* Header Section */}
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
          Privacy Policy
        </h1>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-5 pb-6 font-medium text-gray-500 text-xs sm:text-sm flex flex-col gap-3 sm:gap-4">
        <p className="leading-relaxed">
          When you visit the Site, we collect certain information about your
          device, your interaction with the Site, and the information necessary
          to process your purchases. We may also collect additional information
          if you may also collect additional information if you
        </p>

        <h3 className="text-xl sm:text-2xl lg:text-3xl text-black font-semibold mt-2">
          Minors
        </h3>
        <p className="leading-relaxed">
          The Site is not intended for individuals under the age of 18. We do
          not intentionally collect Personal Information from children. If you
          are the parent or guardian and believe your child has provided us with
          Personal Information, please contact us at the address below to request
          deletion.
        </p>

        <h3 className="text-xl sm:text-2xl lg:text-3xl text-black font-semibold mt-2">
          Sharing Personal Information
        </h3>
        <p className="leading-relaxed">
          We share your Personal Information with service providers to help us
          provide our services and fulfill our contracts with you, as described
          above. For example:
        </p>
        <ul className="list-disc ml-4 sm:ml-5 space-y-2 leading-relaxed">
          <li>
            We use Shopify to power our online store. You can read more about how
            Shopify uses your Personal Information here:
            <a 
              href="https://www.shopify.com/legal/privacy" 
              className="text-blue-600 hover:underline break-all ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.shopify.com/legal/privacy
            </a>
          </li>
          <li>
            We may share your Personal Information to comply with applicable laws
            and regulations, to respond to a subpoena, search warrant or other
            lawful request for information we receive, or to otherwise protect our
            rights.
          </li>
        </ul>

        <h3 className="text-xl sm:text-2xl lg:text-3xl text-black font-semibold mt-2">
          Using Personal Information
        </h3>
        <p className="leading-relaxed">
          We use your personal Information to provide our services to you, which
          includes: offering products for sale, processing payments, shipping and
          fulfillment of your order, and keeping you up to date on new products,
          services, and offers.
        </p>

        <h3 className="text-xl sm:text-2xl lg:text-3xl text-black font-semibold mt-2">
          Lawful basis
        </h3>
        <p className="leading-relaxed">
          Pursuant to the General Data Protection Regulation (&quot;GDPR&quot;), if you are
          a resident of the European Economic Area (&quot;EEA&quot;), we process your
          personal information under the following lawful bases:
        </p>
        <ul className="list-disc ml-4 sm:ml-5 space-y-2 leading-relaxed">
          <li>Your consent</li>
          <li>The performance of the contract between you and the Site</li>
          <li>Compliance with our legal obligations</li>
          <li>To protect your vital interests</li>
          <li>To perform a task carried out in the public interest</li>
          <li>
            For our legitimate interests, which do not override your fundamental
            rights and freedoms
          </li>
        </ul>
      </div>
    </div>
  );
}
"use client";
import React, { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import Image from "next/image";

export default function Privacy() {
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
      {/* Section 1 */}
      <div className="bg-[#1ab266] px-5">
        <div className="relative">
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
        <h1 className="text-xl font-semibold text-white text-center py-3">
          Privacy Policy
        </h1>
      </div>
      {/* Section 2 */}
      <div className="p-5 font-[500] text-gray-500 text-sm flex flex-col gap-3">
        <p>
          When you visit the Site, we collect certain information about your
          device, your interaction with the Site, and the information necessary
          to process your purchases. We may also collect additional information
          if you may also collect additional information if you
        </p>
        <h3 className="text-3xl text-black">Minors</h3>
        <p>
          The Site is not intended for individuals under the age of 18 . We do
          not intentionally collect Personal Information from children. If you
          are the parent or guardian and believe your child has provided us with
          Personal Information, please contact us at the address below to
          request deletion.
        </p>
        <h3 className="text-3xl text-black">Sharing Personal Information</h3>
        <p>
          We share your Personal Information with service providers to help us
          provide our services and fulfill our contracts with you, as described
          above. For example:
        </p>
        <ul className="list-disc ml-4">
          <li>
            We use Shopify to power our online store. You can read more about
            how Shopify uses your Personal Information here:
            https://www.shopify.com/legal/privacy.
          </li>
          <li>
            We may share your Personal Information to comply with applicable laws
            and regulations, to respond to a subpoena, search warrant or other
            lawful request for information we receive, or to otherwise protect
            our rights.
          </li>
        </ul>
        <h3 className="text-3xl text-black">Using Personal Information</h3>
        <p>
          We use your personal Information to provide our services to you, which
          includes: offering products for sale, processing payments, shipping and
          fulfillment of your order, and keeping you up to date on new products,
          services, and offers.
        </p>
        <h3 className="text-3xl text-black">Lawful basis</h3>
        <p>
          Pursuant to the General Data Protection Regulation (“GDPR”), if you are
          a resident of the European Economic Area (“EEA”), we process your
          personal information under the following lawful bases:
        </p>
        <ul className="list-disc ml-4">
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

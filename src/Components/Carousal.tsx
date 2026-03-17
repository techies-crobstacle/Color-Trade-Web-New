"use client";
import { useState } from "react";
import Image from "next/image";
import Min1 from "./Games/Min3Game1";
import Min3 from "./Games/Min3Game2";
import Min5 from "./Games/Min3Game3";

const Carousal = () => {
  const [activeTab, setActiveTab] = useState("1Min");

  const tabs = [
    { id: "1Min", label: "1 Min", img: "/clock.png" },
    { id: "3Min", label: "3 Min", img: "/clock.png" },
    { id: "5Min", label: "5 Min", img: "/clock.png" },
    
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "1Min":
        return (
          <div>
            {" "}
            <Min1 />
          </div>
        );
      case "3Min":
        return (
          <div>
            <Min3 />
          </div>
        );
      case "5Min":
        return (
          <div>
            <Min5 />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-2xl mt-4">
      <div className="flex space-x-2 mb-4 shadow-md rounded-xl">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex flex-col items-center basis-1/4 px-4 py-1 rounded-xl cursor-pointer ${
              activeTab === tab.id
                ? "bg-gradient-to-b from-green-600 to-green-400 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Image
              className={`w-7 ${activeTab === tab.id ? "" : "grayscale"}`}
              src={tab.img}
              alt=""
              width={100}
              height={100}
            />
            <h1
              className={`text-[13px] font-semibold ${
                activeTab === tab.id ? "text-white" : "text-gray-400"
              }`}
            >
              Win Go
            </h1>
            <p
              className={`text-md ${
                activeTab === tab.id ? "text-white" : "text-gray-400"
              }`}
            >
              {tab.label}
            </p>
          </div>
        ))}
      </div>{" "}
      <div className="p-4 border rounded bg-gray-50">{renderContent()}</div>
    </div>
  );
};

export default Carousal;

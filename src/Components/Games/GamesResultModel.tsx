"use client";

import Image from "next/image";
import clsx from "clsx";

export type ResultPopupData = {
  period: string;
  number: number;
  colors: string[];
  size: string | null;
  outcome: string | null;
  winnings: number;
};

interface GamesResultModelProps {
  resultPopup: ResultPopupData | null;
  onClose: () => void;
}

export default function GamesResultModel({ resultPopup, onClose }: GamesResultModelProps) {
  if (!resultPopup) return null;

  const isWon = resultPopup.outcome === "won";
  const isLost = resultPopup.outcome === "lost";

  return (
    <>
      <style>{`
        @keyframes result-popup-in {
          from { opacity: 0; transform: scale(0.75) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes progress-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div
        key={resultPopup.period}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={onClose}
      >
        <div
          className="relative w-[300px] mx-4 rounded-3xl overflow-hidden shadow-2xl"
          style={{ animation: "result-popup-in 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient header */}
          <div
            className={`flex flex-col items-center pt-5 pb-8 px-6 ${
              isWon
                ? "bg-gradient-to-b from-[#22c55e] to-[#16a34a]"
                : isLost
                ? "bg-gradient-to-b from-[#ef4444] to-[#b91c1c]"
                : "bg-gradient-to-b from-[#FF6B35] to-[#FF4E4E]"
            }`}
          >
            {/* Medal coin */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-3"
              style={{
                background: "radial-gradient(circle at 35% 35%, #FFE566, #FFA500 60%, #e07b00)",
              }}
            >
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="18" fill="rgba(255,255,255,0.15)" />
                <text
                  x="50%"
                  y="55%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="22"
                  fill="white"
                >
                  {isWon ? "🎉" : isLost ? "😔" : "🎯"}
                </text>
              </svg>
            </div>

            <h2 className="text-white text-2xl font-extrabold tracking-wide drop-shadow">
              {isWon ? "You Won this round!" : isLost ? "You Lost this round" : "Lottery Results"}
            </h2>

            {/* Bonus — only on win */}
            {isWon && resultPopup.winnings > 0 && (
              <div className="mt-2 bg-white bg-opacity-20 rounded-xl px-5 py-2 flex flex-col items-center">
                <span className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">
                  Bonus
                </span>
                <span className="text-white text-3xl font-extrabold">
                  ₹{resultPopup.winnings.toFixed(2)}
                </span>
              </div>
            )}

            {/* Color / number / size tags */}
            <div className="flex gap-2 flex-wrap justify-center items-center mt-4">
              {resultPopup.colors.map((color, i) => (
                <span
                  key={i}
                  className={clsx(
                    "px-3 py-1 rounded-full text-white text-sm font-bold capitalize shadow",
                    color.toLowerCase() === "green"
                      ? "bg-green-500"
                      : color.toLowerCase() === "red"
                      ? "bg-red-600"
                      : color.toLowerCase() === "violet"
                      ? "bg-violet-600"
                      : "bg-gray-500"
                  )}
                >
                  {color}
                </span>
              ))}
              <span className="bg-white bg-opacity-25 text-white px-3 py-1 rounded-full text-sm font-bold shadow">
                {resultPopup.number}
              </span>
              {resultPopup.size && (
                <span
                  className={clsx(
                    "px-3 py-1 rounded-full text-white text-sm font-bold capitalize shadow",
                    resultPopup.size.toLowerCase() === "big"
                      ? "bg-orange-400"
                      : "bg-blue-500"
                  )}
                >
                  {resultPopup.size}
                </span>
              )}
            </div>
          </div>

          {/* White bottom — identical for won and lost */}
          <div className="bg-white flex flex-col items-center py-5 px-6 gap-3">
            <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-orange-400 shadow-md">
              {resultPopup.number >= 0 ? (
                <Image
                  src={`/No_images/${resultPopup.number}.png`}
                  alt={`${resultPopup.number}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">...</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-gray-400 text-[10px] uppercase tracking-widest">
                Period
              </span>
              <span className="text-gray-700 text-xs font-semibold">
                {resultPopup.period}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">Winning Number:</span>
              <span className="text-gray-800 text-sm font-bold">
                {resultPopup.number >= 0 ? resultPopup.number : "—"}
              </span>
            </div>

            <p className="text-gray-400 text-xs flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              5 seconds auto close
            </p>

            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FF6B35, #FF4E4E)",
                  animation: "progress-shrink 5s linear forwards",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
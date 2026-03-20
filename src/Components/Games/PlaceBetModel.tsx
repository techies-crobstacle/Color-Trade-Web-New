// import { useState } from "react";

// interface PlaceBetModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: (amount: number, multiplier: number) => void;

//   selectedBet: {
//     type: "color" | "number" | "size" | null;
//     value: string | number | null;
//   };
//   gamePeriod: string;
//   disabled?: boolean;
// }

// export default function PlaceBetModel({
//   isOpen,
//   onClose,
//   onConfirm,
//   selectedBet,
//   disabled = false
// }: PlaceBetModalProps) {
//   const [selectedAmount, setSelectedAmount] = useState(10);
//   const [selectedMultiplier, setSelectedMultiplier] = useState(1);

//   const amounts = [10, 50, 100, 500, 1000];
//   const multipliers = [1 ,2, 5, 10, 50];

//   const handleConfirm = () => {
//     const finalBetAmount = selectedAmount * selectedMultiplier;
//     onConfirm(finalBetAmount, selectedMultiplier);
//     onClose();
//   };

//   const getBetDisplayText = () => {
//     if (!selectedBet.type || selectedBet.value === null) return "No selection";

//     if (selectedBet.type === "color") {
//       return `Color: ${selectedBet.value}`;
//     } else if (selectedBet.type === "number") {
//       return `Number: ${selectedBet.value}`;
//     } else if (selectedBet.type === "size") {
//       return `Size: ${selectedBet.value}`;
//     }
//     return "Unknown selection";
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] h-full p-4">
//       <div className="bg-white h-full md:h-auto rounded-2xl w-full max-w-sm mx-auto shadow-2xl">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-t-2xl p-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-white font-bold text-lg">Place Your Bet</h2>
//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 w-8 h-8 flex items-center justify-center"
//             >
//               ✕
//             </button>
//           </div>
//           <div className="mt-2 bg-white bg-opacity-20 rounded-lg p-2">
//             <p className="text-white text-sm font-medium">{getBetDisplayText()}</p>
//           </div>
//         </div>

//         <div className="p-6">
//           {/* Amount Selection */}
//           <div className="mb-6">
//             <h3 className="text-gray-800 font-semibold mb-3">Select Amount</h3>
//             <div className="grid grid-cols-3 gap-3">
//               {amounts.map((amount) => (
//                 <button
//                   key={amount}
//                   onClick={() => setSelectedAmount(amount)}
//                   disabled={disabled}
//                   className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
//                     selectedAmount === amount
//                       ? "bg-green-600 text-white shadow-lg scale-105"
//                       : "bg-gray-100 text-gray-800 hover:bg-gray-200"
//                   } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
//                 >
//                   ₹{amount}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Multiplier Selection */}
//           <div className="mb-6">
//             <h3 className="text-gray-800 font-semibold mb-3">Select Multiplier</h3>
//             <div className="grid grid-cols-5 gap-3">
//               {multipliers.map((multiplier) => (
//                 <button
//                   key={multiplier}
//                   onClick={() => setSelectedMultiplier(multiplier)}
//                   disabled={disabled}
//                   className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
//                     selectedMultiplier === multiplier
//                       ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105"
//                       : "bg-gray-100 text-gray-800 hover:bg-gray-200"
//                   } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
//                 >
//                   x{multiplier}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Bet Summary */}
//           <div className="bg-gray-50 rounded-lg p-4 mb-6">
//             <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
//               <span>Base Amount:</span>
//               <span className="font-semibold">₹{selectedAmount}</span>
//             </div>
//             <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
//               <span>Multiplier:</span>
//               <span className="font-semibold">x{selectedMultiplier}</span>
//             </div>
//             <div className="border-t pt-2 mt-2">
//               <div className="flex justify-between items-center font-bold text-green-600 text-lg">
//                 <span>Total Bet Amount:</span>
//                 <span>₹{selectedAmount * selectedMultiplier}</span>
//               </div>
//             </div>
//           </div>

//           {/* Confirm Button */}
//           <button
//             onClick={handleConfirm}
//             disabled={disabled || !selectedBet.type || selectedBet.value === null}
//             className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
//               disabled || !selectedBet.type || selectedBet.value === null
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 active:scale-95 shadow-lg"
//             }`}
//           >
//             {disabled ? "Betting Closed" : "Confirm Bet"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useSocket } from "@/contexts/SocketContext";

interface PlaceBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, multiplier: number) => void;
  selectedBet: {
    type: "color" | "number" | "size" | null;
    value: string | number | null;
  };
  gamePeriod: string;
  disabled?: boolean;
}

export default function PlaceBetModel({
  isOpen,
  onClose,
  onConfirm,
  selectedBet,
  gamePeriod,
  disabled = false,
}: PlaceBetModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [selectedMultiplier, setSelectedMultiplier] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pull live balance and connection state from socket context
  const { balance, isConnected } = useSocket();

  const amounts = [10, 50, 100, 500, 1000];
  const multipliers = [1, 2, 5, 10, 50];
  const minMultiplier = 1;
  const maxMultiplier = 100;

  const totalBet = selectedAmount * selectedMultiplier;
  const hasInsufficientBalance = balance !== null && totalBet > balance;

  // Multiplier increment/decrement functions
  const handleIncrementMultiplier = () => {
    if (selectedMultiplier < maxMultiplier) {
      setSelectedMultiplier(selectedMultiplier + 1);
    }
  };

  const handleDecrementMultiplier = () => {
    if (selectedMultiplier > minMultiplier) {
      setSelectedMultiplier(selectedMultiplier - 1);
    }
  };

  // Bet is not allowed if:
  // - explicitly disabled (round closing)
  // - socket disconnected
  // - insufficient balance
  // - already submitting (prevent double click)
  const isBetDisabled =
    disabled ||
    !isConnected ||
    hasInsufficientBalance ||
    isSubmitting ||
    !selectedBet.type ||
    selectedBet.value === null;

  const handleConfirm = async () => {
    if (isBetDisabled) return;
    setIsSubmitting(true);
    try {
      await onConfirm(totalBet, selectedMultiplier);
      onClose();
    } catch {
      // error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBetDisplayText = () => {
    if (!selectedBet.type || selectedBet.value === null) return "No selection";
    if (selectedBet.type === "color") return `Color: ${selectedBet.value}`;
    if (selectedBet.type === "number") return `Number: ${selectedBet.value}`;
    if (selectedBet.type === "size") return `Size: ${selectedBet.value}`;
    return "Unknown selection";
  };

  const getConfirmButtonText = () => {
    if (isSubmitting) return "Placing Bet...";
    if (!isConnected) return "Disconnected";
    if (hasInsufficientBalance) return "Insufficient Balance";
    if (disabled) return "Betting Closed";
    return "Confirm Bet";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-3 sm:p-4">
      <div className="bg-white h-full md:h-auto rounded-xl sm:rounded-2xl w-full max-w-sm mx-auto shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#FAE59F] to-[#C4933F] rounded-t-xl sm:rounded-t-2xl p-3 sm:p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-black font-bold text-base sm:text-lg">
              Place Your Bet
            </h2>
            <button
              onClick={onClose}
              className="text-black hover:bg-white hover:bg-opacity-20 rounded-full p-1 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-lg sm:text-xl"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Bet selection display */}
          <div className="mt-2 bg-white bg-opacity-20 rounded-lg p-2">
            <p className="text-[#333332] text-xs sm:text-sm font-medium">
              {getBetDisplayText()}
            </p>
          </div>

          {/* Period display */}
          {gamePeriod && (
            <p className="text-[#333332] text-xs mt-1 opacity-80">
              Period: {gamePeriod}
            </p>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-[#333332]">
          {/* Balance + connection status row */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-xs sm:text-sm">
              Your Balance:
              <span
                className={`ml-1 font-bold ${hasInsufficientBalance ? "text-red-400" : "text-green-400"}`}
              >
                {balance !== null ? `₹${balance.toFixed(2)}` : "Loading..."}
              </span>
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                isConnected
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white animate-pulse"
              }`}
            >
              {isConnected ? "● Live" : "● Offline"}
            </span>
          </div>

          {/* Insufficient balance warning */}
          {hasInsufficientBalance && (
            <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-2 text-red-400 text-xs text-center">
              ⚠️ Insufficient balance. Please reduce your bet amount.
            </div>
          )}

          {/* Disconnected warning */}
          {!isConnected && (
            <div className="mb-4 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-2 text-yellow-400 text-xs text-center">
              ⚠️ No connection. Please wait for reconnection before betting.
            </div>
          )}

          {/* Amount Selection */}
          <div className="mb-5 sm:mb-6">
            <h3 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              Select Amount
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  disabled={disabled || isSubmitting}
                  className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                    selectedAmount === amount
                      ? "bg-gradient-to-b from-[#FAE59F] to-[#C4933F] text-black shadow-lg scale-105"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  } ${disabled || isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Multiplier Selection */}
          <div className="mb-5 sm:mb-6">
            <div className="flex flex-row justify-between items-center mb-1">
              <div>
                <h3 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                  Select Multiplier
                </h3>
              </div>
              {/* Multiplier Counter */}
              <div className="flex items-center justify-center mb-3">
                <button
                  onClick={handleDecrementMultiplier}
                  disabled={
                    selectedMultiplier <= minMultiplier ||
                    disabled ||
                    isSubmitting
                  }
                  className={`w-9 h-9 rounded-l-lg font-bold text-xl transition-all duration-200 ${
                    selectedMultiplier <= minMultiplier ||
                    disabled ||
                    isSubmitting
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-[#eed289] text-black hover:hover:bg-[#d4b24a] active:scale-95"
                  }`}
                >
                  -
                </button>

                <div className="bg-black px-8 py-1 min-w-[80px] text-center border-gray-600">
                  <span className="text-white font-bold text-lg">
                    {selectedMultiplier}
                  </span>
                </div>

                <button
                  onClick={handleIncrementMultiplier}
                  disabled={
                    selectedMultiplier >= maxMultiplier ||
                    disabled ||
                    isSubmitting
                  }
                  className={`w-9 h-9 rounded-r-lg font-bold text-xl transition-all duration-200 ${
                    selectedMultiplier >= maxMultiplier ||
                    disabled ||
                    isSubmitting
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-[#eed289] text-black hover:bg-[#d4b24a] active:scale-95"
                  }`}
                >
                  +
                </button>
              </div>
            </div>
            {/* Quick Select Multipliers */}
            {/* <p className="text-gray-400 text-xs text-center mb-2">
              Quick Select:
            </p> */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
              {multipliers.map((multiplier) => (
                <button
                  key={multiplier}
                  onClick={() => setSelectedMultiplier(multiplier)}
                  disabled={disabled || isSubmitting}
                  className={`py-2 sm:py-3 px-1 sm:px-4 rounded-lg font-semibold transition-all duration-200 text-xs sm:text-base ${
                    selectedMultiplier === multiplier
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  } ${disabled || isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  x{multiplier}
                </button>
              ))}
            </div>
          </div>

          {/* Bet Summary */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6">
            <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
              <span>Base Amount:</span>
              <span className="font-semibold">₹{selectedAmount}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
              <span>Multiplier:</span>
              <span className="font-semibold">x{selectedMultiplier}</span>
            </div>
            {/* {balance !== null && (
              <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                <span>Balance after bet:</span>
                <span className={`font-semibold ${hasInsufficientBalance ? "text-red-500" : "text-green-600"}`}>
                  ₹{Math.max(0, balance - totalBet).toFixed(2)}
                </span>
              </div>
            )} */}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-bold text-orange-500 text-base sm:text-lg">
                <span>Total Bet:</span>
                <span>₹{totalBet}</span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={isBetDisabled}
            className={`w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 ${
              isBetDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-b from-[#FAE59F] to-[#C4933F] text-black hover:from-[#e8d487] hover:to-[#b38332] active:scale-95 shadow-lg"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Placing Bet...
              </span>
            ) : (
              getConfirmButtonText()
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

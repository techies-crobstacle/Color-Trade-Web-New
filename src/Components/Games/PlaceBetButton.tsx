interface PlaceBetButtonProps {
  onClick: () => void;
  disabled: boolean;
  hasSelection: boolean;
}

export default function PlaceBetButton({ 
  onClick, 
  disabled, 
  hasSelection 
}: PlaceBetButtonProps) {
  const isClickable = !disabled && hasSelection;

  return (
    <div className="mt-4 px-4">
      <button
        onClick={onClick}
        disabled={!isClickable}
        className={`w-full py-4 rounded-xl font-bold text-lg mb-3 transition-all duration-200 ${
          isClickable
            ? "bg-orange-400 text-white hover:bg-orange-600 active:scale-95 shadow-lg"
            : hasSelection
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {!hasSelection 
          ? "Select a bet first" 
          : disabled 
          ? "Betting Closed" 
          : "Place Bet"
        }
      </button>
    </div>
  );
}
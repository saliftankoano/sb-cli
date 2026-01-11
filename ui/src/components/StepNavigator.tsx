import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { useEffect } from "react";

interface StepNavigatorProps {
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  nextTitle?: string;
  prevTitle?: string;
  isCompleted?: boolean;
}

export default function StepNavigator({
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  nextTitle,
  prevTitle,
  isCompleted,
}: StepNavigatorProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight" && canGoNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && canGoPrev) {
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canGoNext, canGoPrev, onNext, onPrev]);

  return (
    <div className="flex items-center justify-between gap-4 py-6 border-t border-[#30363d] mt-8">
      {/* Previous Button */}
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={`group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all w-[240px] shrink-0 ${
          canGoPrev
            ? "border-[#30363d] hover:bg-[#21262d] hover:border-gray-600 text-[#e6edf3]"
            : "border-transparent text-gray-600 cursor-not-allowed opacity-50"
        }`}
      >
        <ArrowLeftIcon size={20} className={canGoPrev ? "text-blue-400" : ""} />
        <div className="text-left min-w-0 flex-1">
          <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-0.5">
            Previous
          </div>
          {canGoPrev && prevTitle && (
            <div className="text-sm font-medium truncate">{prevTitle}</div>
          )}
        </div>
      </button>

      {/* Keyboard Hints */}
      <div className="hidden lg:flex gap-2 text-xs text-gray-600 font-mono shrink-0">
        <span className="bg-[#21262d] border border-[#30363d] px-1.5 py-0.5 rounded">
          ←
        </span>
        <span>to navigate</span>
        <span className="bg-[#21262d] border border-[#30363d] px-1.5 py-0.5 rounded">
          →
        </span>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext && !isCompleted}
        className={`group flex items-center justify-end gap-3 px-5 py-3 rounded-lg border transition-all w-[240px] shrink-0 ${
          canGoNext
            ? "bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-900/20"
            : isCompleted
            ? "bg-green-600 hover:bg-green-500 border-green-500 text-white"
            : "border-[#30363d] text-gray-600 cursor-not-allowed opacity-50"
        }`}
      >
        <div className="text-right min-w-0 flex-1">
          <div className="text-xs text-blue-100/70 uppercase font-semibold tracking-wider mb-0.5">
            {isCompleted ? "Finish" : "Next Step"}
          </div>
          {canGoNext && nextTitle && (
            <div className="text-sm font-bold truncate">{nextTitle}</div>
          )}
        </div>
        {isCompleted ? (
          <CheckIcon size={20} weight="bold" />
        ) : (
          <ArrowRightIcon size={20} weight="bold" />
        )}
      </button>
    </div>
  );
}

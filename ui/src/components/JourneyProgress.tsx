import { motion } from "framer-motion";
import { CheckCircleIcon, RocketLaunchIcon } from "@phosphor-icons/react";

interface JourneyProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  title: string;
}

export default function JourneyProgress({
  currentStep,
  totalSteps,
  completedSteps,
  title,
}: JourneyProgressProps) {
  const progressPercentage = Math.min(100, (completedSteps / totalSteps) * 100);

  return (
    <div className="flex items-center gap-6 w-full max-w-3xl">
      {/* Title & Status */}
      <div className="flex flex-col min-w-[200px]">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
          <RocketLaunchIcon size={14} weight="fill" />
          <span>Onboarding Journey</span>
        </div>
        <h2
          className="text-sm font-semibold text-[#e6edf3] truncate"
          title={title}
        >
          {title}
        </h2>
      </div>

      {/* Progress Bar Container */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-mono">
            Step <span className="text-[#e6edf3]">{currentStep + 1}</span> of{" "}
            {totalSteps}
          </span>
          <span className="font-medium text-blue-400">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>

        {/* Visual Bar */}
        <div className="h-2 w-full bg-[#21262d] rounded-full overflow-hidden relative">
          {/* Background Track Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 5px, #30363d 5px, #30363d 10px)",
            }}
          />

          {/* Active Progress */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 relative z-10"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* Completion Badge */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#21262d] border border-[#30363d] shrink-0">
        {completedSteps === totalSteps ? (
          <CheckCircleIcon size={20} className="text-green-500" weight="fill" />
        ) : (
          <div className="relative">
            <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#30363d]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-blue-500 transition-all duration-500 ease-out"
                strokeDasharray={`${progressPercentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

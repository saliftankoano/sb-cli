import { useSession } from "@/hooks/useSession";
import { useProgress } from "@/hooks/useProgress";
import {
  RocketLaunchIcon,
  ListIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";

interface ContentHeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function ContentHeader({
  onToggleSidebar,
  sidebarOpen,
}: ContentHeaderProps) {
  const { session } = useSession();
  const { progress, progressPercentage, resetProgress } = useProgress();
  if (!session) return null;

  return (
    <div className="mb-8 flex items-start gap-4">
      {onToggleSidebar && !sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="mt-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
          title="Open Sidebar"
        >
          <ListIcon size={24} />
        </button>
      )}
      <div className="flex-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4">
          <RocketLaunchIcon size={12} weight="fill" />
          Visual Onboarding
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome{session.userName ? `, ${session.userName}` : ""}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-3">
          Goal: {session.goal} • {session.experienceLevel} level •{" "}
          {session.selectedFiles.length} file(s) selected
        </p>
        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Onboarding Progress</span>
            <div className="flex items-center gap-2">
              <span>
                {progress.completedSteps}/{progress.totalSteps} steps
              </span>
              {progress.completedSteps > 0 && (
                <button
                  onClick={resetProgress}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Reset progress"
                >
                  <ArrowCounterClockwiseIcon size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

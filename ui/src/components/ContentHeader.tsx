import { useSession } from "@/hooks/useSession";
import { RocketLaunch, List } from "@phosphor-icons/react";

interface ContentHeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function ContentHeader({
  onToggleSidebar,
  sidebarOpen,
}: ContentHeaderProps) {
  const { session } = useSession();
  if (!session) return null;

  return (
    <div className="mb-8 flex items-start gap-4">
      {onToggleSidebar && !sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="mt-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
          title="Open Sidebar"
        >
          <List size={24} />
        </button>
      )}
      <div className="flex-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4">
          <RocketLaunch size={12} weight="fill" />
          Visual Onboarding
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome{session.userName ? `, ${session.userName}` : ""}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Goal: {session.goal} • {session.experienceLevel} level •{" "}
          {session.selectedFiles.length} file(s) selected
        </p>
      </div>
    </div>
  );
}

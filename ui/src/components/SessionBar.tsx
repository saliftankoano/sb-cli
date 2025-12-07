import { useSession } from "@/hooks/useSession";

export default function SessionBar() {
  const { session, loading } = useSession();

  if (loading || !session) {
    return null;
  }

  return (
    <div className="bg-blue-600 dark:bg-blue-800 text-white px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between pr-40">
        <div>
          <h2 className="text-lg font-semibold">
            Welcome{session.userName ? `, ${session.userName}` : ""}!
          </h2>
          <p className="text-sm opacity-90">
            Goal: {session.goal} • {session.experienceLevel} level
            {session.timebox && ` • ${session.timebox} available`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm opacity-75">
            {session.selectedFiles.length} file(s) selected
          </div>
        </div>
      </div>
    </div>
  );
}

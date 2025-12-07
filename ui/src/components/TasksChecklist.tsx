import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import Celebration from "./animations/Celebration";

export default function TasksChecklist() {
  const { session } = useSession();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("sb-completed-tasks");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "sb-completed-tasks",
      JSON.stringify([...completedTasks])
    );
  }, [completedTasks]);

  if (!session?.suggestedTasks || session.suggestedTasks.length === 0) {
    return null;
  }

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 100);
    }
    setCompletedTasks(newCompleted);
  };

  return (
    <>
      <Celebration trigger={celebrate} />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Onboarding Tasks
        </h2>
        <div className="space-y-3">
          {session.suggestedTasks.map((task, index) => {
            const taskId = `task-${index}`;
            const isCompleted = completedTasks.has(taskId);

            return (
              <div
                key={taskId}
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleTask(taskId)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        task.level === "beginner"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : task.level === "intermediate"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {task.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {task.description}
                  </p>
                  {task.files.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Files: {task.files.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

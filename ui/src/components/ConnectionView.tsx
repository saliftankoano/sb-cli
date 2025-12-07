import { useKnowledge } from "@/hooks/useKnowledge";
import { ArrowLeft } from "@phosphor-icons/react";

interface ConnectionViewProps {
  file: string;
  onBack: () => void;
}

export default function ConnectionView({ file, onBack }: ConnectionViewProps) {
  const { knowledge } = useKnowledge();
  const fileKnowledge = knowledge.find((k) => k.sourceFile === file);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          How {file} connects
        </h1>
      </div>

      {/* Simple Connection Diagram */}
      <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Everything flows through {file}:
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Request
              </div>
              <div className="text-gray-400">→</div>
            </div>

            <div className="px-6 py-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-lg">
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                {file}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                (you are here)
              </div>
            </div>

            <div className="text-gray-400">↓</div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                lib/jwt.ts
              </div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                lib/session.ts
              </div>
            </div>
          </div>
        </div>

        {fileKnowledge?.content.dependencies && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Dependencies
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {fileKnowledge.content.dependencies}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onBack}
        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        Back to file
      </button>
    </div>
  );
}





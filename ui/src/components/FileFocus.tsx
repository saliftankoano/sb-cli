import { useState } from "react";
import { useKnowledge } from "@/hooks/useKnowledge";
import { useJourney } from "@/hooks/useJourney";
import {
  FileText,
  CaretDown,
  CaretRight,
  CheckCircle,
  Question,
  Link,
} from "@phosphor-icons/react";

interface FileFocusProps {
  file: string;
}

export default function FileFocus({ file }: FileFocusProps) {
  const { knowledge } = useKnowledge();
  const journey = useJourney();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["purpose"])
  );

  const fileKnowledge = knowledge.find((k) => k.sourceFile === file);

  if (!fileKnowledge) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No knowledge available for {file}
        </p>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* File Header */}
      <header className="space-y-2 mb-8">
        <div className="flex items-center gap-3">
          <FileText size={32} className="text-blue-500" weight="duotone" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {file}
          </h1>
        </div>
      </header>

      {/* Mental Model / Purpose */}
      {fileKnowledge.content.purpose && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🧠 Mental Model
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {fileKnowledge.content.purpose}
          </p>
        </div>
      )}

      {/* Expandable Sections */}
      <div className="space-y-4">
        {fileKnowledge.content.gotchas && (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("gotchas")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-red-500">⚠️</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Gotchas
                </span>
              </div>
              {expandedSections.has("gotchas") ? (
                <CaretDown size={20} className="text-gray-400" />
              ) : (
                <CaretRight size={20} className="text-gray-400" />
              )}
            </button>
            {expandedSections.has("gotchas") && (
              <div className="px-6 pb-4">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {fileKnowledge.content.gotchas}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {fileKnowledge.content.dependencies && (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("dependencies")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-500">🔗</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Dependencies
                </span>
              </div>
              {expandedSections.has("dependencies") ? (
                <CaretDown size={20} className="text-gray-400" />
              ) : (
                <CaretRight size={20} className="text-gray-400" />
              )}
            </button>
            {expandedSections.has("dependencies") && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {fileKnowledge.content.dependencies}
                </p>
              </div>
            )}
          </div>
        )}

        {fileKnowledge.content.architecture && (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("architecture")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-indigo-500">🏗️</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Architecture
                </span>
              </div>
              {expandedSections.has("architecture") ? (
                <CaretDown size={20} className="text-gray-400" />
              ) : (
                <CaretRight size={20} className="text-gray-400" />
              )}
            </button>
            {expandedSections.has("architecture") && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {fileKnowledge.content.architecture}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={journey.markCurrentComplete}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <CheckCircle size={20} weight="fill" />
          I understand, next →
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => {
              journey.setViewState({ type: "question", file, question: "" });
            }}
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Question size={18} />
            I have a question
          </button>
          <button
            onClick={() => {
              journey.setViewState({ type: "connections", file });
            }}
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Link size={18} />
            How does this connect?
          </button>
        </div>
      </div>
    </div>
  );
}


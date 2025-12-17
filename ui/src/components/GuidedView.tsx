import { useState, useEffect, useMemo } from "react";
import { useKnowledge } from "@/hooks/useKnowledge";
import { fetchFileContent, type FileContentLine } from "@/lib/api";
import { Highlight, themes } from "prism-react-renderer";
import {
  FileCodeIcon,
  BrainIcon,
  WarningIcon,
  GitBranchIcon,
  LightbulbIcon,
  CaretDownIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

// Map file extensions to Prism language names (TypeScript, JavaScript, Python only)
function getLanguageFromFile(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    mjs: "javascript",
    cjs: "javascript",
    py: "python",
    json: "json",
  };
  return languageMap[ext || ""] || "typescript";
}

export interface GuidedViewState {
  file: string;
  title: string;
  explanation: string;
  startLine?: number;
  endLine?: number;
  highlightLines?: number[];
  featureName?: string;
}

interface GuidedViewProps {
  state: GuidedViewState;
}

export default function GuidedView({ state }: GuidedViewProps) {
  const { knowledge } = useKnowledge();
  const [codeLines, setCodeLines] = useState<FileContentLine[]>([]);
  const [codeLoading, setCodeLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["code"])
  );

  const fileKnowledge = knowledge.find(
    (k) => k.sourceFile === state.file || state.file.endsWith(k.sourceFile)
  );

  // Fetch code when file or line range changes
  useEffect(() => {
    if (state.startLine && state.endLine) {
      setCodeLoading(true);
      fetchFileContent(state.file, state.startLine, state.endLine)
        .then((data) => {
          setCodeLines(data.lines);
          setCodeLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch code:", err);
          setCodeLoading(false);
        });
    } else {
      setCodeLines([]);
    }
  }, [state.file, state.startLine, state.endLine]);

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

  const isHighlighted = (lineNum: number) =>
    state.highlightLines?.includes(lineNum) ?? false;

  // Combine code lines into a single string for syntax highlighting
  const codeString = useMemo(() => {
    return codeLines.map((line) => line.content).join("\n");
  }, [codeLines]);

  const language = useMemo(() => getLanguageFromFile(state.file), [state.file]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <FileCodeIcon
            size={28}
            className="text-blue-600 dark:text-blue-400"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {state.title}
            </h1>
            {state.featureName && (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                {state.featureName}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {state.file}
          </p>
        </div>
      </div>

      {/* Agent Explanation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <LightbulbIcon
            size={20}
            weight="fill"
            className="text-amber-500 mt-0.5 flex-shrink-0"
          />
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {state.explanation}
          </p>
        </div>
      </div>

      {/* Code Excerpt with Syntax Highlighting */}
      {(state.startLine || codeLines.length > 0) && (
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-800">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
            <span className="text-sm font-medium text-gray-300">
              Lines {state.startLine}-{state.endLine}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {state.file.split("/").pop()}
            </span>
          </div>
          <div className="overflow-x-auto">
            {codeLoading ? (
              <div className="p-4 text-gray-400 animate-pulse">
                Loading code...
              </div>
            ) : (
              <Highlight
                theme={themes.vsDark}
                code={codeString}
                language={language}
              >
                {({ style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    style={{ ...style, margin: 0, padding: "1rem" }}
                    className="text-sm"
                  >
                    {tokens.map((line, i) => {
                      const lineNumber = (state.startLine || 1) + i;
                      const highlighted = isHighlighted(lineNumber);
                      return (
                        <div
                          key={i}
                          {...getLineProps({ line })}
                          className={`flex ${
                            highlighted
                              ? "bg-yellow-500/20 -mx-4 px-4 border-l-2 border-yellow-400"
                              : ""
                          }`}
                        >
                          <span className="w-12 text-gray-500 text-right pr-4 select-none flex-shrink-0 text-xs leading-6">
                            {lineNumber}
                          </span>
                          <span className="leading-6">
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token })} />
                            ))}
                          </span>
                        </div>
                      );
                    })}
                  </pre>
                )}
              </Highlight>
            )}
          </div>
        </div>
      )}

      {/* Knowledge Sections */}
      {fileKnowledge && (
        <div className="space-y-3">
          {/* Purpose */}
          {fileKnowledge.content.purpose && (
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("purpose")}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BrainIcon size={18} className="text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Purpose
                  </span>
                </div>
                {expandedSections.has("purpose") ? (
                  <CaretDownIcon size={16} className="text-gray-400" />
                ) : (
                  <CaretRightIcon size={16} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("purpose") && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {fileKnowledge.content.purpose}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Gotchas */}
          {fileKnowledge.content.gotchas && (
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("gotchas")}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <WarningIcon size={18} className="text-amber-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Gotchas
                  </span>
                </div>
                {expandedSections.has("gotchas") ? (
                  <CaretDownIcon size={16} className="text-gray-400" />
                ) : (
                  <CaretRightIcon size={16} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("gotchas") && (
                <div className="px-5 pb-4">
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {fileKnowledge.content.gotchas}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dependencies */}
          {fileKnowledge.content.dependencies && (
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("dependencies")}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GitBranchIcon size={18} className="text-purple-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Dependencies
                  </span>
                </div>
                {expandedSections.has("dependencies") ? (
                  <CaretDownIcon size={16} className="text-gray-400" />
                ) : (
                  <CaretRightIcon size={16} className="text-gray-400" />
                )}
              </button>
              {expandedSections.has("dependencies") && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {fileKnowledge.content.dependencies}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No knowledge fallback */}
      {!fileKnowledge && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No additional knowledge available for this file yet.</p>
        </div>
      )}
    </div>
  );
}

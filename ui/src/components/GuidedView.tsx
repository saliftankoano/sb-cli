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
  ArrowsInLineHorizontalIcon,
  ArrowsOutLineHorizontalIcon,
  BookOpenIcon,
  CodeIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "./MarkdownRenderer";

// Map file extensions to Prism language names
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
    css: "css",
    md: "markdown",
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
  defaultCollapsed?: boolean;
}

export default function GuidedView({
  state,
  defaultCollapsed = false,
}: GuidedViewProps) {
  const { knowledge } = useKnowledge();
  const [codeLines, setCodeLines] = useState<FileContentLine[]>([]);
  const [codeLoading, setCodeLoading] = useState(false);
  const [isKnowledgeCollapsed, setIsKnowledgeCollapsed] =
    useState(defaultCollapsed);
  const [viewMode, setViewMode] = useState<"source" | "knowledge">("source");

  // Reset collapse state when defaultCollapsed changes or state.file changes (new file)
  useEffect(() => {
    setIsKnowledgeCollapsed(defaultCollapsed);
  }, [defaultCollapsed, state.file]);

  const fileKnowledge = knowledge.find(
    (k) => k.sourceFile === state.file || state.file.endsWith(k.sourceFile)
  );

  // Fetch code when file or line range changes
  useEffect(() => {
    // If we're exploring, fetch a large chunk or the whole file
    // For now, let's fetch first 500 lines to allow "full exploration"
    const start = state.startLine || 1;
    const end = state.endLine || 500;

    setCodeLoading(true);
    fetchFileContent(state.file, start, end)
      .then((data) => {
        setCodeLines(data.lines);
        setCodeLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch code:", err);
        setCodeLoading(false);
      });
  }, [state.file, state.startLine, state.endLine]);

  const isHighlighted = (lineNum: number) =>
    state.highlightLines?.includes(lineNum) ?? false;

  // Combine code lines into a single string for syntax highlighting
  const codeString = useMemo(() => {
    return codeLines.map((line) => line.content).join("\n");
  }, [codeLines]);

  const language = useMemo(() => getLanguageFromFile(state.file), [state.file]);

  return (
    <div className="h-full min-h-[400px] lg:min-h-[600px] flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* LEFT PANE: Content View (Source or Knowledge) */}
      <div
        className={`flex-1 flex flex-col bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
          isKnowledgeCollapsed ? "lg:flex-[5]" : "lg:flex-[2.5]"
        }`}
      >
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 overflow-hidden">
              {viewMode === "source" ? (
                <FileCodeIcon size={18} className="text-blue-400 shrink-0" />
              ) : (
                <BookOpenIcon size={18} className="text-purple-400 shrink-0" />
              )}
              <span className="text-sm font-semibold text-[#e6edf3] truncate max-w-[200px]">
                {state.file.split("/").pop()}
              </span>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center bg-[#21262d] p-0.5 rounded-lg border border-[#30363d]">
              <button
                onClick={() => setViewMode("source")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === "source"
                    ? "bg-[#30363d] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <CodeIcon size={14} />
                Source
              </button>
              <button
                onClick={() => setViewMode("knowledge")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === "knowledge"
                    ? "bg-[#30363d] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                disabled={!fileKnowledge}
              >
                <BookOpenIcon size={14} />
                Knowledge
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state.featureName && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                {state.featureName}
              </span>
            )}
            <button
              onClick={() => setIsKnowledgeCollapsed(!isKnowledgeCollapsed)}
              className="p-1.5 hover:bg-[#21262d] rounded text-gray-400 hover:text-white transition-colors lg:block hidden ml-2"
              title={isKnowledgeCollapsed ? "Show Insights" : "Expand View"}
            >
              {isKnowledgeCollapsed ? (
                <ArrowsInLineHorizontalIcon size={18} />
              ) : (
                <ArrowsOutLineHorizontalIcon size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto bg-[#0d1117] relative scroll-smooth custom-scrollbar">
          {viewMode === "source" ? (
            codeLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-sm font-mono tracking-tight">
                  Loading source...
                </span>
              </div>
            ) : (
              <Highlight
                theme={themes.vsDark}
                code={codeString}
                language={language}
              >
                {({ style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    style={{
                      ...style,
                      margin: 0,
                      padding: "1.5rem",
                      background: "transparent",
                      overflow: "hidden",
                    }}
                    className="text-[13px] leading-6 font-mono"
                  >
                    {tokens.map((line, i) => {
                      const lineNumber = (state.startLine || 1) + i;
                      const highlighted = isHighlighted(lineNumber);
                      return (
                        <div
                          key={i}
                          {...getLineProps({ line })}
                          className={`flex group ${
                            highlighted
                              ? "bg-blue-500/10 -mx-6 px-6 border-l-2 border-blue-500"
                              : "hover:bg-[#1f2428] -mx-6 px-6 border-l-2 border-transparent"
                          }`}
                        >
                          <span
                            className={`w-10 text-right pr-6 select-none flex-shrink-0 text-xs opacity-20 group-hover:opacity-40 transition-opacity ${
                              highlighted
                                ? "text-blue-400 opacity-100 font-bold"
                                : ""
                            }`}
                          >
                            {lineNumber}
                          </span>
                          <span className="table-cell">
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
            )
          ) : (
            <div className="p-8 max-w-4xl mx-auto prose prose-invert prose-blue prose-sm prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-[#30363d]">
              {fileKnowledge ? (
                <MarkdownRenderer content={fileKnowledge.content.raw} />
              ) : (
                <div className="text-center py-20 opacity-50">
                  No knowledge file found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Insights View */}
      <AnimatePresence>
        {!isKnowledgeCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="lg:flex-[1.5] flex flex-col gap-6 overflow-y-auto min-w-[450px] custom-scrollbar"
          >
            {/* AI Insight Card */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-5 relative overflow-hidden group shadow-xl">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <LightbulbIcon size={120} weight="fill" />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-2.5 bg-blue-500/20 rounded-xl shrink-0 shadow-inner">
                  <LightbulbIcon
                    size={22}
                    className="text-blue-400"
                    weight="fill"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                    AI Insight
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  </h3>
                </div>
              </div>
            </div>

            {/* Quick Access Sections */}
            {fileKnowledge ? (
              <div className="space-y-4">
                {/* Purpose */}
                {fileKnowledge.content.purpose && (
                  <div
                    className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-gray-600 transition-colors cursor-pointer group"
                    onClick={() => setViewMode("knowledge")}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#e6edf3]">
                        <BrainIcon
                          size={18}
                          className="text-green-400"
                          weight="duotone"
                        />
                        <h3 className="font-semibold text-sm">Purpose</h3>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        View Full Docs →
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-400 leading-relaxed">
                      {fileKnowledge.content.purpose}
                    </p>
                  </div>
                )}

                {/* Gotchas */}
                {fileKnowledge.content.gotchas && (
                  <div
                    className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 relative overflow-hidden hover:border-gray-600 transition-colors cursor-pointer group"
                    onClick={() => setViewMode("knowledge")}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500/50" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#e6edf3]">
                        <WarningIcon
                          size={18}
                          className="text-orange-400"
                          weight="duotone"
                        />
                        <h3 className="font-semibold text-sm">
                          Gotchas & Warnings
                        </h3>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        View Full Docs →
                      </span>
                    </div>
                    <div className="bg-orange-950/10 rounded-lg p-3 border border-orange-900/20">
                      <p className="text-[13px] text-orange-200/70 leading-relaxed">
                        {fileKnowledge.content.gotchas}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {fileKnowledge.content.dependencies && (
                  <div
                    className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-gray-600 transition-colors cursor-pointer group"
                    onClick={() => setViewMode("knowledge")}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#e6edf3]">
                        <GitBranchIcon
                          size={18}
                          className="text-purple-400"
                          weight="duotone"
                        />
                        <h3 className="font-semibold text-sm">Dependencies</h3>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        View Full Docs →
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-400 leading-relaxed font-mono text-xs truncate">
                      {fileKnowledge.content.dependencies}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 border border-dashed border-[#30363d] rounded-2xl bg-[#0d1117]/50">
                <BrainIcon size={40} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">
                  No knowledge graph data found
                </p>
                <p className="text-xs opacity-40 mt-1">
                  Ask the AI to analyze this file
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

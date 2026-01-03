import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  CommandIcon,
  FileCodeIcon,
  HashIcon,
  ArrowRightIcon,
  CornersOutIcon,
} from "@phosphor-icons/react";

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  files: string[]; // List of searchable files
  onSelect: (file: string) => void;
}

export default function CommandBar({
  isOpen,
  onClose,
  files,
  onSelect,
}: CommandBarProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter files based on query
  const filteredFiles = files
    .filter((file) => file.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8); // Limit results

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredFiles.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredFiles[selectedIndex]) {
          onSelect(filteredFiles[selectedIndex]);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredFiles, selectedIndex, onSelect, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 h-14 border-b border-[#30363d]">
              <MagnifyingGlassIcon size={20} className="text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files, features, or commands..."
                className="flex-1 bg-transparent border-none outline-none text-[#e6edf3] placeholder-gray-500 h-full text-base"
              />
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="bg-[#21262d] border border-[#30363d] rounded px-1.5 py-0.5">
                  Esc
                </span>
                <span>to close</span>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {filteredFiles.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                <div className="px-2 space-y-0.5">
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Files
                  </div>
                  {filteredFiles.map((file, index) => {
                    const isSelected = index === selectedIndex;
                    const fileName = file.split("/").pop() || file;
                    const path = file.split("/").slice(0, -1).join("/");

                    return (
                      <button
                        key={file}
                        onClick={() => {
                          onSelect(file);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors ${
                          isSelected
                            ? "bg-[#1f6feb]/15 text-blue-400"
                            : "text-[#e6edf3] hover:bg-[#21262d]"
                        }`}
                      >
                        <FileCodeIcon
                          size={18}
                          className={`mr-3 ${
                            isSelected ? "text-blue-400" : "text-gray-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {fileName}
                            </span>
                            {path && (
                              <span
                                className={`text-xs truncate ${
                                  isSelected
                                    ? "text-blue-400/60"
                                    : "text-gray-500"
                                }`}
                              >
                                {path}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <ArrowRightIcon
                            size={16}
                            className="ml-2 text-blue-400 opacity-50"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <CornersOutIcon size={14} />
                  <span>Open in Editor</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <HashIcon size={14} />
                  <span>Copy Path</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CommandIcon size={14} />
                <span>+ K</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

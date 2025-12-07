import { useEffect } from "react";
import { fetchFeatures, fetchOnboardingDocs, type Feature } from "@/lib/api";
import { useState, useMemo } from "react";
import {
  XIcon,
  CaretRightIcon,
  CaretDownIcon,
  BookIcon,
  CubeIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

interface FileSidebarProps {
  open: boolean;
  onClose: () => void;
  onFeatureSelect: (featureId: string) => void;
  onDocSelect: (docId: string) => void;
  selectedId?: string;
}

export default function FileSidebar({
  open,
  onClose,
  onFeatureSelect,
  onDocSelect,
  selectedId,
}: FileSidebarProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [docs, setDocs] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    docs: true,
    features: true,
  });

  useEffect(() => {
    fetchFeatures().then((data) => setFeatures(data.features));
    fetchOnboardingDocs().then(setDocs);
  }, []);

  const featuresByCategory = useMemo(() => {
    const groups: Record<string, Feature[]> = {};
    features.forEach((f) => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [features]);

  // Initialize category expansion
  useEffect(() => {
    if (Object.keys(featuresByCategory).length > 0) {
      setExpanded((prev) => {
        const next = { ...prev };
        Object.keys(featuresByCategory).forEach((cat) => {
          if (next[cat] === undefined) next[cat] = true; // Expand categories by default
        });
        return next;
      });
    }
  }, [featuresByCategory]);

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSelected = (id: string) => selectedId === id;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 overflow-hidden lg:relative lg:z-auto flex flex-col"
          >
            <div className="p-4 flex-1 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Explorer
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors lg:hidden"
                >
                  <XIcon
                    size={20}
                    className="text-gray-600 dark:text-gray-400"
                  />
                </button>
              </div>

              <div className="space-y-4">
                {/* Onboarding Docs Section */}
                <div>
                  <button
                    onClick={() => toggle("docs")}
                    className="flex items-center gap-2 w-full text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-2"
                  >
                    {expanded["docs"] ? (
                      <CaretDownIcon size={16} />
                    ) : (
                      <CaretRightIcon size={16} />
                    )}
                    <BookIcon size={18} className="text-blue-500" />
                    Onboarding Docs
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded["docs"] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-2 border-l border-gray-200 dark:border-gray-800 pl-3 space-y-1"
                      >
                        {docs.map((doc) => (
                          <button
                            key={doc}
                            onClick={() => {
                              onDocSelect(doc);
                              if (window.innerWidth < 1024) onClose();
                            }}
                            className={`block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors truncate ${
                              isSelected(doc)
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            {doc.replace(".md", "")}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* System Features Section */}
                <div>
                  <button
                    onClick={() => toggle("features")}
                    className="flex items-center gap-2 w-full text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-2"
                  >
                    {expanded["features"] ? (
                      <CaretDownIcon size={16} />
                    ) : (
                      <CaretRightIcon size={16} />
                    )}
                    <CubeIcon size={18} className="text-blue-500" />
                    System Features
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded["features"] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-2 border-l border-gray-200 dark:border-gray-800 pl-3 space-y-4 mt-2"
                      >
                        {Object.entries(featuresByCategory).map(
                          ([category, categoryFeatures]) => (
                            <div key={category}>
                              <button
                                onClick={() => toggle(category)}
                                className="flex items-center gap-2 w-full text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 mb-1"
                              >
                                {expanded[category] ? (
                                  <CaretDownIcon size={12} />
                                ) : (
                                  <CaretRightIcon size={12} />
                                )}
                                {category}
                              </button>

                              <AnimatePresence initial={false}>
                                {expanded[category] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden ml-2 pl-2 space-y-0.5"
                                  >
                                    {categoryFeatures.map((feature) => (
                                      <button
                                        key={feature.id}
                                        onClick={() => {
                                          onFeatureSelect(feature.id);
                                          if (window.innerWidth < 1024)
                                            onClose();
                                        }}
                                        className={`block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors truncate ${
                                          isSelected(feature.id)
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                      >
                                        {feature.name}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <ThemeToggle />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

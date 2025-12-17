import { useState, useEffect } from "react";
import { fetchOnboardingDoc } from "../lib/api";
import { motion } from "framer-motion";
import MarkdownRenderer from "./MarkdownRenderer";
import IndexView from "./IndexView";

interface OnboardingDocsViewProps {
  docId?: string;
  onNavigate?: (docId: string) => void;
}

export default function OnboardingDocsView({
  docId,
  onNavigate,
}: OnboardingDocsViewProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (docId) {
      setLoading(true);
      fetchOnboardingDoc(docId).then((content) => {
        setContent(content);
        setLoading(false);
      });
    } else {
      setContent("");
    }
  }, [docId]);

  if (!docId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Select a document to view.</p>
      </div>
    );
  }

  // Use custom IndexView for INDEX.md
  if (docId === "INDEX.md") {
    return (
      <div className="h-full overflow-y-auto pr-4">
        <IndexView content={content} onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 overflow-y-auto shadow-sm">
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MarkdownRenderer content={content} />
        </motion.div>
      )}
    </div>
  );
}

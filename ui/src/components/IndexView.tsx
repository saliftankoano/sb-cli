import { useState, useEffect } from "react";
import { fetchOnboardingDoc } from "../lib/api";
import { useProgress } from "../hooks/useProgress";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  FileText,
  TreeStructure,
  BookOpen,
  ListChecks,
} from "@phosphor-icons/react";
import MarkdownRenderer from "./MarkdownRenderer";

interface IndexViewProps {
  content?: string;
  onNavigate?: (docId: string) => void;
}

const STEPS = [
  { id: "SETUP", label: "Setup", icon: FileText },
  { id: "ARCHITECTURE", label: "Architecture", icon: TreeStructure },
  { id: "RESOURCES", label: "Resources", icon: BookOpen },
  { id: "TASKS", label: "Tasks", icon: ListChecks },
];

export default function IndexView({
  content: providedContent,
  onNavigate,
}: IndexViewProps) {
  const [content, setContent] = useState<string>(providedContent || "");
  const [loading, setLoading] = useState(!providedContent);
  const { progress, markDocViewed } = useProgress();

  useEffect(() => {
    if (!providedContent) {
      setLoading(true);
      fetchOnboardingDoc("INDEX.md")
        .then((docContent) => {
          setContent(docContent);
          setLoading(false);
          markDocViewed("INDEX.md");
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      markDocViewed("INDEX.md");
    }
  }, [providedContent, markDocViewed]);

  const handleStepClick = (stepId: string) => {
    // Just navigate, don't auto-complete
    if (onNavigate) {
      onNavigate(`${stepId}.md`);
    }
  };

  const handleBeginOnboarding = () => {
    // Navigate to SETUP without marking complete
    if (onNavigate) {
      onNavigate("SETUP.md");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
      </div>
    );
  }

  // Parse content to extract sections
  const sections = {
    welcome:
      content.match(/# Welcome to .+?\n\n([\s\S]*?)(?=\n##|$)/)?.[1] || "",
    quickStats:
      content.match(/## Quick Stats\n\n([\s\S]*?)(?=\n##|$)/)?.[1] || "",
    onboardingPath:
      content.match(/## Onboarding Path\n\n([\s\S]*?)(?=\n##|$)/)?.[1] || "",
    quickStart:
      content.match(/## Quick Start\n\n([\s\S]*?)(?=\n##|$)/)?.[1] || "",
    recommendedFeatures:
      content.match(
        /### Recommended Features[\s\S]*?\n\n([\s\S]*?)(?=\n##|$)/
      )?.[1] || "",
  };

  return (
    <div className="space-y-8">
      {/* Stepper Component */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Onboarding Path
        </h2>
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = progress.completedSteps > index;
            const isCurrent = progress.completedSteps === index;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => handleStepClick(step.id)}
                  className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle size={24} weight="fill" />
                    ) : (
                      <StepIcon
                        size={24}
                        weight={isCurrent ? "fill" : "regular"}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isCompleted || isCurrent
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      isCompleted
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Welcome Section */}
      {sections.welcome && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm"
        >
          <MarkdownRenderer content={sections.welcome} />
        </motion.div>
      )}

      {/* Quick Stats - Make clickable */}
      {sections.quickStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Quick Stats
          </h2>
          <MarkdownRenderer content={sections.quickStats} />
        </motion.div>
      )}

      {/* Begin Onboarding CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Start?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Begin your onboarding journey and explore the codebase step by
              step.
            </p>
          </div>
          <button
            onClick={handleBeginOnboarding}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Begin Onboarding
            <ArrowRight size={20} weight="bold" />
          </button>
        </div>
      </motion.div>

      {/* Recommended Features */}
      {sections.recommendedFeatures && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Recommended Features
          </h2>
          <MarkdownRenderer content={sections.recommendedFeatures} />
        </motion.div>
      )}
    </div>
  );
}

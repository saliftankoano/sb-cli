import { useState, useEffect, useCallback } from "react";
import { useSession } from "./useSession";
import type { UICommand } from "@/lib/commands";

export type ViewState =
  | { type: "journey" }
  | { type: "focus"; file: string }
  | { type: "question"; file: string; question: string }
  | { type: "connections"; file: string }
  | { type: "explore" }
  | { type: "features" }
  | { type: "feature-details"; featureId: string }
  | { type: "onboarding-docs"; docId?: string };

export interface JourneyStep {
  file: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: "pending" | "current" | "completed";
}

export function useJourney(onCommand?: (command: UICommand) => void) {
  const { session } = useSession();
  const [viewState, setViewState] = useState<ViewState>({ type: "journey" });
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set());

  // Build journey steps from session
  const journeySteps: JourneyStep[] =
    session?.selectedFiles.map((file, index) => ({
      file,
      title: file.split("/").pop() || file,
      description: `Learn about ${file}`,
      estimatedMinutes: 15,
      status:
        index < currentFileIndex
          ? "completed"
          : index === currentFileIndex
          ? "current"
          : "pending",
    })) || [];

  // Handle agent commands
  const handleAgentCommand = useCallback(
    (command: UICommand) => {
      onCommand?.(command);

      switch (command.type) {
        case "navigate":
          if (command.to === "next") {
            if (currentFileIndex < journeySteps.length - 1) {
              const nextIndex = currentFileIndex + 1;
              setCurrentFileIndex(nextIndex);
              setViewState({
                type: "focus",
                file: journeySteps[nextIndex].file,
              });
            }
          } else if (command.to === "previous") {
            if (currentFileIndex > 0) {
              const prevIndex = currentFileIndex - 1;
              setCurrentFileIndex(prevIndex);
              setViewState({
                type: "focus",
                file: journeySteps[prevIndex].file,
              });
            }
          } else {
            // Navigate to specific file
            const fileIndex = journeySteps.findIndex(
              (s) => s.file === command.to
            );
            if (fileIndex !== -1) {
              setCurrentFileIndex(fileIndex);
              setViewState({ type: "focus", file: command.to });
            }
          }
          break;

        case "showConnections":
          setViewState({ type: "connections", file: command.file });
          break;

        case "expandSection":
          // This will be handled by FileFocus component
          break;

        case "highlightCode":
          // This will be handled by FileFocus component
          break;

        case "openSidebar":
          setViewState({ type: "explore" });
          break;
      }
    },
    [currentFileIndex, journeySteps, onCommand]
  );

  // Navigate to a file
  const goToFile = useCallback(
    (file: string) => {
      const index = journeySteps.findIndex((s) => s.file === file);
      if (index !== -1) {
        setCurrentFileIndex(index);
        setViewState({ type: "focus", file });
      }
    },
    [journeySteps]
  );

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (currentFileIndex < journeySteps.length - 1) {
      const nextIndex = currentFileIndex + 1;
      setCurrentFileIndex(nextIndex);
      setViewState({
        type: "focus",
        file: journeySteps[nextIndex].file,
      });
    }
  }, [currentFileIndex, journeySteps]);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    if (currentFileIndex > 0) {
      const prevIndex = currentFileIndex - 1;
      setCurrentFileIndex(prevIndex);
      setViewState({
        type: "focus",
        file: journeySteps[prevIndex].file,
      });
    }
  }, [currentFileIndex, journeySteps]);

  // Mark current file as completed
  const markCurrentComplete = useCallback(() => {
    if (journeySteps[currentFileIndex]) {
      setCompletedFiles((prev) =>
        new Set(prev).add(journeySteps[currentFileIndex].file)
      );
      nextStep();
    }
  }, [currentFileIndex, journeySteps, nextStep]);

  // Initialize: if we have files, start with first one
  useEffect(() => {
    if (
      journeySteps.length > 0 &&
      viewState.type === "journey" &&
      currentFileIndex === 0
    ) {
      setViewState({
        type: "focus",
        file: journeySteps[0].file,
      });
    }
  }, [session, journeySteps.length]);

  return {
    session,
    journeySteps,
    currentFileIndex,
    currentFile: journeySteps[currentFileIndex]?.file,
    viewState,
    setViewState,
    handleAgentCommand,
    goToFile,
    nextStep,
    previousStep,
    markCurrentComplete,
    completedFiles,
  };
}

import { useState, useEffect, useCallback } from "react";

export interface Progress {
  viewedDocs: string[];
  exploredFeatures: string[];
  completedSteps: number;
  totalSteps: number;
}

const STORAGE_KEY = "startblock-onboarding-progress";

const DEFAULT_PROGRESS: Progress = {
  viewedDocs: [],
  exploredFeatures: [],
  completedSteps: 0,
  totalSteps: 4, // Setup, Architecture, Resources, Tasks
};

/**
 * Hook to track onboarding progress
 * Persists to localStorage
 */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    // Load from localStorage on init
    if (typeof window === "undefined") {
      return DEFAULT_PROGRESS;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load progress from localStorage:", error);
    }

    return DEFAULT_PROGRESS;
  });

  // Save to localStorage whenever progress changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.warn("Failed to save progress to localStorage:", error);
    }
  }, [progress]);

  const markDocViewed = useCallback((docId: string) => {
    setProgress((prev) => {
      if (prev.viewedDocs.includes(docId)) {
        return prev;
      }
      return {
        ...prev,
        viewedDocs: [...prev.viewedDocs, docId],
      };
    });
  }, []);

  const markFeatureExplored = useCallback((featureId: string) => {
    setProgress((prev) => {
      if (prev.exploredFeatures.includes(featureId)) {
        return prev;
      }
      return {
        ...prev,
        exploredFeatures: [...prev.exploredFeatures, featureId],
      };
    });
  }, []);

  const markStepCompleted = useCallback((step: number) => {
    setProgress((prev) => {
      if (prev.completedSteps >= step) {
        return prev;
      }
      return {
        ...prev,
        completedSteps: Math.max(prev.completedSteps, step),
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to clear progress from localStorage:", error);
      }
    }
  }, []);

  const progressPercentage = Math.round(
    (progress.completedSteps / progress.totalSteps) * 100
  );

  return {
    progress,
    markDocViewed,
    markFeatureExplored,
    markStepCompleted,
    resetProgress,
    progressPercentage,
  };
}

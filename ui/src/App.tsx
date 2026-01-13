import { useState, useEffect, useMemo } from "react";
import Layout from "./components/Layout";
import { useSession } from "./hooks/useSession";
import { useJourney } from "./hooks/useJourney";
import { fetchLiveKitToken, fetchOnboardingDocs } from "./lib/api";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import WelcomeScreen from "./components/WelcomeScreen";
import VoiceControlIsland from "./components/VoiceControlIsland";
import GuidedView, { type GuidedViewState } from "./components/GuidedView";
import SmartFileBrowser from "./components/SmartFileBrowser";
import JourneyProgress from "./components/JourneyProgress";
import StepNavigator from "./components/StepNavigator";
import CommandBar from "./components/CommandBar";
import { useAgentCommands } from "./hooks/useAgentCommands";

// Shared UI logic - extracted to avoid duplication
function useAppState() {
  const {
    journeySteps,
    currentFileIndex,
    viewState,
    setViewState,
    goToFile,
    nextStep,
    previousStep,
  } = useJourney();

  const [activeMode, setActiveMode] = useState<
    "journey" | "explore" | "knowledge"
  >("journey");
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);

  // Sync NavRail mode with internal view state
  useEffect(() => {
    if (viewState.type === "explore" || viewState.type === "features") {
      setActiveMode("explore");
    } else if (viewState.type === "onboarding-docs") {
      setActiveMode("knowledge");
    } else {
      setActiveMode("journey");
    }
  }, [viewState.type]);

  return {
    journeySteps,
    currentFileIndex,
    viewState,
    setViewState,
    goToFile,
    nextStep,
    previousStep,
    activeMode,
    setActiveMode,
    isCommandBarOpen,
    setIsCommandBarOpen,
  };
}

// Main content renderer - shared between LiveKit and Regular modes
function MainUI({
  guidedState,
  showVoiceControls = false,
  isAgentActive = false,
  onToggleAgent,
  isAgentReady = true,
}: {
  guidedState: GuidedViewState | null;
  showVoiceControls?: boolean;
  isAgentActive?: boolean;
  onToggleAgent?: () => void;
  isAgentReady?: boolean;
}) {
  const state = useAppState();
  const {
    journeySteps,
    currentFileIndex,
    viewState,
    setViewState,
    goToFile,
    nextStep,
    previousStep,
    activeMode,
    setActiveMode,
    isCommandBarOpen,
    setIsCommandBarOpen,
  } = state;

  const currentFile = journeySteps[currentFileIndex];

  // Merge agent-driven state with local state
  const viewState_: GuidedViewState | null = useMemo(() => {
    if (guidedState) return guidedState;

    // If we have an explicit focus file (from explorer or search)
    if (viewState.type === "focus" || viewState.type === "question") {
      const journeyStep = journeySteps.find((s) => s.file === viewState.file);
      return {
        file: viewState.file,
        title:
          journeyStep?.title ||
          viewState.file.split("/").pop() ||
          viewState.file,
        explanation:
          journeyStep?.description || "Exploring file content and knowledge.",
        featureName: journeyStep ? "Architecture" : "Exploration",
      };
    }

    // Default to journey step if in journey mode
    if (activeMode === "journey" && currentFile) {
      return {
        file: currentFile.file,
        title: currentFile.title,
        explanation: currentFile.description,
        featureName: "Architecture",
      };
    }

    return null;
  }, [guidedState, viewState, journeySteps, activeMode, currentFile]);

  const topBar =
    activeMode === "journey" ? (
      <div className="w-full flex items-center justify-between">
        <JourneyProgress
          currentStep={currentFileIndex}
          totalSteps={journeySteps.length}
          completedSteps={currentFileIndex + 1}
          title={currentFile?.title || "Welcome"}
        />
      </div>
    ) : null;

  const sidebarContent =
    activeMode === "explore" ? (
      <SmartFileBrowser
        selectedFile={viewState_?.file}
        onFileSelect={(path) => {
          const isInJourney = journeySteps.some((s) => s.file === path);
          if (isInJourney) {
            goToFile(path);
            setActiveMode("journey");
          } else {
            setViewState({ type: "focus", file: path });
          }
        }}
      />
    ) : null;

  const renderMainContent = () => {
    if (activeMode === "journey") {
      if (journeySteps.length === 0)
        return (
          <div className="flex-1 overflow-y-auto -m-4 lg:-m-6">
            <WelcomeScreen />
          </div>
        );

      return (
        <div className="flex-1 flex flex-col gap-4 h-full">
          <div className="flex-1 min-h-[400px] lg:min-h-[600px] overflow-hidden">
            {viewState_ && <GuidedView state={viewState_} />}
          </div>
          <div className="shrink-0">
            <StepNavigator
              onNext={nextStep}
              onPrev={previousStep}
              canGoNext={currentFileIndex < journeySteps.length - 1}
              canGoPrev={currentFileIndex > 0}
              nextTitle={journeySteps[currentFileIndex + 1]?.title}
              prevTitle={journeySteps[currentFileIndex - 1]?.title}
              isCompleted={currentFileIndex === journeySteps.length - 1}
            />
          </div>
        </div>
      );
    }

    if (activeMode === "explore") {
      if (viewState.type === "focus" || viewState.type === "feature-details") {
        return (
          <div className="flex-1 flex flex-col h-full">
            {viewState_ ? (
              <div className="flex-1 min-h-[400px] lg:min-h-[600px] overflow-hidden">
                <GuidedView state={viewState_} defaultCollapsed={true} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a file to view
              </div>
            )}
          </div>
        );
      }
      return (
        <div className="flex-1 flex items-center justify-center h-full text-gray-500">
          <p>Select a file from the explorer to view details</p>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto">
        <div>Knowledge Mode (Coming Soon)</div>
      </div>
    );
  };

  return (
    <>
      <Layout
        activeMode={activeMode}
        onModeChange={(mode) => {
          setActiveMode(mode);
          if (mode === "journey") setViewState({ type: "journey" });
          if (mode === "explore") setViewState({ type: "explore" });
        }}
        onSearchClick={() => setIsCommandBarOpen(true)}
        sidebarContent={sidebarContent}
        topBar={topBar}
      >
        {renderMainContent()}
      </Layout>

      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        files={journeySteps.map((s) => s.file)}
        onSelect={(file) => {
          goToFile(file);
          setActiveMode("journey");
        }}
      />

      {showVoiceControls && onToggleAgent && (
        <VoiceControlIsland
          isActive={isAgentActive}
          onToggle={onToggleAgent}
          isReady={isAgentReady}
        />
      )}
    </>
  );
}

// Component that uses LiveKit hooks (must be inside LiveKitRoom)
function LiveKitContent({
  isAgentActive,
  onToggleAgent,
}: {
  isAgentActive: boolean;
  onToggleAgent: () => void;
}) {
  // This hook uses useDataChannel which requires LiveKit context
  const { guidedState, isReady } = useAgentCommands();

  return (
    <MainUI
      guidedState={guidedState}
      showVoiceControls={true}
      isAgentActive={isAgentActive}
      onToggleAgent={onToggleAgent}
      isAgentReady={isReady}
    />
  );
}

// Fallback component without LiveKit hooks
function RegularContent() {
  return <MainUI guidedState={null} showVoiceControls={false} />;
}

export default function App() {
  const { session } = useSession();
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [liveKitRoom, setLiveKitRoom] = useState<string | null>(null);
  const [liveKitUrl, setLiveKitUrl] = useState<string | null>(null);
  const [liveKitLoading, setLiveKitLoading] = useState(true);
  const [isAgentActive, setIsAgentActive] = useState(true);

  useEffect(() => {
    fetchOnboardingDocs();
  }, []);

  useEffect(() => {
    if (session) {
      fetchLiveKitToken()
        .then((data) => {
          setLiveKitToken(data.token);
          setLiveKitRoom(data.roomName);
          setLiveKitUrl(data.url);
          setLiveKitLoading(false);
        })
        .catch((error) => {
          console.error("Failed to get LiveKit token:", error);
          setLiveKitLoading(false);
        });
    } else {
      setLiveKitLoading(false);
    }
  }, [session]);

  // If LiveKit is configured, wrap in LiveKitRoom
  if (liveKitToken && liveKitRoom && liveKitUrl && !liveKitLoading) {
    return (
      <LiveKitRoom
        video={false}
        audio={true}
        token={liveKitToken}
        serverUrl={liveKitUrl}
        connect={isAgentActive}
        options={{
          adaptiveStream: true,
          dynacast: true,
        }}
        className="h-screen w-screen bg-[#0d1117]"
      >
        <RoomAudioRenderer />
        <LiveKitContent
          isAgentActive={isAgentActive}
          onToggleAgent={() => setIsAgentActive(!isAgentActive)}
        />
      </LiveKitRoom>
    );
  }

  // No LiveKit: render without voice controls (no LiveKit hooks used)
  return <RegularContent />;
}

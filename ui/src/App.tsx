import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import { useSession } from "./hooks/useSession";
import { useJourney } from "./hooks/useJourney";
import { fetchLiveKitToken, fetchOnboardingDocs } from "./lib/api";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import JourneyView from "./components/JourneyView";
import FileFocus from "./components/FileFocus";
import ConnectionView from "./components/ConnectionView";
import FileSidebar from "./components/FileSidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import VoiceControlIsland from "./components/VoiceControlIsland";
import ContentHeader from "./components/ContentHeader";
import FeaturesView from "./components/FeaturesView";
import OnboardingDocsView from "./components/OnboardingDocsView";

export default function App() {
  const { session } = useSession();
  const journey = useJourney();
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [liveKitRoom, setLiveKitRoom] = useState<string | null>(null);
  const [liveKitUrl, setLiveKitUrl] = useState<string | null>(null);
  const [liveKitLoading, setLiveKitLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAgentActive, setIsAgentActive] = useState(true);

  // Check for onboarding docs on mount
  useEffect(() => {
    fetchOnboardingDocs().then((docs) => {
      if (docs.length > 0) {
        // If docs exist, default to showing them instead of generic welcome
        const defaultDoc = docs.includes("INDEX.md") ? "INDEX.md" : docs[0];
        journey.setViewState({ type: "onboarding-docs", docId: defaultDoc });
      }
    });
  }, []);

  // Fetch LiveKit token when session is available
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

  const Sidebar = (
    <FileSidebar
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      selectedId={
        journey.viewState.type === "feature-details"
          ? journey.viewState.featureId
          : journey.viewState.type === "onboarding-docs"
          ? journey.viewState.docId
          : undefined
      }
      onDocSelect={(docId) => {
        journey.setViewState({ type: "onboarding-docs", docId });
        if (window.innerWidth < 1024) setSidebarOpen(false);
      }}
      onFeatureSelect={(featureId) => {
        journey.setViewState({ type: "feature-details", featureId });
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      }}
    />
  );

  const MainContent = (
    <>
      <ContentHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      {journey.viewState.type === "onboarding-docs" && (
        <OnboardingDocsView
          docId={
            journey.viewState.type === "onboarding-docs"
              ? journey.viewState.docId
              : undefined
          }
        />
      )}
      {(journey.viewState.type === "features" ||
        journey.viewState.type === "feature-details") && (
        <FeaturesView
          featureId={
            journey.viewState.type === "feature-details"
              ? journey.viewState.featureId
              : undefined
          }
        />
      )}
      {journey.viewState.type === "journey" &&
        (journey.journeySteps.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <JourneyView />
        ))}
      {journey.viewState.type === "focus" && (
        <FileFocus file={journey.viewState.file} />
      )}
      {journey.viewState.type === "connections" && (
        <ConnectionView
          file={journey.viewState.file}
          onBack={() => {
            const file =
              journey.viewState.type === "connections"
                ? journey.viewState.file
                : "";
            journey.setViewState({
              type: "focus",
              file,
            });
          }}
        />
      )}
    </>
  );

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
        className="h-screen w-screen"
      >
        <RoomAudioRenderer />

        {/* Voice Island */}
        <VoiceControlIsland
          isActive={isAgentActive}
          onToggle={() => setIsAgentActive(!isAgentActive)}
        />

        <Layout sidebar={Sidebar}>{MainContent}</Layout>
      </LiveKitRoom>
    );
  }

  // Fallback UI
  return <Layout sidebar={Sidebar}>{MainContent}</Layout>;
}

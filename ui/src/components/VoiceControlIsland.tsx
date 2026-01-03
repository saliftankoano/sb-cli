import { useState } from "react";
import {
  useLocalParticipant,
  BarVisualizer,
  useVoiceAssistant,
} from "@livekit/components-react";
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PlayIcon,
  PauseIcon,
  CaretUpIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { MorphSurface } from "./ui/morph-surface";
import VoiceTranscript from "./VoiceTranscript";
import { useVoiceChat } from "../hooks/useVoiceChat";

interface VoiceControlIslandProps {
  isActive: boolean;
  onToggle: () => void;
}

export default function VoiceControlIsland({
  isActive,
  onToggle,
}: VoiceControlIslandProps) {
  const { messages } = useVoiceChat();
  const [isExpanded, setIsExpanded] = useState(false);
  const { state: agentState, audioTrack: agentAudioTrack } =
    useVoiceAssistant();

  // Local controls
  const { localParticipant } = useLocalParticipant();
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  const toggleMic = async () => {
    const enabled = !isMicEnabled;
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(enabled);
      setIsMicEnabled(enabled);
    }
  };

  const currentStatus = !isActive
    ? "idle"
    : agentState === "speaking"
    ? "speaking"
    : agentState === "thinking"
    ? "thinking"
    : isMicEnabled
    ? "listening"
    : "idle";

  return (
    <div className="fixed top-6 right-6 z-50">
      <MorphSurface
        isOpen={isExpanded}
        onOpenChange={setIsExpanded}
        collapsedWidth={280}
        collapsedHeight={44}
        expandedWidth={600}
        expandedHeight={500}
        renderTrigger={() => (
          <div className="flex h-full w-full items-center justify-between px-4">
            <div className="flex items-center gap-3 min-w-fit">
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              />
              <span className="text-white font-bold text-sm whitespace-nowrap tracking-tight">
                StartBlock
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isActive && agentAudioTrack && (
                <div className="h-6 w-12 px-1.5 border-l border-white/10">
                  <BarVisualizer
                    state="speaking"
                    barCount={5}
                    trackRef={agentAudioTrack}
                    className="h-full text-blue-400"
                    style={{ gap: "2px" }}
                  />
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMic();
                  }}
                  className="p-1.5 text-white/70 hover:text-white transition-colors hover:bg-white/5 rounded-md"
                  disabled={!isActive}
                >
                  {isMicEnabled ? (
                    <MicrophoneIcon size={16} weight="fill" />
                  ) : (
                    <MicrophoneSlashIcon
                      size={16}
                      weight="fill"
                      className="text-red-400"
                    />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="p-1.5 text-white/70 hover:text-white transition-colors hover:bg-white/5 rounded-md"
                >
                  {isActive ? (
                    <PauseIcon size={16} weight="fill" />
                  ) : (
                    <PlayIcon size={16} weight="fill" />
                  )}
                </button>

                <button
                  onClick={() => setIsExpanded(true)}
                  className="p-1.5 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all flex items-center justify-center ml-0.5"
                >
                  <CaretUpIcon size={14} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        )}
        renderContent={() => (
          <div className="flex h-full w-full flex-col">
            {/* Header in expanded mode */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-4 min-w-fit">
                <span className="text-white font-bold text-sm">StartBlock</span>

                {/* VISUALIZER IN EXPANDED HEADER */}
                {isActive && agentAudioTrack && (
                  <div className="h-6 w-16 px-3 border-l border-white/10 ml-2">
                    <BarVisualizer
                      state="speaking"
                      barCount={7}
                      trackRef={agentAudioTrack}
                      className="h-full text-blue-400"
                      style={{ gap: "3px" }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMic}
                    className="p-2 text-white/70 hover:text-white transition-colors hover:bg-white/5 rounded-md"
                    disabled={!isActive}
                  >
                    {isMicEnabled ? (
                      <MicrophoneIcon size={18} weight="fill" />
                    ) : (
                      <MicrophoneSlashIcon
                        size={18}
                        weight="fill"
                        className="text-red-400"
                      />
                    )}
                  </button>
                  <button
                    onClick={onToggle}
                    className="p-2 text-white/70 hover:text-white transition-colors hover:bg-white/5 rounded-md"
                  >
                    {isActive ? (
                      <PauseIcon size={18} weight="fill" />
                    ) : (
                      <PlayIcon size={18} weight="fill" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                >
                  <CaretDownIcon size={16} weight="bold" />
                </button>
              </div>
            </div>

            {/* Transcript Area */}
            <div className="flex-1 min-h-0 bg-[#0d1117]/50 flex flex-col">
              <VoiceTranscript messages={messages} status={currentStatus} />
            </div>
          </div>
        )}
      />
    </div>
  );
}

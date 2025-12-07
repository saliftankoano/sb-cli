import { useEffect, useState } from "react";
import { useNarration } from "@/hooks/useNarration";
import {
  PlayIcon,
  PauseIcon,
  SpeakerHighIcon,
  SpeakerXIcon,
  CircleNotchIcon,
  WaveformIcon,
} from "@phosphor-icons/react";
import SiriOrb from "@/components/smoothui/siri-orb";
import {
  DynamicIsland,
  DynamicIslandProvider,
  DynamicContainer,
  DynamicTitle,
  DynamicDescription,
  useDynamicIslandSize,
  SIZE_PRESETS,
} from "@/components/ui/dynamic-island";
import { Button } from "@/components/ui/button";

const VoicePlayerContent = () => {
  const {
    narration,
    loading,
    isPlaying,
    isMuted,
    loadNarration,
    toggleMute,
    pause,
    play,
  } = useNarration(true);
  const { setSize } = useDynamicIslandSize();

  const [mutePreference, setMutePreference] = useState<boolean>(() => {
    const saved = localStorage.getItem("sb-voice-muted");
    return saved === "true";
  });

  useEffect(() => {
    if (!narration && !loading) {
      loadNarration();
    }
  }, []);

  useEffect(() => {
    if (mutePreference !== isMuted) {
      toggleMute();
    }
  }, [mutePreference]);

  useEffect(() => {
    if (isPlaying) {
      setSize(SIZE_PRESETS.LONG);
    } else {
      setSize(SIZE_PRESETS.COMPACT_LONG);
    }
  }, [isPlaying, setSize]);

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !mutePreference;
    setMutePreference(newMuted);
    localStorage.setItem("sb-voice-muted", String(newMuted));
    toggleMute();
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) pause();
    else play();
  };

  return (
    <div className="flex items-center justify-between h-full w-full px-4">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center h-8 w-8 overflow-hidden">
          {loading ? (
            <CircleNotchIcon className="animate-spin text-white" size={20} />
          ) : isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center scale-150">
              <SiriOrb size="60px" />
            </div>
          ) : (
            <div className="h-6 w-6 bg-neutral-800 rounded-full flex items-center justify-center">
              <WaveformIcon size={14} weight="fill" className="text-white" />
            </div>
          )}
        </div>

        <DynamicContainer className="flex flex-col items-start">
          <DynamicTitle className="text-sm font-medium text-white">
            AI Guide
          </DynamicTitle>
          {isPlaying && (
            <DynamicDescription className="text-xs text-neutral-400 truncate max-w-[180px]">
              {narration?.script || "Speaking..."}
            </DynamicDescription>
          )}
        </DynamicContainer>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
          onClick={togglePlay}
        >
          {isPlaying ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
          onClick={handleMuteToggle}
        >
          {mutePreference ? <SpeakerXIcon /> : <SpeakerHighIcon />}
        </Button>
      </div>
    </div>
  );
};

export default function VoicePlayer() {
  return (
    <DynamicIslandProvider initialSize={SIZE_PRESETS.COMPACT_LONG}>
      <DynamicIsland id="voice-player">
        <VoicePlayerContent />
      </DynamicIsland>
    </DynamicIslandProvider>
  );
}

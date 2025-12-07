import { useTracks, BarVisualizer, useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Microphone, MicrophoneSlash, Play, Pause } from "@phosphor-icons/react";
import { useState } from "react";
import { 
  DynamicIsland, 
  DynamicIslandProvider, 
  SIZE_PRESETS, 
  DynamicContainer, 
  DynamicDiv 
} from "./ui/dynamic-island";

interface VoiceControlIslandProps {
  isActive: boolean;
  onToggle: () => void;
}

function VoiceControlContent({ isActive, onToggle }: VoiceControlIslandProps) {
  // Get remote audio tracks (Agent)
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: true });
  const agentTrack = tracks.find(t => !t.participant.isLocal);
  
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

  return (
    <DynamicIsland id="voice-island">
        <div className="relative w-full h-full flex items-center justify-between px-6">
            <DynamicContainer className="flex items-center gap-4 w-full">
                <DynamicDiv className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                    <span className="text-white font-medium whitespace-nowrap">StartBlock</span>
                </DynamicDiv>
                
                <div className="flex-1 flex justify-end items-center gap-3 h-6 min-w-[100px]">
                     {isActive && agentTrack ? (
                         <BarVisualizer
                            state="speaking"
                            barCount={5}
                            trackRef={agentTrack}
                            className="h-full text-white"
                            style={{ height: '32px', width: '80px', gap: '4px' }}
                         />
                     ) : (
                         <div className="flex gap-1 h-full items-center justify-end opacity-30">
                             {[...Array(5)].map((_, i) => (
                                 <div key={i} className="w-1 h-1 rounded-full bg-white" />
                             ))}
                         </div>
                     )}
                     
                     <button 
                        onClick={toggleMic}
                        className="text-white/80 hover:text-white transition-colors"
                        disabled={!isActive}
                     >
                        {isMicEnabled ? (
                            <Microphone size={20} weight="fill" />
                        ) : (
                            <MicrophoneSlash size={20} weight="fill" className="text-red-400" />
                        )}
                     </button>

                     <button 
                        onClick={onToggle}
                        className="text-white/80 hover:text-white transition-colors"
                     >
                        {isActive ? (
                            <Pause size={20} weight="fill" />
                        ) : (
                            <Play size={20} weight="fill" />
                        )}
                     </button>
                </div>
            </DynamicContainer>
        </div>
    </DynamicIsland>
  );
}

export default function VoiceControlIsland(props: VoiceControlIslandProps) {
    return (
        <div className="fixed top-6 right-6 z-50">
            <DynamicIslandProvider initialSize={SIZE_PRESETS.COMPACT_LONG}>
                <VoiceControlContent {...props} />
            </DynamicIslandProvider>
        </div>
    )
}


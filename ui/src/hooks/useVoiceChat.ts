import { useState, useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, TranscriptionSegment } from "livekit-client";
import type { TranscriptMessage } from "@/components/VoiceTranscript";

export function useVoiceChat() {
  const room = useRoomContext();
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your StartBlock guide. I can help you understand this codebase. What would you like to explore?",
      timestamp: Date.now(),
    },
  ]);

  useEffect(() => {
    if (!room) return;

    const handleTranscription = (
      segments: TranscriptionSegment[],
      participant?: any,
      _publication?: any
    ) => {
      segments.forEach((segment) => {
        if (segment.final) {
          const newMessage: TranscriptMessage = {
            id: segment.id,
            role: participant?.isLocal ? "user" : "assistant",
            text: segment.text,
            timestamp: Date.now(),
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      });
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room]);

  return { messages };
}

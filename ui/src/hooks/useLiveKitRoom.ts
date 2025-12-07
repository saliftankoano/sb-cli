import { useState, useEffect, useCallback } from "react";
import { Room, RoomEvent, RemoteParticipant, DataPacket_Kind } from "livekit-client";
import type { UICommand } from "@/lib/commands";

export interface LiveKitRoomState {
  isConnected: boolean;
  isAgentSpeaking: boolean;
  isMicEnabled: boolean;
  room: Room | null;
  error: Error | null;
}

export function useLiveKitRoom(
  token: string | null,
  roomName: string | null,
  url: string | null,
  onCommand?: (command: UICommand) => void
) {
  const [state, setState] = useState<LiveKitRoomState>({
    isConnected: false,
    isAgentSpeaking: false,
    isMicEnabled: true,
    room: null,
    error: null,
  });

  useEffect(() => {
    if (!token || !roomName || !url) {
      return;
    }

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    const connect = async () => {
      try {
        await room.connect(url, token);

        // Listen for data channel messages (UI commands from agent)
        room.on(RoomEvent.DataReceived, (payload, _participant, kind) => {
          if (kind === DataPacket_Kind.RELIABLE && payload) {
            try {
              const command = JSON.parse(new TextDecoder().decode(payload)) as UICommand;
              onCommand?.(command);
            } catch (e) {
              console.error("Failed to parse UI command:", e);
            }
          }
        });

        // Track when agent is speaking
        room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          const isAgentSpeaking = speakers.some((s) => s instanceof RemoteParticipant);
          setState((prev) => ({ ...prev, isAgentSpeaking }));
        });

        setState({
          isConnected: true,
          isAgentSpeaking: false,
          isMicEnabled: true,
          room,
          error: null,
        });
      } catch (error) {
        console.error("Failed to connect to LiveKit room:", error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isConnected: false,
        }));
      }
    };

    connect();

    return () => {
      room.disconnect();
    };
  }, [token, roomName, url, onCommand]);

  const toggleMic = useCallback(async () => {
    if (!state.room) return;

    const enabled = !state.isMicEnabled;
    await state.room.localParticipant.setMicrophoneEnabled(enabled);
    setState((prev) => ({ ...prev, isMicEnabled: enabled }));
  }, [state.room, state.isMicEnabled]);

  const disconnect = useCallback(async () => {
    if (state.room) {
      await state.room.disconnect();
      setState({
        isConnected: false,
        isAgentSpeaking: false,
        isMicEnabled: false,
        room: null,
        error: null,
      });
    }
  }, [state.room]);

  return {
    ...state,
    toggleMic,
    disconnect,
  };
}


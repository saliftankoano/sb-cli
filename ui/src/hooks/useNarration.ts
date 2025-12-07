import { useState, useRef, useEffect } from "react";
import { generateNarration, type NarrationResponse } from "@/lib/api";

export function useNarration(autoPlay: boolean = true) {
  const [narration, setNarration] = useState<NarrationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadNarration = async (
    section?: string,
    context?: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateNarration(section, context);
      setNarration(data);

      // Create audio element
      const audio = new Audio(data.audio);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);

      if (autoPlay && !isMuted) {
        await audio.play();
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const play = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play();
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    narration,
    loading,
    error,
    isPlaying,
    isMuted,
    loadNarration,
    play,
    pause,
    toggleMute,
  };
}

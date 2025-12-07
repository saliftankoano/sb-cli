import { useNarration } from "@/hooks/useNarration";

export default function FloatingOrb() {
  const { isPlaying } = useNarration();

  if (!isPlaying) {
    return null;
  }

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
        <div className="relative w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
          <span className="text-lg">🎙️</span>
        </div>
      </div>
    </div>
  );
}

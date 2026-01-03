import { motion, AnimatePresence } from "framer-motion";
import { UserIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

export interface TranscriptMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

interface VoiceTranscriptProps {
  messages: TranscriptMessage[];
  status?: "listening" | "thinking" | "speaking" | "idle";
}

export default function VoiceTranscript({
  messages,
  status = "idle",
}: VoiceTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isActive = status !== "idle";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Map status to label
  const statusLabel = {
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
    idle: "",
  }[status];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
      {/* ... previous empty state logic ... */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 opacity-60 py-12">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-900/40 mb-6">
            <span className="font-bold text-white text-xl">SB</span>
          </div>
          <p className="text-sm max-w-[200px] leading-relaxed">
            Start talking to ask questions about the codebase.
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === "user"
                    ? "bg-[#30363d] text-gray-300"
                    : "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-blue-900/20"
                }`}
              >
                {msg.role === "user" ? (
                  <UserIcon size={16} />
                ) : (
                  <span className="font-bold text-[10px]">SB</span>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#30363d] text-white rounded-tr-none"
                    : "bg-[#1f6feb]/10 border border-blue-500/20 text-blue-100 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Dynamic Status Indicator */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-gray-500 ml-12"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                status === "speaking" ? "bg-green-400" : "bg-blue-400"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                status === "speaking" ? "bg-green-500" : "bg-blue-500"
              }`}
            ></span>
          </span>
          {statusLabel}
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

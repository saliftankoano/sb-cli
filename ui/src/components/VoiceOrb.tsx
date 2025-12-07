import { useState, useEffect } from "react";
import { useRemoteParticipants } from "@livekit/components-react";
import { Spinner } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export default function VoiceOrb() {
  const remoteParticipants = useRemoteParticipants();
  // Assume the first remote participant is the agent (1:1 room)
  const agent = remoteParticipants[0];
  const [statusText, setStatusText] = useState("Waiting for agent...");

  // Update status based on agent state
  useEffect(() => {
    if (agent) {
      if (agent.isSpeaking) {
        setStatusText("Speaking...");
      } else {
        setStatusText("Listening...");
      }
    } else {
      setStatusText("Connecting to agent...");
    }
  }, [agent, agent?.isSpeaking]);

  const isAgentConnected = !!agent;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-12">
      {/* The Orb */}
      <div className="relative group">
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
            isAgentConnected ? "bg-blue-500/30 scale-150" : "bg-red-500/10 scale-100"
          }`} 
        />

        <motion.div
          animate={{
            scale: isAgentConnected ? [1, 1.05, 1] : 1,
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-2xl transition-colors duration-500 ${
            isAgentConnected 
              ? "bg-gradient-to-br from-slate-900/80 to-slate-800/80 ring-1 ring-blue-500/30" 
              : "bg-slate-900/80 ring-1 ring-red-500/20"
          }`}
        >
          {!isAgentConnected ? (
            <Spinner className="w-8 h-8 text-red-400 animate-spin" />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Internal Core */}
              <div className="w-8 h-8 rounded-full bg-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.6)]" />
              
              {/* Orbital Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-4 rounded-full border border-blue-400/30 border-t-transparent border-l-transparent"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute inset-6 rounded-full border border-purple-400/30 border-b-transparent border-r-transparent"
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Dynamic Text */}
      <div className="text-center space-y-2 max-w-md">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={statusText}
          className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight"
        >
          {statusText}
        </motion.h2>
        {isAgentConnected && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 dark:text-gray-400"
          >
            "Hey there! Ready to explore the codebase?"
          </motion.p>
        )}
      </div>
    </div>
  );
}

import { ReactNode } from "react";
import NavRail from "./NavRail";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  activeMode: "journey" | "explore" | "knowledge";
  onModeChange: (mode: "journey" | "explore" | "knowledge") => void;
  onSearchClick?: () => void;
  sidebarContent?: ReactNode; // For the Explore/Journey specific sidebars
  topBar?: ReactNode;
}

export default function Layout({
  children,
  activeMode,
  onModeChange,
  onSearchClick,
  sidebarContent,
  topBar,
}: LayoutProps) {
  return (
    <div className="flex h-screen w-screen bg-[#0d1117] text-[#e6edf3] overflow-hidden font-sans selection:bg-blue-500/20 selection:text-blue-400">
      {/* 1. Navigation Rail (Fixed Left) */}
      <NavRail
        activeMode={activeMode}
        onModeChange={onModeChange}
        onSearchClick={onSearchClick || (() => {})}
      />

      {/* 2. Secondary Sidebar (Collapsible/Mode-specific) */}
      <AnimatePresence mode="wait">
        {sidebarContent && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-[#30363d] bg-[#161b22] overflow-hidden flex flex-col"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0d1117] relative">
        {/* Top Bar (Context/Command) */}
        {topBar && (
          <div className="h-14 border-b border-[#30363d] bg-[#0d1117]/80 backdrop-blur-sm flex items-center px-6 sticky top-0 z-30">
            {topBar}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto lg:overflow-hidden relative flex flex-col h-full">
          <div className="flex-1 w-full max-w-[2000px] mx-auto p-4 lg:p-6 flex flex-col h-full min-h-0">
            {children}
          </div>
        </main>
      </div>

      {/* Global Overlays (Search, Voice Panel, etc) would go here */}
    </div>
  );
}

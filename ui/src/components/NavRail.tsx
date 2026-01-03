import {
  RocketLaunch,
  Files,
  Gear,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { motion } from "framer-motion";

interface NavRailProps {
  activeMode: "journey" | "explore" | "knowledge";
  onModeChange: (mode: "journey" | "explore" | "knowledge") => void;
  onSearchClick: () => void;
}

export default function NavRail({
  activeMode,
  onModeChange,
  onSearchClick,
}: NavRailProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const navItems = [
    { id: "journey", icon: RocketLaunch, label: "Journey" },
    { id: "explore", icon: Files, label: "Explorer" },
    // { id: "knowledge", icon: BookOpen, label: "Knowledge" },
  ] as const;

  return (
    <div className="w-[56px] bg-[#0d1117] border-r border-[#30363d] flex flex-col items-center py-4 gap-6 h-full shrink-0 z-50">
      {/* Logo Area */}
      <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20 mb-2">
        <span className="font-bold text-white text-xs">SB</span>
      </div>

      {/* Main Nav Items */}
      <div className="flex flex-col gap-4 w-full items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onModeChange(item.id)}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group ${
              activeMode === item.id
                ? "text-blue-400 bg-blue-500/10"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#21262d]"
            }`}
          >
            <item.icon
              size={22}
              weight={activeMode === item.id ? "fill" : "regular"}
            />

            {/* Active Indicator */}
            {activeMode === item.id && (
              <motion.div
                layoutId="active-indicator"
                className="absolute left-0 w-[3px] h-6 bg-blue-500 rounded-r-full"
              />
            )}

            {/* Tooltip */}
            {hovered === item.id && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-white whitespace-nowrap shadow-xl z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                {item.label}
              </div>
            )}
          </button>
        ))}

        <div className="w-6 h-[1px] bg-[#30363d] my-1" />

        {/* Search Action */}
        <button
          onClick={onSearchClick}
          onMouseEnter={() => setHovered("search")}
          onMouseLeave={() => setHovered(null)}
          className="relative w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#21262d] transition-all"
        >
          <MagnifyingGlassIcon size={22} />
          {hovered === "search" && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-white whitespace-nowrap shadow-xl z-50">
              Search (Cmd+K)
            </div>
          )}
        </button>
      </div>

      <div className="flex-1" />

      {/* Settings (Bottom) */}
      <button
        onMouseEnter={() => setHovered("settings")}
        onMouseLeave={() => setHovered(null)}
        className="relative w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#21262d] transition-all"
      >
        <Gear size={22} />
        {hovered === "settings" && (
          <div className="absolute left-full ml-3 px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-white whitespace-nowrap shadow-xl z-50">
            Settings
          </div>
        )}
      </button>
    </div>
  );
}

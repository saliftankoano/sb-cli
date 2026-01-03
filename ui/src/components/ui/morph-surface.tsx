"use client";

import React, { useEffect, useId, useRef, useState, useCallback } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type Transition,
} from "framer-motion";
import { useClickAway } from "react-use";

interface MorphSurfaceProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapsedWidth?: number | "auto";
  collapsedHeight?: number;
  expandedWidth?: number;
  expandedHeight?: number;
  animationSpeed?: number;
  springConfig?: {
    type: "spring";
    stiffness: number;
    damping: number;
    mass?: number;
  };
  className?: string;
  renderTrigger?: (props: {
    isOpen: boolean;
    onClick: () => void;
  }) => React.ReactNode;
  renderContent?: (props: {
    isOpen: boolean;
    onClose: () => void;
  }) => React.ReactNode;
}

export function MorphSurface({
  isOpen: controlledIsOpen,
  onOpenChange,
  collapsedWidth = 300,
  collapsedHeight = 44,
  expandedWidth = 630,
  expandedHeight = 500,
  animationSpeed = 1,
  springConfig,
  className = "",
  renderTrigger,
  renderContent,
}: MorphSurfaceProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId();

  const setIsOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledIsOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  useClickAway(containerRef, () => {
    if (isOpen) setIsOpen(false);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const transition: Transition = springConfig || {
    type: "spring",
    stiffness: 400 / animationSpeed,
    damping: 30,
    mass: 1,
  };

  return (
    <MotionConfig transition={transition}>
      <div className={`relative ${className}`} ref={containerRef}>
        <motion.div
          layoutId={`surface-${uniqueId}`}
          style={{
            borderRadius: 24,
          }}
          className="overflow-hidden border border-white/10 bg-[#161b22] shadow-2xl"
          animate={{
            width: isOpen ? expandedWidth : collapsedWidth,
            height: isOpen ? expandedHeight : collapsedHeight,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!isOpen ? (
              <motion.div
                key="trigger"
                layoutId={`content-${uniqueId}`}
                className="h-full w-full"
              >
                {renderTrigger?.({
                  isOpen: false,
                  onClick: () => setIsOpen(true),
                })}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                layoutId={`content-${uniqueId}`}
                className="h-full w-full"
              >
                {renderContent?.({
                  isOpen: true,
                  onClose: () => setIsOpen(false),
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </MotionConfig>
  );
}

import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
}

export default function AnimatedCard({
  children,
  delay = 0,
}: AnimatedCardProps) {
  return (
    <div
      className="animate-fade-in animate-slide-in-from-bottom"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}

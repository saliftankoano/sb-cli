import { useEffect, useState } from "react";

interface CelebrationProps {
  trigger: boolean;
}

export default function Celebration({ trigger }: CelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="text-6xl animate-bounce">🎉</div>
    </div>
  );
}

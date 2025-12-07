import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  diagram: string;
  className?: string;
}

export default function MermaidDiagram({
  diagram,
  className = "",
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode =
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Watch for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", checkDarkMode);
    };
  }, []);

  // Initialize Mermaid and render diagram
  useEffect(() => {
    if (!containerRef.current || !diagram) return;

    const container = containerRef.current;
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    // Initialize Mermaid with theme
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      themeVariables: isDark
        ? {
            primaryColor: "#3b82f6",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#60a5fa",
            lineColor: "#60a5fa",
            secondaryColor: "#1e3a8a",
            tertiaryColor: "#1e40af",
          }
        : undefined,
      securityLevel: "loose",
    });

    // Clear previous content
    container.innerHTML = "";

    // Render diagram
    mermaid
      .render(id, diagram.trim())
      .then((result) => {
        container.innerHTML = result.svg;
        setError(null);
      })
      .catch((err) => {
        console.error("Mermaid rendering error:", err);
        setError("Failed to render diagram");
        container.innerHTML = `<div class="text-red-500 text-sm p-4">Error rendering diagram: ${err.message}</div>`;
      });
  }, [diagram, isDark]);

  if (!diagram) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-container ${className} overflow-x-auto my-4`}
    >
      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

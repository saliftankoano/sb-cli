import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import "d3-sankey";

interface MermaidDiagramProps {
  diagram: string;
  className?: string;
}

// Sanitize mermaid diagram to fix common syntax issues
function sanitizeMermaidDiagram(diagram: string): string {
  let sanitized = diagram.trim();

  // Remove any HTML entities that might cause issues
  sanitized = sanitized
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');

  // Fix common issues with node labels containing special characters
  // Replace ... with ellipsis to avoid parsing issues
  sanitized = sanitized.replace(/\.\.\./g, "…");

  // Ensure proper newlines
  sanitized = sanitized.replace(/\\n/g, "\n");

  return sanitized;
}

export default function MermaidDiagram({
  diagram,
  className = "",
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

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

    // Sanitize the diagram
    const sanitizedDiagram = sanitizeMermaidDiagram(diagram);

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
      suppressErrorRendering: true,
    });

    // Clear previous content
    container.innerHTML = "";

    // Render diagram - wrap in try/catch to handle sync errors
    try {
      mermaid
        .render(id, sanitizedDiagram)
        .then((result) => {
          if (container) {
            container.innerHTML = result.svg;
          }
        })
        .catch(() => {
          // Silently fail - don't show error in UI
          if (container) {
            container.innerHTML = "";
          }
        });
    } catch {
      // Silently fail for sync errors
      container.innerHTML = "";
    }
  }, [diagram, isDark]);

  if (!diagram) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-container ${className} overflow-x-auto my-4`}
    />
  );
}

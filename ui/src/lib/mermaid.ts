let mermaidLoaded = false;
let mermaidInstance: any = null;

export async function loadMermaid() {
  if (mermaidLoaded && mermaidInstance) {
    return mermaidInstance;
  }

  try {
    // @ts-ignore - Dynamic import from URL is not typed
    const mermaidModule = await import("https://esm.sh/mermaid@10");
    mermaidInstance = mermaidModule.default;
    mermaidInstance.initialize({ startOnLoad: false, theme: "default" });
    mermaidLoaded = true;
    return mermaidInstance;
  } catch (error) {
    console.error("Failed to load Mermaid:", error);
    return null;
  }
}

export async function renderMermaid(
  code: string,
  containerId: string
): Promise<string | null> {
  const mermaid = await loadMermaid();
  if (!mermaid) {
    return null;
  }

  try {
    const { svg } = await mermaid.render(containerId, code);
    return svg;
  } catch (error) {
    console.error("Failed to render Mermaid diagram:", error);
    return null;
  }
}

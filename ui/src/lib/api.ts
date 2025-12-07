const API_BASE = "/api";

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  entryPoint?: string;
  userFlows: string[];
  mermaidDiagram?: string; // Legacy flowchart TD diagram
  mermaidJourney?: string; // Journey diagram (high-level user flow)
  mermaidSequence?: string; // Sequence diagram (action → file interactions)
  files: string[];
  filesByAction: Record<string, string[]>; // REQUIRED when userFlows exist
  dependencies: string[];
  tags: string[];
}

export interface FeaturesManifest {
  features: Feature[];
  lastUpdated: string;
  version: string;
}

export interface OnboardingDoc {
  filename: string;
  content?: string;
}

export async function fetchFeatures(): Promise<FeaturesManifest> {
  const response = await fetch(`${API_BASE}/features`);
  if (!response.ok) {
    throw new Error("Failed to fetch features");
  }
  return response.json();
}

export async function fetchOnboardingDocs(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/features/onboarding`);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.docs || [];
}

export async function fetchOnboardingDoc(filename: string): Promise<string> {
  const response = await fetch(`${API_BASE}/features/onboarding/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch doc: ${filename}`);
  }
  const data = await response.json();
  return data.content;
}

export interface KnowledgeFile {
  filePath: string;
  sourceFile: string;
  tags: string[];
  importance?: string;
  lastUpdated: string;
  content: {
    purpose?: string;
    gotchas?: string;
    dependencies?: string;
    architecture?: string;
    insights?: string;
    raw: string;
  };
}

export interface OnboardingSession {
  goal: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  timebox?: string;
  selectedFiles: string[];
  knowledgeFiles: Array<{
    path: string;
    sourceFile: string;
    importance?: string;
    tags?: string[];
  }>;
  docsUsed: string[];
  suggestedTasks?: Array<{
    level: "beginner" | "intermediate" | "advanced";
    description: string;
    files: string[];
  }>;
  userName?: string;
  createdAt: string;
}

export interface TreeNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: TreeNode[];
  hasKnowledge?: boolean;
  importance?: string;
  tags?: string[];
}

export interface TreeResponse {
  tree: TreeNode[];
  totalFiles: number;
  documentedFiles: number;
}

export interface NarrationResponse {
  script: string;
  audio: string;
  duration: number;
}

export async function fetchKnowledge(): Promise<KnowledgeFile[]> {
  const response = await fetch(`${API_BASE}/knowledge`);
  if (!response.ok) {
    throw new Error("Failed to fetch knowledge files");
  }
  return response.json();
}

export async function fetchSession(): Promise<OnboardingSession | null> {
  const response = await fetch(`${API_BASE}/session`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to fetch session");
  }
  return response.json();
}

export async function fetchTree(): Promise<TreeResponse> {
  const response = await fetch(`${API_BASE}/tree`);
  if (!response.ok) {
    throw new Error("Failed to fetch file tree");
  }
  return response.json();
}

export async function generateNarration(
  section?: string,
  context?: Record<string, any>
): Promise<NarrationResponse> {
  const response = await fetch(`${API_BASE}/narration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ section, context }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate narration");
  }
  return response.json();
}

export interface LiveKitTokenResponse {
  token: string;
  roomName: string;
  url: string;
}

export async function fetchLiveKitToken(
  sessionId?: string
): Promise<LiveKitTokenResponse> {
  const response = await fetch(`${API_BASE}/livekit/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId }),
  });
  if (!response.ok) {
    throw new Error("Failed to get LiveKit token");
  }
  return response.json();
}

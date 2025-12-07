/**
 * Feature Management for Knowledge Documentation (CLI version)
 *
 * Handles feature detection, categorization, and features.json generation
 */

import * as fs from "fs/promises";
import * as path from "path";

/**
 * Predefined feature categories
 */
export type FeatureCategory =
  | "Infrastructure" // DB, config, deployment, setup
  | "API" // Routes, endpoints, handlers
  | "UI" // Components, pages, layouts
  | "Authentication" // Auth flows, sessions, permissions
  | "Analytics" // Tracking, metrics, reporting
  | "Services" // Business logic, integrations
  | "Utilities"; // Helpers, shared code, types

/**
 * Feature role in the system
 */
export type FeatureRole =
  | "entry_point"
  | "helper"
  | "component"
  | "service"
  | "config";

/**
 * Feature entry in features.json
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  entryPoint?: string;
  userFlows: string[];
  mermaidDiagram?: string; // flowchart TD diagram
  mermaidJourney?: string; // Journey diagram (high-level user flow)
  mermaidSequence?: string; // Sequence diagram (action → file interactions)
  files: string[];
  filesByAction: Record<string, string[]>; // REQUIRED when userFlows exist. Keyed by user flow text (must match exactly)
  dependencies: string[]; // Other feature IDs
  tags: string[];
}

/**
 * Features manifest (features.json structure)
 */
export interface FeaturesManifest {
  $schema?: string;
  version: string;
  lastUpdated: string;
  features: Feature[];
}

/**
 * Infer feature ID from file path using directory structure
 */
export function inferFeatureFromPath(
  filePath: string,
  tags?: string[]
): string {
  const parts = filePath.split("/");
  const dirParts = parts.slice(0, -1);

  if (dirParts.includes("dashboard")) {
    if (tags?.some((t) => t.toLowerCase().includes("analytics"))) {
      return "dashboard-analytics";
    }
    return "dashboard";
  }

  if (dirParts.includes("auth") || dirParts.includes("authentication")) {
    return "authentication";
  }

  if (dirParts.includes("api") || dirParts.includes("routes")) {
    if (dirParts.includes("mcp")) {
      return "mcp-integration";
    }
    const apiIndex = dirParts.findIndex((p) => p === "api" || p === "routes");
    if (apiIndex >= 0 && apiIndex < dirParts.length - 1) {
      return dirParts[apiIndex + 1];
    }
    return "api";
  }

  if (dirParts.includes("components")) {
    if (dirParts.includes("ui")) {
      return "ui-components";
    }
    return "components";
  }

  const meaningfulDirs = dirParts.filter(
    (p) => !["src", "lib", "app", "pages", "components"].includes(p)
  );

  if (meaningfulDirs.length > 0) {
    return meaningfulDirs[0];
  }

  return (
    dirParts[0] || parts[parts.length - 1].replace(/\.(ts|tsx|js|jsx)$/, "")
  );
}

/**
 * Infer feature category from file path
 */
export function inferFeatureCategory(
  filePath: string,
  tags?: string[]
): FeatureCategory {
  const lowerPath = filePath.toLowerCase();
  const lowerTags = tags?.map((t) => t.toLowerCase()) || [];

  if (lowerTags.some((t) => t.includes("auth") || t.includes("session"))) {
    return "Authentication";
  }

  if (
    lowerTags.some((t) => t.includes("analytics") || t.includes("tracking"))
  ) {
    return "Analytics";
  }

  if (
    lowerPath.includes("/api/") ||
    lowerPath.includes("/routes/") ||
    lowerPath.includes("/endpoints/")
  ) {
    return "API";
  }

  if (
    lowerPath.includes("/components/") ||
    lowerPath.includes("/pages/") ||
    lowerPath.includes("/ui/")
  ) {
    return "UI";
  }

  if (
    lowerPath.includes("/auth/") ||
    lowerPath.includes("/authentication/") ||
    lowerPath.includes("/session/")
  ) {
    return "Authentication";
  }

  if (
    lowerPath.includes("/analytics/") ||
    lowerPath.includes("/tracking/") ||
    lowerPath.includes("/metrics/")
  ) {
    return "Analytics";
  }

  if (lowerPath.includes("/services/") || lowerPath.includes("/business/")) {
    return "Services";
  }

  if (
    lowerPath.includes("/config/") ||
    lowerPath.includes("/setup/") ||
    lowerPath.includes("/deployment/")
  ) {
    return "Infrastructure";
  }

  if (
    lowerPath.includes("/utils/") ||
    lowerPath.includes("/helpers/") ||
    lowerPath.includes("/shared/")
  ) {
    return "Utilities";
  }

  return "Services";
}

/**
 * Infer feature role from file path and name
 */
export function inferFeatureRole(
  filePath: string,
  fileName: string
): FeatureRole {
  const lowerPath = filePath.toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (
    lowerName.includes("page.") ||
    lowerName.includes("route.") ||
    lowerName.includes("index.") ||
    lowerPath.includes("/pages/") ||
    lowerPath.includes("/routes/")
  ) {
    return "entry_point";
  }

  if (
    lowerName.includes("config") ||
    lowerName.includes(".config.") ||
    lowerPath.includes("/config/")
  ) {
    return "config";
  }

  if (lowerPath.includes("/components/") || lowerName.startsWith("component")) {
    return "component";
  }

  if (lowerPath.includes("/services/") || lowerName.includes("service")) {
    return "service";
  }

  return "helper";
}

/**
 * Convert feature ID to display name
 */
export function featureIdToName(featureId: string): string {
  return featureId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Merge feature entry
 */
export function mergeFeatureEntry(
  existing: Feature,
  newData: Partial<Feature>
): Feature {
  return {
    ...existing,
    ...newData,
    files: [...new Set([...existing.files, ...(newData.files || [])])],
    userFlows: [
      ...new Set([...existing.userFlows, ...(newData.userFlows || [])]),
    ],
    tags: [...new Set([...existing.tags, ...(newData.tags || [])])],
    dependencies: [
      ...new Set([...existing.dependencies, ...(newData.dependencies || [])]),
    ],
    filesByAction: {
      ...existing.filesByAction,
      ...(newData.filesByAction || {}),
    },
    // Update diagrams if provided (new diagrams override old ones)
    mermaidDiagram: newData.mermaidDiagram ?? existing.mermaidDiagram,
    mermaidJourney: newData.mermaidJourney ?? existing.mermaidJourney,
    mermaidSequence: newData.mermaidSequence ?? existing.mermaidSequence,
  };
}

/**
 * Read features.json from repository
 */
export async function readFeaturesManifest(
  repoRoot: string
): Promise<FeaturesManifest | null> {
  const featuresPath = path.join(repoRoot, ".startblock", "features.json");

  try {
    await fs.access(featuresPath);
    const content = await fs.readFile(featuresPath, "utf-8");
    return JSON.parse(content) as FeaturesManifest;
  } catch {
    return null;
  }
}

/**
 * Write features.json to repository
 */
export async function writeFeaturesManifest(
  repoRoot: string,
  manifest: FeaturesManifest
): Promise<void> {
  const featuresPath = path.join(repoRoot, ".startblock", "features.json");
  const featuresDir = path.dirname(featuresPath);

  await fs.mkdir(featuresDir, { recursive: true });

  manifest.lastUpdated = new Date().toISOString();

  await fs.writeFile(featuresPath, JSON.stringify(manifest, null, 2), "utf-8");
}

/**
 * Update or create feature entry in features.json
 * Validates that filesByAction is provided when userFlows exist
 */
export async function updateFeatureEntry(
  repoRoot: string,
  featureData: Partial<Feature> & { id: string }
): Promise<void> {
  // Validate: if userFlows exist, filesByAction must be provided and non-empty
  const userFlows = featureData.userFlows || [];
  const filesByAction = featureData.filesByAction || {};

  if (userFlows.length > 0) {
    // Check if filesByAction has entries for all userFlows
    const missingActions = userFlows.filter(
      (flow) => !filesByAction[flow] || filesByAction[flow].length === 0
    );

    if (missingActions.length > 0) {
      console.warn(
        `Warning: Feature "${
          featureData.id
        }" has userFlows but missing filesByAction for: ${missingActions.join(
          ", "
        )}`
      );
      // Don't fail, but warn - the caller should populate filesByAction
    }
  }

  let manifest = await readFeaturesManifest(repoRoot);

  if (!manifest) {
    manifest = {
      version: "1.0",
      lastUpdated: new Date().toISOString(),
      features: [],
    };
  }

  const existingIndex = manifest.features.findIndex(
    (f) => f.id === featureData.id
  );

  if (existingIndex >= 0) {
    manifest.features[existingIndex] = mergeFeatureEntry(
      manifest.features[existingIndex],
      featureData
    );
  } else {
    const newFeature: Feature = {
      id: featureData.id,
      name: featureData.name || featureIdToName(featureData.id),
      description: featureData.description || "",
      category: featureData.category || "Services",
      entryPoint: featureData.entryPoint,
      userFlows: userFlows,
      mermaidDiagram: featureData.mermaidDiagram,
      mermaidJourney: featureData.mermaidJourney,
      mermaidSequence: featureData.mermaidSequence,
      files: featureData.files || [],
      filesByAction: filesByAction,
      dependencies: featureData.dependencies || [],
      tags: featureData.tags || [],
    };
    manifest.features.push(newFeature);
  }

  await writeFeaturesManifest(repoRoot, manifest);
}

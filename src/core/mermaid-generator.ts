/**
 * Mermaid Diagram Generation
 *
 * Generates Mermaid flowcharts from user flows and architecture diagrams
 */

import type { Feature } from "./features.js";

/**
 * Generate a Mermaid flowchart from user flows
 *
 * @param featureName - Name of the feature
 * @param userFlows - Array of user-facing actions/flows
 * @param files - Optional array of file paths (for future enhancement)
 * @returns Mermaid diagram code as a string
 */
export function generateMermaidFromUserFlows(
  featureName: string,
  userFlows: string[],
  files?: string[]
): string {
  if (!userFlows || userFlows.length === 0) {
    return "";
  }

  // Clean feature name for node IDs (remove special chars, spaces -> underscores)
  const cleanFeatureName = featureName
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();

  // Generate flowchart TD (top-down) diagram
  let diagram = "flowchart TD\n";

  // Add start node
  diagram += `  Start([${featureName}])\n`;

  // Create nodes for each user flow
  const nodes: string[] = [];
  userFlows.forEach((flow, index) => {
    // Clean flow text for node label (keep readable but safe)
    const nodeId = `${cleanFeatureName}_${index + 1}`;
    const nodeLabel = flow.length > 50 ? flow.substring(0, 47) + "..." : flow;

    nodes.push(nodeId);
    diagram += `  ${nodeId}[${nodeLabel}]\n`;
  });

  // Connect start to first node
  if (nodes.length > 0) {
    diagram += `  Start --> ${nodes[0]}\n`;
  }

  // Connect nodes sequentially
  for (let i = 0; i < nodes.length - 1; i++) {
    diagram += `  ${nodes[i]} --> ${nodes[i + 1]}\n`;
  }

  // Add end node if we have flows
  if (nodes.length > 0) {
    diagram += `  ${nodes[nodes.length - 1]} --> End([Complete])\n`;
  }

  return diagram;
}

/**
 * Generate a Mermaid journey diagram from user flows
 * Shows high-level user journey through the feature
 *
 * @param featureName - Name of the feature
 * @param userFlows - Array of user-facing actions/flows
 * @returns Mermaid journey diagram code as a string
 */
export function generateMermaidJourney(
  featureName: string,
  userFlows: string[]
): string {
  if (!userFlows || userFlows.length === 0) {
    return "";
  }

  // Group flows into logical sections (for now, just one section)
  // Future: Could use AI to group flows into sections
  let diagram = `journey
  title ${featureName}
  section User Actions\n`;

  userFlows.forEach((flow, index) => {
    // Clean flow text for journey (keep readable, limit length)
    const cleanFlow = flow.length > 40 ? flow.substring(0, 37) + "..." : flow;
    // Journey format: Action: score: Actor(s)
    // Score 1-5, default to 3 (moderate complexity)
    diagram += `    ${cleanFlow}: 3: User\n`;
  });

  return diagram;
}

/**
 * Generate a Mermaid sequence diagram showing action → file interactions
 * Maps each user flow action to the files that are involved
 *
 * @param featureName - Name of the feature
 * @param userFlows - Array of user-facing actions/flows
 * @param filesByAction - Map of user flow text → array of file paths
 * @param entryPoint - Optional entry point file
 * @returns Mermaid sequence diagram code as a string
 */
export function generateMermaidSequence(
  featureName: string,
  userFlows: string[],
  filesByAction: Record<string, string[]>,
  entryPoint?: string
): string {
  if (!userFlows || userFlows.length === 0) {
    return "";
  }

  // Collect all unique participants (files)
  const participants = new Set<string>();
  if (entryPoint) {
    participants.add(entryPoint);
  }

  userFlows.forEach((flow) => {
    const files = filesByAction[flow] || [];
    files.forEach((file) => {
      participants.add(file);
    });
  });

  if (participants.size === 0) {
    return "";
  }

  // Generate sequence diagram
  let diagram = "sequenceDiagram\n";

  // Add User as first participant
  diagram += `    participant User\n`;

  // Add file participants (limit to reasonable number, prioritize entry point)
  const participantList = Array.from(participants);
  if (entryPoint && participantList.includes(entryPoint)) {
    // Move entry point to front
    const entryIndex = participantList.indexOf(entryPoint);
    participantList.splice(entryIndex, 1);
    participantList.unshift(entryPoint);
  }

  // Limit to 8 participants to keep diagram readable
  participantList.slice(0, 8).forEach((file) => {
    // Shorten file paths for readability
    const shortName =
      file.length > 25 ? "..." + file.substring(file.length - 22) : file;
    const cleanName = shortName.replace(/[^a-zA-Z0-9._/-]/g, "_");
    diagram += `    participant ${cleanName} as ${shortName}\n`;
  });

  // Add interactions for each user flow
  userFlows.forEach((flow, flowIndex) => {
    const files = filesByAction[flow] || [];
    if (files.length === 0) return;

    // Clean flow text for message
    const cleanFlow = flow.length > 50 ? flow.substring(0, 47) + "..." : flow;

    if (flowIndex === 0) {
      // First flow: User → entry point or first file
      const targetFile = entryPoint || files[0];
      const shortTarget =
        targetFile.length > 25
          ? "..." + targetFile.substring(targetFile.length - 22)
          : targetFile;
      const cleanTarget = shortTarget.replace(/[^a-zA-Z0-9._/-]/g, "_");
      diagram += `    User->>${cleanTarget}: ${cleanFlow}\n`;
    } else {
      // Subsequent flows: connect from previous file to current files
      const prevFiles = filesByAction[userFlows[flowIndex - 1]] || [];
      const fromFile = prevFiles[0] || entryPoint || files[0];
      const toFile = files[0];

      if (fromFile && toFile && fromFile !== toFile) {
        const shortFrom =
          fromFile.length > 25
            ? "..." + fromFile.substring(fromFile.length - 22)
            : fromFile;
        const shortTo =
          toFile.length > 25
            ? "..." + toFile.substring(toFile.length - 22)
            : toFile;
        const cleanFrom = shortFrom.replace(/[^a-zA-Z0-9._/-]/g, "_");
        const cleanTo = shortTo.replace(/[^a-zA-Z0-9._/-]/g, "_");
        diagram += `    ${cleanFrom}->>${cleanTo}: ${cleanFlow}\n`;
      }
    }

    // Add interactions between files in this action
    for (let i = 0; i < files.length - 1; i++) {
      const fromFile = files[i];
      const toFile = files[i + 1];
      const shortFrom =
        fromFile.length > 25
          ? "..." + fromFile.substring(fromFile.length - 22)
          : fromFile;
      const shortTo =
        toFile.length > 25
          ? "..." + toFile.substring(toFile.length - 22)
          : toFile;
      const cleanFrom = shortFrom.replace(/[^a-zA-Z0-9._/-]/g, "_");
      const cleanTo = shortTo.replace(/[^a-zA-Z0-9._/-]/g, "_");
      diagram += `    ${cleanFrom}->>${cleanTo}: process\n`;
    }
  });

  return diagram;
}

/**
 * Generate a high-level architecture diagram showing feature relationships
 *
 * @param features - Array of features
 * @param categories - Optional array of category names (if not provided, inferred from features)
 * @returns Mermaid diagram code as a string
 */
export function generateArchitectureMermaid(
  features: Feature[],
  categories?: string[]
): string {
  if (!features || features.length === 0) {
    return "";
  }

  // Group features by category
  const featuresByCategory: Record<string, Feature[]> = {};
  features.forEach((feature) => {
    const cat = feature.category || "Services";
    if (!featuresByCategory[cat]) {
      featuresByCategory[cat] = [];
    }
    featuresByCategory[cat].push(feature);
  });

  const categoryList = categories || Object.keys(featuresByCategory);

  if (categoryList.length === 0) {
    return "";
  }

  // Generate flowchart with subgraphs for each category
  let diagram = "flowchart TB\n";

  // Create subgraphs for each category
  categoryList.forEach((category, catIndex) => {
    const categoryFeatures = featuresByCategory[category] || [];
    if (categoryFeatures.length === 0) return;

    const cleanCatName = category.replace(/[^a-zA-Z0-9]/g, "_");
    diagram += `  subgraph ${cleanCatName}["${category}"]\n`;

    categoryFeatures.forEach((feature, featIndex) => {
      const cleanFeatureId = feature.id.replace(/[^a-zA-Z0-9]/g, "_");
      const nodeId = `${cleanCatName}_${cleanFeatureId}`;
      const displayName =
        feature.name.length > 30
          ? feature.name.substring(0, 27) + "..."
          : feature.name;

      diagram += `    ${nodeId}["${displayName}"]\n`;
    });

    diagram += `  end\n`;
  });

  // Add connections based on dependencies
  categoryList.forEach((category) => {
    const categoryFeatures = featuresByCategory[category] || [];
    categoryFeatures.forEach((feature) => {
      if (feature.dependencies && feature.dependencies.length > 0) {
        const cleanCatName = category.replace(/[^a-zA-Z0-9]/g, "_");
        const cleanFeatureId = feature.id.replace(/[^a-zA-Z0-9]/g, "_");
        const fromNodeId = `${cleanCatName}_${cleanFeatureId}`;

        feature.dependencies.forEach((depId) => {
          // Find the dependency feature
          const depFeature = features.find((f) => f.id === depId);
          if (depFeature) {
            const depCategory = depFeature.category || "Services";
            const depCleanCatName = depCategory.replace(/[^a-zA-Z0-9]/g, "_");
            const depCleanFeatureId = depId.replace(/[^a-zA-Z0-9]/g, "_");
            const toNodeId = `${depCleanCatName}_${depCleanFeatureId}`;

            diagram += `  ${toNodeId} --> ${fromNodeId}\n`;
          }
        });
      }
    });
  });

  return diagram;
}

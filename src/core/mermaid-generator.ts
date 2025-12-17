/**
 * Mermaid Diagram Generation
 *
 * Generates Mermaid flowcharts from user flows and architecture diagrams
 */

import type { Feature } from "./features.js";
import type { FileNode } from "./dependency-graph.js";

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

/**
 * Generate connected architecture diagram using dependency graph
 * Shows real connections between features based on file imports
 *
 * @param features - Array of features
 * @param graph - Dependency graph (Map of file path to FileNode)
 * @returns Mermaid diagram code as a string
 */
export function generateConnectedArchitecture(
  features: Feature[],
  graph: Map<string, FileNode>
): string {
  if (!features || features.length === 0) {
    return "";
  }

  // Build a map of file -> feature(s) that contain it
  const fileToFeatures = new Map<string, string[]>();
  features.forEach((feature) => {
    feature.files.forEach((file) => {
      if (!fileToFeatures.has(file)) {
        fileToFeatures.set(file, []);
      }
      fileToFeatures.get(file)!.push(feature.id);
    });
  });

  // Build feature-to-feature connections based on file imports
  const featureConnections = new Map<string, Set<string>>();
  features.forEach((feature) => {
    featureConnections.set(feature.id, new Set());
  });

  // For each file in the graph, check its imports
  // If it connects files from different features, add a connection
  for (const [filePath, node] of graph.entries()) {
    const fromFeatures = fileToFeatures.get(filePath) || [];

    for (const importPath of node.imports) {
      const toFeatures = fileToFeatures.get(importPath) || [];

      fromFeatures.forEach((fromFeature) => {
        toFeatures.forEach((toFeature) => {
          if (fromFeature !== toFeature) {
            featureConnections.get(fromFeature)?.add(toFeature);
          }
        });
      });
    }
  }

  // Separate features into entry points and services
  const entryPoints: Feature[] = [];
  const services: Feature[] = [];
  const apis: Feature[] = [];

  features.forEach((feature) => {
    if (feature.entryPoint || feature.category === "API") {
      apis.push(feature);
    } else if (feature.category === "Services") {
      services.push(feature);
    } else {
      entryPoints.push(feature);
    }
  });

  // Generate flowchart LR (left-right) diagram
  let diagram = "flowchart LR\n";

  // Create Entry Points subgraph
  if (apis.length > 0) {
    const cleanEntryName = "Entry";
    diagram += `  subgraph ${cleanEntryName}["Entry Points"]\n`;
    apis.forEach((feature) => {
      const cleanFeatureId = feature.id.replace(/[^a-zA-Z0-9]/g, "_");
      const nodeId = `${cleanEntryName}_${cleanFeatureId}`;
      const displayName =
        feature.name.length > 25
          ? feature.name.substring(0, 22) + "..."
          : feature.name;
      diagram += `    ${nodeId}["${displayName}"]\n`;
    });
    diagram += `  end\n`;
  }

  // Create Services subgraph
  if (services.length > 0) {
    const cleanServicesName = "Services";
    diagram += `  subgraph ${cleanServicesName}["Services"]\n`;
    services.forEach((feature) => {
      const cleanFeatureId = feature.id.replace(/[^a-zA-Z0-9]/g, "_");
      const nodeId = `${cleanServicesName}_${cleanFeatureId}`;
      const displayName =
        feature.name.length > 25
          ? feature.name.substring(0, 22) + "..."
          : feature.name;
      diagram += `    ${nodeId}["${displayName}"]\n`;
    });
    diagram += `  end\n`;
  }

  // Add connections between features
  featureConnections.forEach((connectedFeatures, featureId) => {
    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;

    const featureCategory = feature.category || "Services";
    const cleanCatName =
      featureCategory === "API"
        ? "Entry"
        : featureCategory.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanFeatureId = featureId.replace(/[^a-zA-Z0-9]/g, "_");
    const fromNodeId = `${cleanCatName}_${cleanFeatureId}`;

    connectedFeatures.forEach((connectedFeatureId) => {
      const connectedFeature = features.find(
        (f) => f.id === connectedFeatureId
      );
      if (!connectedFeature) return;

      const connectedCategory = connectedFeature.category || "Services";
      const connectedCleanCatName =
        connectedCategory === "API"
          ? "Entry"
          : connectedCategory.replace(/[^a-zA-Z0-9]/g, "_");
      const connectedCleanFeatureId = connectedFeatureId.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );
      const toNodeId = `${connectedCleanCatName}_${connectedCleanFeatureId}`;

      // Only add edge if both nodes exist
      const fromExists =
        (featureCategory === "API" && apis.includes(feature)) ||
        (featureCategory === "Services" && services.includes(feature));
      const toExists =
        (connectedCategory === "API" && apis.includes(connectedFeature)) ||
        (connectedCategory === "Services" &&
          services.includes(connectedFeature));

      if (fromExists && toExists) {
        diagram += `  ${fromNodeId} --> ${toNodeId}\n`;
      }
    });
  });

  return diagram;
}

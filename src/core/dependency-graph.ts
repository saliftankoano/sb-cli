import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as path from "path";
import { readFileSafe } from "../utils/file-utils.js";

export interface FileNode {
  path: string;
  imports: string[];
  importedBy: string[];
}

export interface DependencyContext {
  dependencies: Array<{ path: string; exports: string[] }>;
  dependents: string[];
}

/**
 * Extended dependency graph for architecture visualization
 */
export interface DependencyGraph {
  nodes: Map<string, FileNode>;
  edges: Array<{
    from: string;
    to: string;
    type: "imports" | "exports";
  }>;
}

/**
 * Parse imports from a JavaScript/TypeScript file
 */
export async function parseImports(filePath: string): Promise<string[]> {
  const content = await readFileSafe(filePath);
  if (!content) return [];

  try {
    const ast = parser.parse(content, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      errorRecovery: true,
    });

    const imports: string[] = [];

    traverse(ast, {
      ImportDeclaration(path) {
        const importPath = path.node.source.value;
        imports.push(importPath);
      },
      // Also handle require() calls
      CallExpression(path) {
        if (
          path.node.callee.type === "Identifier" &&
          path.node.callee.name === "require" &&
          path.node.arguments[0]?.type === "StringLiteral"
        ) {
          imports.push(path.node.arguments[0].value);
        }
      },
    });

    return imports;
  } catch (error) {
    // If parsing fails, return empty array
    return [];
  }
}

/**
 * Resolve import path to absolute file path
 */
export function resolveImportPath(
  importStr: string,
  fromFile: string,
  repoRoot: string
): string | null {
  // Skip external packages (node_modules)
  if (!importStr.startsWith(".") && !importStr.startsWith("/")) {
    return null;
  }

  const fromDir = path.dirname(fromFile);
  const resolved = path.resolve(repoRoot, fromDir, importStr);

  // Try common extensions
  const extensions = [".ts", ".tsx", ".js", ".jsx", ""];
  for (const ext of extensions) {
    const withExt = resolved + ext;
    return withExt;
  }

  return null;
}

/**
 * Build dependency graph for a list of files
 */
export async function buildDependencyGraph(
  files: string[],
  repoRoot: string
): Promise<Map<string, FileNode>> {
  const graph = new Map<string, FileNode>();

  // Initialize nodes
  for (const file of files) {
    graph.set(file, {
      path: file,
      imports: [],
      importedBy: [],
    });
  }

  // Parse imports and build relationships
  for (const file of files) {
    const imports = await parseImports(path.join(repoRoot, file));
    const node = graph.get(file)!;

    for (const imp of imports) {
      const resolved = resolveImportPath(imp, file, repoRoot);
      if (resolved && graph.has(resolved)) {
        node.imports.push(resolved);
        graph.get(resolved)!.importedBy.push(file);
      }
    }
  }

  return graph;
}

/**
 * Get dependency context for a file
 */
export function getDependencyContext(
  filePath: string,
  graph: Map<string, FileNode>
): DependencyContext {
  const node = graph.get(filePath);
  if (!node) {
    return { dependencies: [], dependents: [] };
  }

  return {
    dependencies: node.imports.map((p) => ({
      path: p,
      exports: [], // Could parse exports in future
    })),
    dependents: node.importedBy,
  };
}

/**
 * Convert Map<string, FileNode> to DependencyGraph format
 * Used for architecture visualization
 */
export function toDependencyGraph(
  graph: Map<string, FileNode>
): DependencyGraph {
  const edges: Array<{
    from: string;
    to: string;
    type: "imports" | "exports";
  }> = [];

  for (const [filePath, node] of graph.entries()) {
    for (const importPath of node.imports) {
      edges.push({
        from: filePath,
        to: importPath,
        type: "imports",
      });
    }
  }

  return { nodes: graph, edges };
}

/**
 * Find files that are "hub" files (many dependents)
 */
export function findHubFiles(
  graph: Map<string, FileNode>,
  minDependents: number = 3
): string[] {
  const hubs: string[] = [];

  for (const [filePath, node] of graph.entries()) {
    if (node.importedBy.length >= minDependents) {
      hubs.push(filePath);
    }
  }

  return hubs.sort((a, b) => {
    const aDeps = graph.get(a)?.importedBy.length || 0;
    const bDeps = graph.get(b)?.importedBy.length || 0;
    return bDeps - aDeps; // Sort descending
  });
}

/**
 * Get files that share common imports (potential feature grouping)
 */
export function findFilesWithCommonImports(
  graph: Map<string, FileNode>,
  minCommonImports: number = 2
): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  // For each file, find other files that share imports
  for (const [filePath, node] of graph.entries()) {
    const similarFiles: string[] = [];

    for (const [otherPath, otherNode] of graph.entries()) {
      if (filePath === otherPath) continue;

      // Count common imports
      const commonImports = node.imports.filter((imp) =>
        otherNode.imports.includes(imp)
      );

      if (commonImports.length >= minCommonImports) {
        similarFiles.push(otherPath);
      }
    }

    if (similarFiles.length > 0) {
      groups.set(filePath, similarFiles);
    }
  }

  return groups;
}

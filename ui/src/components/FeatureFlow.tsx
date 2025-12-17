import { useMemo, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  MarkerType,
  Handle,
  Position,
  type NodeProps,
  ReactFlowProvider,
} from "reactflow";
import { motion } from "framer-motion";
import "reactflow/dist/style.css";
import type { Feature } from "../lib/api";

interface FeatureFlowProps {
  feature: Feature;
  height?: number;
}

// Helper to create a readable label
function truncate(text: string, len = 48) {
  return text.length > len ? `${text.slice(0, len - 3)}...` : text;
}

// Custom Node Component: Glowing Node
const GlowingNode = ({ data, isConnectable, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`relative group w-[250px] cursor-pointer transition-all duration-300 ${
        selected ? "scale-105 z-50" : "hover:scale-105"
      }`}
    >
      {/* Animated Glow Gradient */}
      <div
        className={`absolute -inset-[2px] rounded-xl blur-sm transition-all duration-500 ${
          selected
            ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60"
            : "bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 opacity-40 group-hover:opacity-100"
        }`}
      ></div>

      {/* Main Content */}
      <div className="relative px-6 py-5 bg-gray-950 rounded-xl ring-1 ring-white/10 flex flex-col items-center justify-center text-center backdrop-blur-xl min-h-[80px]">
        <span className="text-gray-100 font-medium text-sm tracking-wide leading-relaxed break-words w-full">
          {data.label}
        </span>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-gray-950 !border-2 !border-cyan-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-gray-950 !border-2 !border-emerald-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-gray-950 !border-2 !border-purple-500 !bottom-[-6px]"
      />
    </motion.div>
  );
};

// Custom Node Component: File Node (Sub-node)
const FileNode = ({ data, isConnectable }: NodeProps) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative group min-w-[180px]"
    >
      <div className="absolute -inset-[1px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg opacity-50"></div>
      <div className="relative px-4 py-3 bg-gray-900 rounded-lg ring-1 ring-white/5 flex items-center justify-center text-center">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
            File
          </span>
          <span className="text-gray-300 font-mono text-xs">
            {truncate(data.label, 30)}
          </span>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!w-2 !h-2 !bg-gray-700 !border-0"
      />
    </motion.div>
  );
};

export default function FeatureFlow({
  feature,
  height = 600,
}: FeatureFlowProps) {
  // Store collapsed state (IDs of nodes that are collapsed/hidden)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  // Store selected node to show file panel
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const nodeTypes = useMemo(
    () => ({
      glowing: GlowingNode,
      file: FileNode,
    }),
    []
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#64748b", strokeWidth: 2 },
    }),
    []
  );

  // Build the graph dynamically based on selection
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const flows = feature.userFlows || [];

    // Calculate layout parameters
    const startY = 100;
    const fileGap = 200;
    const flowGapBase = 350;

    // Wrapping constants
    const MAX_ROW_WIDTH = 1400; // Wrap after ~1400px
    const ROW_HEIGHT = 500; // Vertical space between wrapped rows

    // Track positions
    let currentFlowX = 0;
    let currentFlowY = startY;

    // 1. Create User Flow Nodes (Top Layer)
    flows.forEach((flow, idx) => {
      const flowId = `flow-${idx}`;
      const isCollapsed = collapsedIds.has(flowId);
      const files = feature.filesByAction?.[flow] || [];

      // Calculate width needed for this flow's files
      // Minimum width is the flowGapBase, but expands if many files
      const filesWidth = Math.max(flowGapBase, files.length * fileGap);

      // Check for wrapping condition
      // If we're not the first item, and adding this item exceeds max width
      if (idx > 0 && currentFlowX + filesWidth > MAX_ROW_WIDTH) {
        currentFlowX = 0;
        currentFlowY += ROW_HEIGHT;
      }

      // Center flow node within its allocated width slot
      const flowX = currentFlowX + filesWidth / 2;

      nodes.push({
        id: flowId,
        type: "glowing",
        position: { x: flowX, y: currentFlowY },
        data: {
          label: flow,
          isInteractive: true,
          idx,
        },
        selected: selectedNodeId === flowId, // Visual feedback for selected state
      });

      // 2. Create File Nodes (Sub-layer) if NOT collapsed
      if (!isCollapsed && files.length > 0) {
        // Center the group of files relative to the flow node's slot
        const startFileX =
          currentFlowX +
          (filesWidth - files.length * fileGap) / 2 +
          fileGap / 2;
        const currentFileY = currentFlowY + 250; // Relative to current row Y

        files.forEach((file, fileIdx) => {
          const fileId = `file-${idx}-${fileIdx}`;
          // Center file node relative to its slot
          const fileX = startFileX + fileIdx * fileGap - 90; // 90 is half of min-w-[180px]

          nodes.push({
            id: fileId,
            type: "file",
            position: { x: fileX, y: currentFileY },
            data: { label: file },
            parentNode: undefined,
          });

          // Edge from Flow Node -> File Node
          edges.push({
            id: `edge-expand-${idx}-${fileIdx}`,
            source: flowId,
            sourceHandle: "bottom",
            target: fileId,
            type: "default",
            animated: true,
            style: { stroke: "#a855f7", strokeWidth: 2, opacity: 0.6 },
          });
        });
      }

      // Advance X position for next flow group
      currentFlowX += filesWidth + 80; // 80px padding between groups
    });

    return { nodes, edges };
  }, [feature, collapsedIds, selectedNodeId]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.id.startsWith("flow-")) {
      // Toggle collapsed state
      setCollapsedIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });

      // Toggle selected state for file panel
      setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
    }
  }, []);

  // Get files for selected node
  const selectedFiles = useMemo(() => {
    if (!selectedNodeId || !selectedNodeId.startsWith("flow-")) {
      return [];
    }
    const flowIndex = parseInt(selectedNodeId.replace("flow-", ""));
    const flow = feature.userFlows?.[flowIndex];
    if (!flow) return [];
    return feature.filesByAction?.[flow] || [];
  }, [selectedNodeId, feature]);

  if (!feature.userFlows?.length) {
    return (
      <div className="h-[420px] flex items-center justify-center border border-gray-800 bg-gray-950 rounded-lg">
        <p className="text-sm text-gray-500">No flow data available.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div
        style={{ height }}
        className="flex-1 rounded-xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl relative"
      >
        <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur px-3 py-2 rounded-lg border border-gray-800 text-xs text-gray-400 pointer-events-none">
          <span className="text-blue-400 font-bold">Interactive Mode</span>:
          Click steps to toggle file visibility.
        </div>
        <ReactFlowProvider>
          <ReactFlow
            id={feature.id}
            nodes={initialNodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={defaultEdgeOptions}
            style={{ background: "#020617" }}
          >
            <Background
              gap={20}
              size={1}
              color="#1e293b"
              variant={"dots" as any}
            />
            <Controls
              className="!bg-gray-900 !border-gray-800 [&>button]:!fill-gray-400 hover:[&>button]:!fill-white"
              showInteractive={false}
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* File Panel */}
      {selectedNodeId && selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="w-80 rounded-xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h3 className="text-sm font-semibold text-gray-200 mb-1">
              Files Involved
            </h3>
            <p className="text-xs text-gray-400">
              {
                feature.userFlows?.[
                  parseInt(selectedNodeId.replace("flow-", ""))
                ]
              }
            </p>
          </div>
          <div
            className="p-4 overflow-y-auto"
            style={{ maxHeight: height - 80 }}
          >
            <div className="space-y-2">
              {selectedFiles.map((file, idx) => (
                <motion.div
                  key={file}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <code className="text-xs text-gray-300 font-mono break-all">
                      {file}
                    </code>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

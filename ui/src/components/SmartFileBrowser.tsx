import { useState, useEffect } from "react";
import {
  CaretRight,
  CaretDown,
  FileCode,
  Folder,
  Cube,
  MagnifyingGlass,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import {
  fetchFeatures,
  fetchTree,
  type Feature,
  type TreeNode,
} from "@/lib/api";

interface SmartFileBrowserProps {
  onFileSelect: (path: string) => void;
  selectedFile?: string;
}

export default function SmartFileBrowser({
  onFileSelect,
  selectedFile,
}: SmartFileBrowserProps) {
  const [activeTab, setActiveTab] = useState<"files" | "features">("files");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchFeatures(), fetchTree()])
      .then(([featuresData, treeData]) => {
        setFeatures(featuresData.features);
        setFileTree(treeData.tree);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch browser data:", err);
        setIsLoading(false);
      });
  }, []);

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleFileClick = (path: string) => {
    onFileSelect(path);
    // Add to recent files
    setRecentFiles((prev) => {
      const filtered = prev.filter((f) => f !== path);
      return [path, ...filtered].slice(0, 5);
    });
  };

  // Recursive Tree Renderer
  const renderTree = (nodes: TreeNode[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedNodes.has(node.path);
      const isSelected = selectedFile === node.path;
      const isMatch = node.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Skip if searching and node doesn't match (and isn't a directory containing matches)
      // Note: A real implementation would need recursive filtering logic
      if (searchQuery && node.type === "file" && !isMatch) return null;

      return (
        <div key={node.path} className="select-none">
          <div
            className={`flex items-center gap-2 py-1.5 px-3 cursor-pointer transition-colors text-sm ${
              isSelected
                ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#21262d] border-l-2 border-transparent"
            }`}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
            onClick={() => {
              if (node.type === "directory") toggleNode(node.path);
              else handleFileClick(node.path);
            }}
          >
            {node.type === "directory" ? (
              <span className="text-gray-500 shrink-0">
                {isExpanded ? (
                  <CaretDown size={14} />
                ) : (
                  <CaretRight size={14} />
                )}
              </span>
            ) : (
              <span className="w-3.5 shrink-0" />
            )}

            {node.type === "directory" ? (
              <Folder
                size={16}
                className="text-yellow-600/80 shrink-0"
                weight="fill"
              />
            ) : (
              <FileCode size={16} className="text-blue-500/60 shrink-0" />
            )}

            <span className="truncate">{node.name}</span>

            {node.importance === "high" && (
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 ml-auto shrink-0" />
            )}
          </div>

          {node.type === "directory" && isExpanded && node.children && (
            <div>{renderTree(node.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#161b22] border-r border-[#30363d] w-full">
      {/* Search Header */}
      <div className="p-4 border-b border-[#30363d]">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-2.5 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-2 pl-9 pr-3 text-sm text-[#e6edf3] placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#30363d]">
        <button
          onClick={() => setActiveTab("files")}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "files"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "features"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          Features
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Loading...
          </div>
        ) : (
          <>
            {/* Recent Files (only on empty search) */}
            {!searchQuery && recentFiles.length > 0 && (
              <div className="py-4 border-b border-[#30363d]">
                <div className="px-4 mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                  <ClockCounterClockwise size={14} />
                  <span>Recent</span>
                </div>
                {recentFiles.map((path) => (
                  <div
                    key={path}
                    onClick={() => onFileSelect(path)}
                    className="px-4 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-[#21262d] cursor-pointer truncate flex items-center gap-2"
                  >
                    <FileCode size={14} />
                    {path.split("/").pop()}
                  </div>
                ))}
              </div>
            )}

            {/* Tree / Features List */}
            <div className="py-2">
              {activeTab === "files" ? (
                renderTree(fileTree)
              ) : (
                <div className="px-2">
                  {features.map((feature) => (
                    <div key={feature.id} className="mb-4">
                      <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        <Cube size={14} />
                        {feature.name}
                      </div>
                      <div className="ml-2 border-l border-[#30363d] pl-2 space-y-1">
                        {feature.files.map((file) => (
                          <div
                            key={file}
                            onClick={() => handleFileClick(file)}
                            className={`px-2 py-1.5 rounded text-sm cursor-pointer truncate ${
                              selectedFile === file
                                ? "bg-blue-500/10 text-blue-400"
                                : "text-gray-400 hover:bg-[#21262d] hover:text-gray-200"
                            }`}
                          >
                            {file.split("/").pop()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

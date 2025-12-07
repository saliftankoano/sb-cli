import { useState } from "react";
import { TreeNode } from "@/lib/api";

interface FileTreeProps {
  tree: TreeNode[];
  onFileSelect?: (filePath: string) => void;
  selectedFile?: string;
}

function TreeNodeComponent({
  node,
  level = 0,
  onFileSelect,
  selectedFile,
}: {
  node: TreeNode;
  level?: number;
  onFileSelect?: (filePath: string) => void;
  selectedFile?: string;
}) {
  const [expanded, setExpanded] = useState(level < 2);

  const isSelected = selectedFile === node.path;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
          isSelected ? "bg-blue-100 dark:bg-blue-900" : ""
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else if (node.type === "file" && onFileSelect) {
            onFileSelect(node.path);
          }
        }}
      >
        <span className="mr-2">
          {hasChildren
            ? expanded
              ? "📂"
              : "📁"
            : node.type === "file"
            ? "📄"
            : ""}
        </span>
        <span className="flex-1 text-sm">{node.name}</span>
        {node.hasKnowledge && (
          <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
            ✓
          </span>
        )}
        {node.importance === "critical" && (
          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded ml-1">
            !
          </span>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({
  tree,
  onFileSelect,
  selectedFile,
}: FileTreeProps) {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          File Tree
        </h3>
      </div>
      <div>
        {tree.map((node) => (
          <TreeNodeComponent
            key={node.path}
            node={node}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
      </div>
    </div>
  );
}

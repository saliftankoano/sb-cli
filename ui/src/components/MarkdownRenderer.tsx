import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MermaidDiagram from "./MermaidDiagram";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Custom code block renderer for Mermaid diagrams
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const codeString = String(children).replace(/\n$/, "");

            if (!inline && language === "mermaid") {
              return <MermaidDiagram diagram={codeString} />;
            }

            // Regular code block
            return (
              <code
                className={`${
                  className || ""
                } bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm`}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Custom pre renderer for code blocks
          pre({ children }: any) {
            const child = React.Children.only(children) as any;
            if (child?.props?.className?.includes("language-mermaid")) {
              // MermaidDiagram handles its own container
              return <>{children}</>;
            }
            return (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
                {children}
              </pre>
            );
          },
          // Enhanced link styling
          a({ href, children }: any) {
            return (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={
                  href?.startsWith("http") ? "noopener noreferrer" : undefined
                }
              >
                {children}
              </a>
            );
          },
          // Enhanced heading styling
          h1: ({ children }: any) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
              {children}
            </h1>
          ),
          h2: ({ children }: any) => (
            <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }: any) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">
              {children}
            </h3>
          ),
          // Enhanced list styling
          ul: ({ children }: any) => (
            <ul className="list-disc ml-6 mb-4 space-y-1 text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }: any) => (
            <ol className="list-decimal ml-6 mb-4 space-y-1 text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          // Enhanced paragraph styling
          p: ({ children }: any) => (
            <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              {children}
            </p>
          ),
          // Enhanced blockquote styling
          blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),
          // Enhanced table styling
          table: ({ children }: any) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
                {children}
              </table>
            </div>
          ),
          th: ({ children }: any) => (
            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }: any) => (
            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

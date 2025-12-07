import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export default function Layout({ children, sidebar }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
            {sidebar}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="max-w-5xl mx-auto p-8 pb-32 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

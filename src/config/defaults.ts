export interface SBConfig {
  openai: {
    apiKey?: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  analysis: {
    excludePatterns: string[];
    fileExtensions: string[];
    includeDependencies: boolean;
    maxFilesPerAnalysis: number;
  };
  output: {
    knowledgeDir: string;
  };
}

export const defaultConfig: SBConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    temperature: 0.3,
    maxTokens: 2000,
  },
  analysis: {
    excludePatterns: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "*.test.ts",
      "*.test.js",
      "*.spec.ts",
      "*.spec.js",
      "__tests__/**",
      "coverage/**",
    ],
    fileExtensions: [".ts", ".js", ".tsx", ".jsx", ".py", ".go", ".rs"],
    includeDependencies: true,
    maxFilesPerAnalysis: 10,
  },
  output: {
    knowledgeDir: ".startblock/knowledge",
  },
};

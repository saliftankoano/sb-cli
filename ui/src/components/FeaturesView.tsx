import { useState, useEffect } from "react";
import { fetchFeatures, type Feature, type FeaturesManifest } from "../lib/api";
import {
  CubeIcon,
  ArrowRightIcon,
  TreeStructureIcon,
  ListChecksIcon,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import FeatureFlow from "./FeatureFlow";

export default function FeaturesView({ featureId }: { featureId?: string }) {
  const [manifest, setManifest] = useState<FeaturesManifest | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures().then((data) => {
      setManifest(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (manifest && featureId) {
      const found = manifest.features.find((f) => f.id === featureId);
      if (found) setSelectedFeature(found);
    } else if (manifest && !featureId) {
      setSelectedFeature(null);
    }
  }, [manifest, featureId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!manifest || manifest.features.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No features detected yet.</p>
      </div>
    );
  }

  // Group by category
  const featuresByCategory: Record<string, Feature[]> = {};
  manifest.features.forEach((f) => {
    if (!featuresByCategory[f.category]) featuresByCategory[f.category] = [];
    featuresByCategory[f.category].push(f);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-4">
        {selectedFeature ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-1"
            >
              ← Back to Features
            </button>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {selectedFeature.category}
                    </span>
                    {selectedFeature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedFeature.name}
                  </h1>
                </div>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {selectedFeature.description}
              </p>

              {/* Visual Diagrams First - Interactive React Flow */}
              <div className="space-y-8 mb-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Interactive User Journey
                    </h3>
                    {selectedFeature.mermaidJourney && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Click steps to reveal involved files
                      </span>
                    )}
                  </div>
                  <FeatureFlow
                    feature={selectedFeature}
                    key={selectedFeature.id}
                  />
                </div>
              </div>

              {/* Textual Details Below Diagrams */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                {/* User Flows */}
                {selectedFeature.userFlows.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                      <ListChecksIcon size={20} />
                      User Flows
                    </h3>
                    <ul className="space-y-2">
                      {selectedFeature.userFlows.map((flow, i) => {
                        const filesForFlow =
                          selectedFeature.filesByAction?.[flow] || [];
                        return (
                          <li
                            key={i}
                            className="flex flex-col gap-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg"
                          >
                            <div className="flex items-start gap-2">
                              <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="font-medium text-gray-900 dark:text-gray-200">
                                {flow}
                              </span>
                            </div>
                            {/* Always show file correlation */}
                            {filesForFlow.length > 0 && (
                              <div className="ml-3.5 mt-2 p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                  Files Involved
                                </div>
                                <div className="space-y-1">
                                  {filesForFlow.map((file, j) => (
                                    <div
                                      key={j}
                                      className="font-mono text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                                      {file}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Related Files */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <TreeStructureIcon size={20} />
                    Key Files
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 font-mono text-sm space-y-2">
                    {selectedFeature.entryPoint && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <span className="text-xs uppercase font-bold tracking-wider">
                          Entry
                        </span>
                        {selectedFeature.entryPoint}
                      </div>
                    )}
                    {selectedFeature.files.slice(0, 5).map(
                      (file) =>
                        file !== selectedFeature.entryPoint && (
                          <div
                            key={file}
                            className="text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-gray-200 dark:border-gray-700"
                          >
                            {file}
                          </div>
                        )
                    )}
                    {selectedFeature.files.length > 5 && (
                      <div className="text-gray-400 italic pl-4">
                        ... and {selectedFeature.files.length - 5} more files
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                System Features
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Explore the capabilities and modules of this codebase.
              </p>
            </header>

            {Object.entries(featuresByCategory).map(([category, features]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CubeIcon size={24} className="text-blue-500" />
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((feature) => (
                    <motion.button
                      key={feature.id}
                      onClick={() => setSelectedFeature(feature)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-5 shadow-sm transition-colors group h-full flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                          {feature.name}
                        </span>
                        <ArrowRightIcon
                          size={16}
                          className="text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                        {feature.description || "No description available."}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {feature.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-wider font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

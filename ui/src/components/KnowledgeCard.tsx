import { KnowledgeFile } from "@/lib/api";
import {
  Expandable,
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableTrigger,
  ExpandableContent,
} from "@/components/ui/expandable";
import {
  CaretDownIcon,
  FileTextIcon,
  ShieldWarningIcon,
  PuzzlePieceIcon,
  WallIcon,
  LightbulbIcon,
} from "@phosphor-icons/react";

interface KnowledgeCardProps {
  knowledge: KnowledgeFile;
}

export default function KnowledgeCard({ knowledge }: KnowledgeCardProps) {
  return (
    <Expandable expandDirection="vertical" expandBehavior="push">
      {({ isExpanded }) => (
        <ExpandableTrigger>
          <ExpandableCard
            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-xl"
            collapsedSize={{ height: 140 }}
          >
            <ExpandableCardHeader className="pb-2">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FileTextIcon
                      className="text-blue-500"
                      size={24}
                      weight="duotone"
                    />
                    {knowledge.sourceFile}
                  </h2>
                  <div
                    className={`transform transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <CaretDownIcon size={20} className="text-gray-400" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {knowledge.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {knowledge.importance && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        knowledge.importance === "critical"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                          : knowledge.importance === "high"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {knowledge.importance}
                    </span>
                  )}
                </div>
              </div>
            </ExpandableCardHeader>

            <ExpandableCardContent>
              <ExpandableContent preset="blur-sm" stagger staggerChildren={0.1}>
                <div className="space-y-6 pt-4">
                  {knowledge.content.purpose && (
                    <section>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <LightbulbIcon
                          size={18}
                          className="text-yellow-500"
                          weight="duotone"
                        />
                        Purpose
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {knowledge.content.purpose}
                      </p>
                    </section>
                  )}

                  {knowledge.content.gotchas && (
                    <section>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <ShieldWarningIcon
                          size={18}
                          className="text-red-500"
                          weight="duotone"
                        />
                        Gotchas
                      </h3>
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg p-3">
                        <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                          {knowledge.content.gotchas}
                        </p>
                      </div>
                    </section>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {knowledge.content.dependencies && (
                      <section>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <PuzzlePieceIcon
                            size={18}
                            className="text-purple-500"
                            weight="duotone"
                          />
                          Dependencies
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {knowledge.content.dependencies}
                        </p>
                      </section>
                    )}

                    {knowledge.content.architecture && (
                      <section>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                          <WallIcon
                            size={18}
                            className="text-indigo-500"
                            weight="duotone"
                          />
                          Architecture
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {knowledge.content.architecture}
                        </p>
                      </section>
                    )}
                  </div>

                  {knowledge.content.insights && (
                    <section>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Insights
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {knowledge.content.insights}
                      </p>
                    </section>
                  )}
                </div>
              </ExpandableContent>
            </ExpandableCardContent>

            <ExpandableCardFooter>
              {!isExpanded && (
                <p className="text-xs text-gray-400 mx-auto mt-2">
                  Click to view full dossier
                </p>
              )}
            </ExpandableCardFooter>
          </ExpandableCard>
        </ExpandableTrigger>
      )}
    </Expandable>
  );
}

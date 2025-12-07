import { useJourney } from "@/hooks/useJourney";
import { CheckCircle, Circle, ArrowRight } from "@phosphor-icons/react";
import WelcomeScreen from "./WelcomeScreen";

export default function JourneyView() {
  const { journeySteps, currentFileIndex, goToFile } = useJourney();

  if (journeySteps.length === 0) {
    return <WelcomeScreen />;
  }

  const currentStep = journeySteps[currentFileIndex];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Your Learning Journey
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          Follow the path to understand the codebase. Each step builds on the previous one.
        </p>
      </header>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {journeySteps.map((step, index) => (
          <div key={step.file} className="flex items-center gap-2">
            {step.status === "completed" ? (
              <CheckCircle size={24} className="text-green-500" weight="fill" />
            ) : step.status === "current" ? (
              <Circle size={24} className="text-blue-500" weight="fill" />
            ) : (
              <Circle size={24} className="text-gray-300 dark:text-gray-700" />
            )}
            {index < journeySteps.length - 1 && (
              <div
                className={`h-1 w-16 ${
                  step.status === "completed"
                    ? "bg-green-500"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      {currentStep && (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentStep.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStep.description}
              </p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ⏱️ ~{currentStep.estimatedMinutes} min
            </span>
          </div>
          <button
            onClick={() => goToFile(currentStep.file)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            Explore This File
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Upcoming Steps */}
      {journeySteps.slice(currentFileIndex + 1).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Up Next
          </h3>
          {journeySteps.slice(currentFileIndex + 1).map((step) => (
            <div
              key={step.file}
              className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4 opacity-60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  ⏱️ ~{step.estimatedMinutes} min
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


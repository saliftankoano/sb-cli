import { RocketLaunch, Sparkle, BookOpen, Terminal } from "@phosphor-icons/react";

export default function WelcomeScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4">
            <Sparkle size={20} className="text-blue-400" weight="fill" />
            <span className="text-blue-300 font-medium">Welcome to Startblock</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            Your Codebase Guide
            <span className="block text-4xl md:text-5xl mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Awaits
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Get personalized, voice-guided onboarding through any codebase. 
            Understand the "why" behind the code, not just the "what".
          </p>
        </div>

        {/* Getting Started Card */}
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <RocketLaunch size={24} className="text-blue-600 dark:text-blue-400" weight="duotone" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Let's Get Started
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Run the onboarding command in your terminal to create a personalized learning journey.
              </p>
              
              {/* Command Card */}
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 mb-6 font-mono">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Terminal size={16} />
                  <span>Terminal</span>
                </div>
                <code className="text-green-400 text-lg">sb onboard</code>
              </div>

              {/* What Happens Next */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-purple-500" weight="duotone" />
                  What happens next?
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">1.</span>
                    <span>Answer a few questions about your goals and experience level</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">2.</span>
                    <span>AI analyzes the codebase and selects the most important files for you</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">3.</span>
                    <span>Return here for a voice-guided tour through your personalized journey</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkle size={24} className="text-blue-600 dark:text-blue-400" weight="duotone" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Voice-First Learning
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Talk to your AI guide. Ask questions naturally and get contextual answers.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-purple-600 dark:text-purple-400" weight="duotone" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Personalized Journey
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Files are selected based on your goals. Learn what matters to you.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <RocketLaunch size={24} className="text-green-600 dark:text-green-400" weight="duotone" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Get Unstuck Fast
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Understand architecture, dependencies, and gotchas without asking teammates.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Already ran <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">sb onboard</code>? 
            Refresh this page to see your journey.
          </p>
        </div>
      </div>
    </div>
  );
}


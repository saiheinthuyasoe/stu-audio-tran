import AudioRecorder from "./components/AudioRecorder";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Real-Time Audio Transcription
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Record audio and see live transcription with instant translation
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden px-2 py-4">
          <div className="h-full">
            <AudioRecorder />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Developed by{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Sai Hein Thuy Ya Soe (Zai)
              </span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

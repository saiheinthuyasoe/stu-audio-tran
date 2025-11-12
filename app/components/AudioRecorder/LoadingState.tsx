export function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-4">
          <button
            disabled
            className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg opacity-50 cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
            <span>Loading...</span>
          </button>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Transcript
        </h2>
        <p className="text-gray-400 dark:text-gray-500 italic text-center py-12">
          Loading...
        </p>
      </div>
    </div>
  );
}

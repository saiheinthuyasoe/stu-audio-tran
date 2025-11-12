import { useRef, useEffect } from "react";
import type { TranscriptSegment } from "./types";
import { calculateWordCount } from "./utils";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "./constants";

interface TranscriptDisplayProps {
  transcripts: TranscriptSegment[];
  interimTranscript: string;
  runtimeError: string | null;
  selectedLanguage: LanguageCode;
  interimTranslation?: string;
  onLanguageChange: (language: LanguageCode) => void;
  isRetranslating: boolean;
  translationEnabled: boolean;
  onDismissError?: () => void;
}

export function TranscriptDisplay({
  transcripts,
  interimTranscript,
  runtimeError,
  selectedLanguage,
  interimTranslation,
  onLanguageChange,
  isRetranslating,
  translationEnabled,
  onDismissError,
}: TranscriptDisplayProps) {
  const wordCount = calculateWordCount(transcripts);
  const showTranslation = translationEnabled;
  const originalScrollRef = useRef<HTMLDivElement>(null);
  const translationScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (originalScrollRef.current) {
      originalScrollRef.current.scrollTop =
        originalScrollRef.current.scrollHeight;
    }
    if (translationScrollRef.current) {
      translationScrollRef.current.scrollTop =
        translationScrollRef.current.scrollHeight;
    }
  }, [transcripts, interimTranscript, interimTranslation]);

  return (
    <>
      {/* Error message */}
      {runtimeError && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start justify-between gap-4">
          <p className="text-yellow-800 dark:text-yellow-200 flex-1">
            {runtimeError}
          </p>
          {onDismissError && (
            <button
              onClick={onDismissError}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors shrink-0"
              title="Dismiss"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Transcript display - Split screen if translation is enabled */}
      <div
        className={`grid ${
          showTranslation ? "grid-cols-2 gap-4" : "grid-cols-1"
        } h-full`}
      >
        {/* Original Transcript */}
        <div
          ref={originalScrollRef}
          className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-y-auto scroll-smooth"
        >
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 px-3 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Original Transcript
            </h2>
          </div>

          <div className="p-3">
            {transcripts.length === 0 && !interimTranscript && (
              <p className="text-gray-400 dark:text-gray-500 italic text-center py-12">
                Click &quot;Start Recording&quot; to begin transcription...
              </p>
            )}

            <div className="space-y-2">
              {transcripts.map((segment) => (
                <div
                  key={segment.id}
                  className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {segment.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {segment.text}
                  </p>
                </div>
              ))}

              {interimTranscript && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800 border-dashed">
                  <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                    {interimTranscript}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Translated Transcript */}
        {showTranslation && (
          <div
            ref={translationScrollRef}
            className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-y-auto border-2 border-blue-200 dark:border-blue-700 scroll-smooth"
          >
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 px-3 pt-4 pb-2 border-b border-blue-200 dark:border-blue-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300">
                Translation
              </h2>
              <div className="flex items-center gap-2">
                {isRetranslating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
                <select
                  value={selectedLanguage}
                  onChange={(e) =>
                    onLanguageChange(e.target.value as LanguageCode)
                  }
                  disabled={isRetranslating}
                  title="Select translation language"
                  className={`px-2 py-1 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-md text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isRetranslating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3">
              {transcripts.length === 0 && !interimTranslation && (
                <p className="text-gray-400 dark:text-gray-500 italic text-center py-12">
                  Translations will appear here...
                </p>
              )}

              <div className="space-y-2">
                {transcripts.map((segment) => (
                  <div
                    key={`trans-${segment.id}`}
                    className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {segment.timestamp}
                      </span>
                    </div>
                    <p className="text-blue-900 dark:text-blue-100 leading-relaxed">
                      {segment.translatedText || (
                        <span className="italic text-gray-400">
                          Translating...
                        </span>
                      )}
                    </p>
                  </div>
                ))}

                {interimTranslation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800 border-dashed">
                    <p className="text-blue-600 dark:text-blue-300 italic leading-relaxed">
                      {interimTranslation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {transcripts.length > 0 && (
        <div className="flex justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mt-4 pb-2">
          <div>
            <span className="font-semibold">{transcripts.length}</span> segments
          </div>
          <div>
            <span className="font-semibold">{wordCount}</span> words
          </div>
        </div>
      )}
    </>
  );
}

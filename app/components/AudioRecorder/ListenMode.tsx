"use client";

import { useTextToSpeech } from "./hooks/useTextToSpeech";
import type { TranscriptSegment } from "./types";

interface ListenModeProps {
  transcripts: TranscriptSegment[];
  translationEnabled: boolean;
}

export function ListenMode({
  transcripts,
  translationEnabled,
}: ListenModeProps) {
  const { isPlaying, isPaused, currentIndex, playAll, pause, resume, stop } =
    useTextToSpeech();

  const handlePlay = () => {
    const textsToPlay = translationEnabled
      ? transcripts.map((t) => ({
          ...t,
          text: t.translatedText || t.text,
        }))
      : transcripts;
    playAll(textsToPlay);
  };

  if (transcripts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="flex items-center justify-center w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all transform hover:scale-110"
                title="Play All"
              >
                <svg
                  className="w-5 h-5 ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            ) : isPaused ? (
              <button
                onClick={resume}
                className="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all transform hover:scale-110"
                title="Resume"
              >
                <svg
                  className="w-5 h-5 ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={pause}
                className="flex items-center justify-center w-10 h-10 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full transition-all transform hover:scale-110"
                title="Pause"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                </svg>
              </button>
            )}

            {isPlaying && (
              <button
                onClick={stop}
                className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all transform hover:scale-110"
                title="Stop"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <rect x="5" y="5" width="10" height="10" rx="1" />
                </svg>
              </button>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.072 7.328a1 1 0 00-1.414 0l-2.12 2.12a1 1 0 001.414 1.415l2.12-2.121a1 1 0 000-1.414zM6.707 8.707a1 1 0 00-1.414-1.414l-2.121 2.12a1 1 0 101.414 1.415l2.121-2.121zM10 12a2 2 0 100 4 2 2 0 000-4z" />
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
              </svg>
              Listen Mode
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {isPlaying
                ? isPaused
                  ? "Paused"
                  : `Playing ${currentIndex + 1} of ${transcripts.length}`
                : `${transcripts.length} segment${
                    transcripts.length !== 1 ? "s" : ""
                  } ready`}
              {translationEnabled && " (Translation)"}
            </p>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">
              Speaking...
            </span>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {isPlaying && currentIndex >= 0 && (
        <div className="mt-3">
          <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
            <div
              className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / transcripts.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

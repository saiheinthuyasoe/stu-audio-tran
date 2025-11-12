"use client";

import { useState } from "react";
import { useTextToSpeech } from "./hooks/useTextToSpeech";
import type { TranscriptSegment } from "./types";
import type { LanguageCode } from "./constants";

interface SidebarListenModeProps {
  transcripts: TranscriptSegment[];
  translationEnabled: boolean;
  selectedLanguage?: LanguageCode;
}

export function SidebarListenMode({
  transcripts,
  translationEnabled,
  selectedLanguage,
}: SidebarListenModeProps) {
  const { isPlaying, isPaused, playAll, resume, stop } =
    useTextToSpeech(selectedLanguage);
  const [playMode, setPlayMode] = useState<"original" | "translation">(
    "original"
  );

  const handlePlay = () => {
    if (playMode === "translation" && translationEnabled) {
      const translatedTranscripts = transcripts.map((t) => ({
        ...t,
        text: t.translatedText || t.text,
      }));
      // Play with the target language for better pronunciation
      playAll(translatedTranscripts, selectedLanguage);
    } else {
      // Play original in English (or default language)
      playAll(transcripts, "en");
    }
  };

  if (transcripts.length === 0 || !transcripts) {
    return null;
  }

  const hasTranslations =
    translationEnabled && transcripts.some((t) => t.translatedText);

  return (
    <div className="flex flex-col items-center space-y-2 py-3 border-y border-gray-200 dark:border-gray-700">
      {/* Mode Toggle - Only show if translations are available */}
      {hasTranslations && (
        <div className="flex flex-col items-center gap-1 mb-1">
          <button
            onClick={() =>
              setPlayMode(playMode === "original" ? "translation" : "original")
            }
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all transform hover:scale-110 ${
              playMode === "original"
                ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            }`}
            title={
              playMode === "original"
                ? "Switch to Translation"
                : "Switch to Original"
            }
            disabled={isPlaying}
          >
            {playMode === "original" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <span
            className={`text-xs font-medium ${
              playMode === "original"
                ? "text-purple-700 dark:text-purple-300"
                : "text-blue-700 dark:text-blue-300"
            }`}
          >
            {playMode === "original" ? "Original" : "Translation"}
          </span>
        </div>
      )}

      {/* Playback Controls */}
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className={`flex items-center justify-center w-10 h-10 text-white rounded-full transition-all transform hover:scale-110 ${
            playMode === "original"
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          title={`Listen to ${
            playMode === "original" ? "Original" : "Translation"
          }`}
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
          className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all transform hover:scale-110"
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
          onClick={stop}
          className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all transform hover:scale-110"
          title="Stop"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <rect x="5" y="5" width="10" height="10" rx="1" />
          </svg>
        </button>
      )}

      {/* Playing Indicator */}
      {isPlaying && (
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${
            playMode === "original" ? "bg-purple-500" : "bg-blue-500"
          }`}
        ></div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { HistorySession, TranscriptSegment } from "./types";
import { formatDate, downloadTranscript } from "./utils";
import { useTextToSpeech } from "./hooks/useTextToSpeech";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistorySession[];
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  onLoadSession: (session: HistorySession) => void;
}

export function HistoryModal({
  isOpen,
  onClose,
  history,
  onDeleteSession,
  onClearHistory,
  onLoadSession,
}: HistoryModalProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const { isPlaying, isPaused, currentIndex, playAll, pause, resume, stop } =
    useTextToSpeech();
  const [playingSessionId, setPlayingSessionId] = useState<string | null>(null);

  // Debug: Log when history prop changes
  console.log("HistoryModal - history prop:", history?.length || 0, "sessions");

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all history? This action cannot be undone."
      )
    ) {
      onClearHistory();
    }
  };

  const handlePlaySession = (session: HistorySession) => {
    const textsToPlay = session.translationEnabled
      ? session.transcripts.map((t) => ({
          ...t,
          text: t.translatedText || t.text,
        }))
      : session.transcripts;
    setPlayingSessionId(session.id);
    playAll(textsToPlay);
  };

  const handleStopSession = () => {
    stop();
    setPlayingSessionId(null);
  };

  if (!isOpen) return null;

  const toggleSession = (id: string) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  const handleDownload = (session: HistorySession) => {
    downloadTranscript(session.transcripts, session.translationEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Transcription History
            </h2>
            {history.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({history.length} session{history.length !== 1 ? "s" : ""})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-2"
                title="Delete All History"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete All
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Close"
            >
              <svg
                className="w-6 h-6"
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
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No transcription history yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Session Header */}
                  <div
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleSession(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {formatDate(session.timestamp)}
                          </h3>
                          {session.translationEnabled && (
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                              Translated to{" "}
                              {session.targetLanguage?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {session.transcripts.length} segments • Duration:{" "}
                          {Math.floor(session.duration / 60)}:
                          {(session.duration % 60).toString().padStart(2, "0")}
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedSession === session.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Session Content */}
                  {expandedSession === session.id && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      {/* Transcripts */}
                      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                        {session.transcripts.map(
                          (transcript: TranscriptSegment) => (
                            <div
                              key={transcript.id}
                              className="text-sm p-2 bg-gray-50 dark:bg-gray-700/30 rounded"
                            >
                              <div className="text-gray-800 dark:text-white">
                                {transcript.text}
                              </div>
                              {session.translationEnabled &&
                                transcript.translatedText && (
                                  <div className="text-blue-600 dark:text-blue-400 mt-1 italic">
                                    → {transcript.translatedText}
                                  </div>
                                )}
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {transcript.timestamp}
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {playingSessionId === session.id && isPlaying ? (
                          <>
                            {isPaused ? (
                              <button
                                onClick={resume}
                                className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-2"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                                Resume
                              </button>
                            ) : (
                              <button
                                onClick={pause}
                                className="px-3 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors flex items-center gap-2"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                                </svg>
                                Pause
                              </button>
                            )}
                            <button
                              onClick={handleStopSession}
                              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <rect
                                  x="5"
                                  y="5"
                                  width="10"
                                  height="10"
                                  rx="1"
                                />
                              </svg>
                              Stop
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handlePlaySession(session)}
                            className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center gap-2"
                            disabled={
                              playingSessionId !== null &&
                              playingSessionId !== session.id
                            }
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            Listen
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(session)}
                          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => onLoadSession(session)}
                          className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Load
                        </button>
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { formatTime } from "./utils";
import { SidebarListenMode } from "./SidebarListenMode";
import type { TranscriptSegment } from "./types";
import type { LanguageCode } from "./constants";

interface RecordingControlsProps {
  isRecording: boolean;
  recordingTime: number;
  transcriptCount: number;
  transcripts: TranscriptSegment[];
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearTranscripts: () => void;
  onDownloadTranscript: () => void;
  translationEnabled: boolean;
  selectedLanguage: LanguageCode;
  onToggleTranslation: () => void;
  onOpenHistory: () => void;
  onSaveHistory: () => void;
}

export function RecordingControls({
  isRecording,
  recordingTime,
  transcriptCount,
  transcripts,
  onStartRecording,
  onStopRecording,
  onClearTranscripts,
  onDownloadTranscript,
  translationEnabled,
  selectedLanguage,
  onToggleTranslation,
  onOpenHistory,
  onSaveHistory,
}: RecordingControlsProps) {
  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Record/Stop Button */}
      {!isRecording ? (
        <button
          onClick={onStartRecording}
          className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full font-semibold shadow-lg transition-all transform hover:scale-110"
          title="Start Recording"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={onStopRecording}
          className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white w-12 h-12 rounded-full font-semibold shadow-lg transition-all transform hover:scale-110"
          title="Stop Recording"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <rect x="6" y="6" width="8" height="8" rx="1" />
          </svg>
        </button>
      )}

      {/* Recording Time */}
      {isRecording && (
        <div className="flex flex-col items-center bg-red-50 dark:bg-red-900/20 px-2 py-1.5 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mb-0.5"></div>
          <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">
            {formatTime(recordingTime)}
          </span>
        </div>
      )}

      {/* Listen Mode - Only show when not recording and has transcripts */}
      {!isRecording && transcriptCount > 0 && (
        <SidebarListenMode
          transcripts={transcripts}
          translationEnabled={translationEnabled}
          selectedLanguage={selectedLanguage}
        />
      )}

      {/* Translation Toggle */}
      <button
        onClick={onToggleTranslation}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all transform hover:scale-110 ${
          translationEnabled
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
        }`}
        title={
          translationEnabled ? "Disable Translation" : "Enable Translation"
        }
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* History Button */}
      <button
        onClick={onOpenHistory}
        className="flex items-center justify-center w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-all transform hover:scale-110"
        title="View History"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Action Buttons */}
      {transcriptCount > 0 && (
        <>
          <button
            onClick={onSaveHistory}
            className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all transform hover:scale-110"
            title="Save to History"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
          </button>
          <button
            onClick={onClearTranscripts}
            className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full transition-all transform hover:scale-110"
            title="Clear Transcripts"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={onDownloadTranscript}
            className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all transform hover:scale-110"
            title="Download Transcript"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useBrowserSupport } from "./hooks/useBrowserSupport";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useTranslation } from "./hooks/useTranslation";
import { useHistory } from "./hooks/useHistory";
import { downloadTranscript } from "./utils";
import { LoadingState } from "./LoadingState";
import { UnsupportedBrowser } from "./UnsupportedBrowser";
import { RecordingControls } from "./RecordingControls";
import { TranscriptDisplay } from "./TranscriptDisplay";
import { HistoryModal } from "./HistoryModal";
import type { LanguageCode } from "./constants";
import type { HistorySession } from "./types";

export default function AudioRecorder() {
  const { isClient, isSupported, supportError } = useBrowserSupport();
  
  // Use English for recording (most reliable), translate to selected language
  const [recordingLanguage] = useState<LanguageCode>("en");
  
  const {
    isRecording,
    transcripts,
    interimTranscript,
    recordingTime,
    runtimeError,
    startRecording,
    stopRecording,
    clearTranscripts,
    setTranscripts,
    clearError,
  } = useAudioRecorder(recordingLanguage);

  const { history, isLoaded, saveSession, deleteSession, clearHistory } =
    useHistory();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("es");
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(
    new Map()
  );
  const [interimTranslation, setInterimTranslation] = useState("");
  const [isRetranslating, setIsRetranslating] = useState(false);
  const { translateText } = useTranslation(selectedLanguage);

  const shouldTranslate = translationEnabled;

  // Re-translate all transcripts when language changes
  useEffect(() => {
    if (!shouldTranslate) {
      setTranslationCache(new Map());
      setIsRetranslating(false);
      return;
    }

    // Only retranslate if there are transcripts
    if (transcripts.length === 0) {
      setIsRetranslating(false);
      return;
    }

    const retranslateAll = async () => {
      setIsRetranslating(true);
      const newCache = new Map<string, string>();

      // Translate all segments sequentially to avoid overwhelming the API
      for (const segment of transcripts) {
        try {
          const translated = await translateText(segment.text);
          newCache.set(segment.id, translated);
        } catch (error) {
          console.error("Translation error:", error);
          // Keep original text if translation fails
          newCache.set(segment.id, segment.text);
        }
      }

      setTranslationCache(newCache);
      setIsRetranslating(false);
    };

    // Use a small delay to avoid interrupting ongoing speech recognition
    const timeoutId = setTimeout(() => {
      retranslateAll();
    }, 100);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage]);

  // Translate new transcripts
  useEffect(() => {
    if (!shouldTranslate) return;

    const translateNew = async () => {
      const lastSegment = transcripts[transcripts.length - 1];
      if (lastSegment && !translationCache.has(lastSegment.id)) {
        const translated = await translateText(lastSegment.text);
        setTranslationCache((prev) =>
          new Map(prev).set(lastSegment.id, translated)
        );
      }
    };

    translateNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcripts, shouldTranslate]);

  // Create display transcripts with translations
  const displayTranscripts = useMemo(() => {
    if (!shouldTranslate) return transcripts;

    return transcripts.map((seg) => ({
      ...seg,
      translatedText: translationCache.get(seg.id) || seg.translatedText,
    }));
  }, [transcripts, translationCache, shouldTranslate]);

  // Translate interim transcript
  useEffect(() => {
    if (!shouldTranslate || !interimTranscript) {
      setInterimTranslation("");
      return;
    }

    const timer = setTimeout(async () => {
      const translated = await translateText(interimTranscript);
      setInterimTranslation(translated);
    }, 500);

    return () => clearTimeout(timer);
  }, [interimTranscript, shouldTranslate, translateText]);

  const displayInterimTranslation = shouldTranslate ? interimTranslation : "";

  // Don't render until on client to avoid hydration mismatch
  if (!isClient) {
    return <LoadingState />;
  }

  if (!isSupported) {
    return <UnsupportedBrowser errorMessage={supportError} />;
  }

  const handleDownloadTranscript = () => {
    downloadTranscript(displayTranscripts, shouldTranslate);
  };

  const handleStopRecording = () => {
    stopRecording();
    // Auto-save to history when stopping (only if there are transcripts)
    if (displayTranscripts.length > 0) {
      saveSession(
        displayTranscripts,
        recordingTime,
        translationEnabled,
        selectedLanguage
      );
    }
  };

  const handleSaveToHistory = () => {
    saveSession(
      displayTranscripts,
      recordingTime,
      translationEnabled,
      selectedLanguage
    );
    // Show a brief confirmation (you could add a toast notification here)
    alert("Session saved to history!");
  };

  const handleLoadSession = (session: HistorySession) => {
    // Stop recording if currently recording
    if (isRecording) {
      stopRecording();
    }

    // Load the transcripts from the session
    setTranscripts(session.transcripts);

    // Set the translation settings from the session
    if (session.translationEnabled && session.targetLanguage) {
      setTranslationEnabled(true);
      setSelectedLanguage(session.targetLanguage);

      // Rebuild translation cache from loaded transcripts
      const cache = new Map<string, string>();
      session.transcripts.forEach((t) => {
        if (t.translatedText) {
          cache.set(t.text, t.translatedText);
        }
      });
      setTranslationCache(cache);
    } else {
      setTranslationEnabled(false);
      setTranslationCache(new Map());
    }

    // Close the modal
    setIsHistoryOpen(false);

    console.log(
      "Session loaded successfully:",
      session.transcripts.length,
      "transcripts"
    );
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Side Menu */}
      <div className="flex flex-col items-center gap-4 p-3 w-20">
        <RecordingControls
          isRecording={isRecording}
          recordingTime={recordingTime}
          transcriptCount={transcripts.length}
          transcripts={displayTranscripts}
          onStartRecording={startRecording}
          onStopRecording={handleStopRecording}
          onClearTranscripts={clearTranscripts}
          onDownloadTranscript={handleDownloadTranscript}
          translationEnabled={translationEnabled}
          selectedLanguage={selectedLanguage}
          onToggleTranslation={() => setTranslationEnabled(!translationEnabled)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onSaveHistory={handleSaveToHistory}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <TranscriptDisplay
          transcripts={displayTranscripts}
          interimTranscript={interimTranscript}
          runtimeError={runtimeError}
          selectedLanguage={selectedLanguage}
          interimTranslation={displayInterimTranslation}
          onLanguageChange={setSelectedLanguage}
          isRetranslating={isRetranslating}
          translationEnabled={translationEnabled}
          onDismissError={clearError}
        />
      </div>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDeleteSession={deleteSession}
        onClearHistory={clearHistory}
        onLoadSession={handleLoadSession}
      />
    </div>
  );
}

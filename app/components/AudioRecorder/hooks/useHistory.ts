"use client";

import { useState, useCallback, useEffect } from "react";
import { HistorySession, TranscriptSegment } from "../types";
import type { LanguageCode } from "../constants";

const HISTORY_STORAGE_KEY = "audio-transcription-history";
const MAX_HISTORY_ITEMS = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistorySession[];
        setHistory(parsed);
        console.log("History loaded:", parsed.length, "sessions");
      } else {
        console.log("No history found in localStorage");
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveToStorage = useCallback((newHistory: HistorySession[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }, []);

  const saveSession = useCallback(
    (
      transcripts: TranscriptSegment[],
      duration: number,
      translationEnabled: boolean,
      targetLanguage?: LanguageCode
    ) => {
      if (transcripts.length === 0) {
        console.log("No transcripts to save");
        return;
      }

      const newSession: HistorySession = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        transcripts,
        duration,
        translationEnabled,
        targetLanguage,
      };

      setHistory((prev) => {
        const newHistory = [newSession, ...prev].slice(0, MAX_HISTORY_ITEMS);
        saveToStorage(newHistory);
        return newHistory;
      });
    },
    [saveToStorage]
  );

  const deleteSession = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const newHistory = prev.filter((session) => session.id !== id);
        saveToStorage(newHistory);
        return newHistory;
      });
    },
    [saveToStorage]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveToStorage([]);
  }, [saveToStorage]);

  return {
    history,
    isLoaded,
    saveSession,
    deleteSession,
    clearHistory,
  };
}

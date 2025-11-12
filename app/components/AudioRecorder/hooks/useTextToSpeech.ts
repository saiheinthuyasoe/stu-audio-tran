"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { TranscriptSegment } from "../types";

// Map language codes to voice language codes
const getVoiceLanguage = (langCode?: string): string => {
  if (!langCode) return "en-US";

  const langMap: Record<string, string> = {
    es: "es-ES", // Spanish
    fr: "fr-FR", // French
    de: "de-DE", // German
    it: "it-IT", // Italian
    pt: "pt-PT", // Portuguese
    ru: "ru-RU", // Russian
    ja: "ja-JP", // Japanese
    ko: "ko-KR", // Korean
    zh: "zh-CN", // Chinese
    ar: "ar-SA", // Arabic
    hi: "hi-IN", // Hindi
    nl: "nl-NL", // Dutch
    pl: "pl-PL", // Polish
    tr: "tr-TR", // Turkish
    vi: "vi-VN", // Vietnamese
    th: "th-TH", // Thai
    sv: "sv-SE", // Swedish
    da: "da-DK", // Danish
    no: "nb-NO", // Norwegian
    fi: "fi-FI", // Finnish
    cs: "cs-CZ", // Czech
    hu: "hu-HU", // Hungarian
    ro: "ro-RO", // Romanian
    uk: "uk-UA", // Ukrainian
    el: "el-GR", // Greek
    he: "he-IL", // Hebrew
    id: "id-ID", // Indonesian
    ms: "ms-MY", // Malay
    en: "en-US", // English
  };

  return langMap[langCode] || "en-US";
};

export function useTextToSpeech(targetLanguage?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const transcriptsRef = useRef<TranscriptSegment[]>([]);
  const speakRef = useRef<
    ((text: string, index: number, lang?: string) => void) | null
  >(null);
  const languageRef = useRef<string | undefined>(targetLanguage);
  const pausedIndexRef = useRef<number>(-1);
  const pausedLangRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    languageRef.current = targetLanguage;
  }, [targetLanguage]);

  // Load available voices
  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Find the best voice for a language
  const findVoiceForLanguage = useCallback(
    (langCode: string): SpeechSynthesisVoice | null => {
      // Get fresh voices in case they weren't loaded during state update
      const voices = window.speechSynthesis?.getVoices() || availableVoices;
      if (voices.length === 0) {
        console.warn("No voices available for language:", langCode);
        return null;
      }

      const voiceLang = getVoiceLanguage(langCode);
      const langPrefix = voiceLang.split("-")[0]; // e.g., "es" from "es-ES"

      // Try to find exact match first (prefer online voices)
      let voice = voices.find((v) => v.lang === voiceLang && !v.localService);

      // Try local voices with exact match
      if (!voice) {
        voice = voices.find((v) => v.lang === voiceLang);
      }

      // Try voices starting with the language prefix (prefer online)
      if (!voice) {
        voice = voices.find(
          (v) => v.lang.startsWith(langPrefix) && !v.localService
        );
      }

      // Try any local voice with the language prefix
      if (!voice) {
        voice = voices.find((v) => v.lang.startsWith(langPrefix));
      }

      // Fallback to any English voice
      if (!voice) {
        voice = voices.find((v) => v.lang.startsWith("en"));
      }

      const selectedVoice = voice || voices[0] || null;
      if (selectedVoice) {
        console.log(
          `Selected voice for ${langCode}: ${selectedVoice.name} (${selectedVoice.lang})`
        );
      }

      return selectedVoice;
    },
    [availableVoices]
  );

  const speak = useCallback(
    (text: string, index: number, lang?: string) => {
      if (!window.speechSynthesis) {
        console.warn("Speech synthesis not supported");
        return;
      }

      // Ensure voices are loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        console.warn("No voices available yet, retrying...");
        // Retry after a short delay using the ref
        setTimeout(() => {
          if (speakRef.current) {
            speakRef.current(text, index, lang);
          }
        }, 100);
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Set language and voice
        const targetLang = lang || languageRef.current;
        if (targetLang) {
          const voice = findVoiceForLanguage(targetLang);
          if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
          } else {
            utterance.lang = getVoiceLanguage(targetLang);
          }
        } else {
          // Default to English
          utterance.lang = "en-US";
        }

        // Adjust speech rate and pitch for better quality
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          setCurrentIndex(index);
          setIsPlaying(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          // Play next segment
          const nextIndex = index + 1;
          if (nextIndex < transcriptsRef.current.length && speakRef.current) {
            speakRef.current(
              transcriptsRef.current[nextIndex].text,
              nextIndex,
              targetLang
            );
          } else {
            // Finished all segments
            setIsPlaying(false);
            setCurrentIndex(-1);
            setIsPaused(false);
          }
        };

        utterance.onerror = (event) => {
          // Only log errors that aren't expected interruptions
          if (event.error !== "interrupted" && event.error !== "canceled") {
            console.error(
              "Speech synthesis error:",
              event.error || "Unknown error"
            );
          }

          // Only continue to next segment if not interrupted/canceled
          if (event.error === "interrupted" || event.error === "canceled") {
            setIsPlaying(false);
            setCurrentIndex(-1);
            setIsPaused(false);
            return;
          }

          // Continue to next segment on other errors
          const nextIndex = index + 1;
          if (nextIndex < transcriptsRef.current.length && speakRef.current) {
            speakRef.current(
              transcriptsRef.current[nextIndex].text,
              nextIndex,
              targetLang
            );
          } else {
            setIsPlaying(false);
            setCurrentIndex(-1);
            setIsPaused(false);
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error creating speech utterance:", error);
        setIsPlaying(false);
        setCurrentIndex(-1);
        setIsPaused(false);
      }
    },
    [findVoiceForLanguage]
  );

  // Store speak function in ref
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  const playAll = useCallback(
    (transcripts: TranscriptSegment[], lang?: string) => {
      if (!window.speechSynthesis || transcripts.length === 0) return;

      transcriptsRef.current = transcripts;
      pausedLangRef.current = lang;
      pausedIndexRef.current = -1; // Reset paused state
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      speak(transcripts[0].text, 0, lang);
    },
    [speak]
  );

  const pause = useCallback(() => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      // Save current state
      pausedIndexRef.current = currentIndex;

      // Cancel current speech
      window.speechSynthesis.cancel();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, [currentIndex]);

  const resume = useCallback(() => {
    if (pausedIndexRef.current >= 0 && transcriptsRef.current.length > 0) {
      setIsPaused(false);

      // Resume from paused index
      if (speakRef.current) {
        speakRef.current(
          transcriptsRef.current[pausedIndexRef.current].text,
          pausedIndexRef.current,
          pausedLangRef.current
        );
      }

      pausedIndexRef.current = -1;
    }
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentIndex(-1);
      setIsPaused(false);
      pausedIndexRef.current = -1;
      pausedLangRef.current = undefined;
    }
  }, []);

  return {
    isPlaying,
    isPaused,
    currentIndex,
    playAll,
    pause,
    resume,
    stop,
  };
}

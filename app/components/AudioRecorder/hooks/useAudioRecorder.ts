import { useState, useRef, useEffect } from "react";
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  TranscriptSegment,
} from "../types";
import type { LanguageCode } from "../constants";

// Convert language code to BCP-47 format for Web Speech API
function getRecognitionLanguage(langCode: LanguageCode): string {
  const languageMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ru: "ru-RU",
    ja: "ja-JP",
    ko: "ko-KR",
    "zh-CN": "zh-CN",
    "zh-TW": "zh-TW",
    ar: "ar-SA",
    hi: "hi-IN",
    th: "th-TH",
    vi: "vi-VN",
    id: "id-ID",
    nl: "nl-NL",
    pl: "pl-PL",
    tr: "tr-TR",
    my: "my-MM",
  };
  return languageMap[langCode] || "en-US";
}

export function useAudioRecorder(recordingLanguage: LanguageCode = "en") {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(false); // Track recording state with ref

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setRuntimeError(null);
      audioChunksRef.current = [];

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize MediaRecorder for audio recording
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create download link
        const link = document.createElement("a");
        link.href = audioUrl;
        link.download = `recording-${new Date().getTime()}.webm`;
        document.body.appendChild(link);

        // You can auto-download or let user click
        // link.click(); // Uncomment to auto-download
        document.body.removeChild(link);

        // Clean up
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      // Initialize Speech Recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getRecognitionLanguage(recordingLanguage);
      recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
      
      console.log(`Speech recognition started with language: ${recognition.lang}`);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        const finalResults: TranscriptSegment[] = [];

        // Process results more efficiently
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          
          // Get the best alternative (highest confidence)
          let bestTranscript = result[0].transcript;
          let bestConfidence = result[0].confidence || 1;
          
          // Check other alternatives if available
          for (let j = 1; j < result.length && j < 3; j++) {
            if (result[j] && result[j].confidence > bestConfidence) {
              bestTranscript = result[j].transcript;
              bestConfidence = result[j].confidence;
            }
          }
          
          // Clean up the transcript
          const transcript = bestTranscript
            .trim()
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/^(\w)/, (match) => match.toUpperCase()); // Capitalize first letter
          
          console.log(`Result ${i}: "${transcript}" (isFinal: ${result.isFinal}, confidence: ${bestConfidence.toFixed(2)})`);

          if (result.isFinal) {
            // Only add non-empty transcripts with reasonable confidence
            if (transcript.length > 0 && bestConfidence > 0.3) {
              finalResults.push({
                id: `${Date.now()}-${i}-${Math.random()}`,
                text: transcript,
                timestamp: new Date().toLocaleTimeString(),
                isFinal: true,
              });
            } else if (transcript.length > 0) {
              console.warn(`Low confidence result ignored: "${transcript}" (confidence: ${bestConfidence})`);
            }
          } else if (transcript.length > 0) {
            interim += transcript + ' ';
          }
        }

        // Update state in a single batch if we have final results
        if (finalResults.length > 0) {
          setTranscripts((prev) => [...prev, ...finalResults]);
          setInterimTranscript("");
        } else if (interim.trim()) {
          // Only show non-empty interim results
          setInterimTranscript(interim.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Only log unexpected errors, not normal events
        if (event.error === "no-speech") {
          // This is normal - just means silence was detected
          // Don't log anything, recognition will restart automatically
        } else if (event.error === "aborted") {
          // Normal abort when stopping - don't log
        } else if (event.error === "not-allowed") {
          console.error(
            "Speech recognition error: Microphone permission denied"
          );
          setRuntimeError(
            "Microphone permission denied. Please allow microphone access."
          );
          isRecordingRef.current = false;
          setIsRecording(false);
        } else if (event.error === "audio-capture") {
          console.error("Speech recognition error: No microphone found");
          setRuntimeError("No microphone found. Please connect a microphone.");
          isRecordingRef.current = false;
          setIsRecording(false);
        } else if (event.error === "network") {
          console.error("Speech recognition error: Network error");
          setRuntimeError(
            "Speech recognition network error. This often happens when using tunnels (like Cloudflare). Try using localhost or a direct HTTPS connection."
          );
        } else {
          // Only log actual unexpected errors
          console.error("Speech recognition error:", event.error);
          setRuntimeError(`Recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        // Restart recognition if still recording (use ref for immediate state)
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            console.log("Recognition ended, restarting...");
            recognitionRef.current.start();
          } catch (e) {
            console.error("Error restarting recognition:", e);
            // Try again after a very short delay
            setTimeout(() => {
              if (isRecordingRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (err) {
                  console.error("Failed to restart after delay:", err);
                }
              }
            }, 100);
          }
        }
      };

      recognition.start();

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      isRecordingRef.current = true;
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setRuntimeError(
        "Failed to start recording. Please check your microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
    setInterimTranscript("");
  };

  const clearTranscripts = () => {
    setTranscripts([]);
    setInterimTranscript("");
    setRecordingTime(0);
  };

  const clearError = () => {
    setRuntimeError(null);
  };

  return {
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
  };
}

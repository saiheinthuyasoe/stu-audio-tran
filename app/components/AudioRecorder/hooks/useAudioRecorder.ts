import { useState, useRef, useEffect } from "react";
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  TranscriptSegment,
} from "../types";

export function useAudioRecorder() {
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
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1; // Reduce processing overhead

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        const finalResults: TranscriptSegment[] = [];

        // Process results more efficiently
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            // Batch final results
            finalResults.push({
              id: `${Date.now()}-${i}`,
              text: transcript.trim(),
              timestamp: new Date().toLocaleTimeString(),
              isFinal: true,
            });
          } else {
            interim += transcript;
          }
        }

        // Update state in a single batch if we have final results
        if (finalResults.length > 0) {
          setTranscripts((prev) => [...prev, ...finalResults]);
          setInterimTranscript("");
        } else if (interim) {
          // Show interim results immediately
          setInterimTranscript(interim);
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
        // Restart recognition if still recording (use ref for immediate state)
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            console.log("Recognition ended, restarting...");
            recognitionRef.current.start();
          } catch (e) {
            console.error("Error restarting recognition:", e);
            // Try again after a short delay
            setTimeout(() => {
              if (isRecordingRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (err) {
                  console.error("Failed to restart after delay:", err);
                }
              }
            }, 50);
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

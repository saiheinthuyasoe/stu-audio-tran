// Speech Recognition Types
export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Transcript Types
export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: string;
  isFinal: boolean;
  translatedText?: string;
}

// History Types
export interface HistorySession {
  id: string;
  timestamp: string;
  transcripts: TranscriptSegment[];
  duration: number;
  translationEnabled: boolean;
  targetLanguage?: string;
}

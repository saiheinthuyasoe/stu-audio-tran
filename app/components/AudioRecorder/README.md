# AudioRecorder Component

A clean, modular real-time audio recording and transcription component for React/Next.js.

## 📁 Project Structure

```
AudioRecorder/
├── index.tsx                    # Main component (orchestrates everything)
├── types.ts                     # TypeScript types and interfaces
├── utils.ts                     # Utility functions (formatTime, downloadTranscript, etc.)
├── LoadingState.tsx            # Loading skeleton component
├── UnsupportedBrowser.tsx      # Error state for unsupported browsers
├── RecordingControls.tsx       # Recording buttons and controls
├── TranscriptDisplay.tsx       # Transcript display and stats
└── hooks/
    ├── useIsClient.ts          # Client-side detection hook
    ├── useBrowserSupport.ts    # Browser capability check
    └── useAudioRecorder.ts     # Main recording logic hook
```

## 🎯 Component Responsibilities

### **index.tsx** (Main Component)

- Orchestrates all sub-components
- Manages component composition
- Handles data flow between components

### **types.ts**

- Speech Recognition type definitions
- Transcript segment interfaces
- Global type declarations

### **utils.ts**

- `formatTime()` - Format seconds to MM:SS
- `downloadTranscript()` - Download transcript as text file
- `calculateWordCount()` - Count total words in transcripts

### **hooks/**

#### `useIsClient.ts`

- Detects if code is running on client vs server
- Prevents hydration mismatches
- Uses React's `useSyncExternalStore`

#### `useBrowserSupport.ts`

- Checks browser API support
- Validates Speech Recognition availability
- Returns support status and error messages

#### `useAudioRecorder.ts`

- Core recording and transcription logic
- Manages MediaRecorder and SpeechRecognition APIs
- Handles state for recording, transcripts, and errors
- Provides recording controls (start, stop, clear)

### **UI Components**

#### `LoadingState.tsx`

- Displayed during SSR/initial load
- Prevents hydration mismatch

#### `UnsupportedBrowser.tsx`

- Shows error when browser lacks required APIs
- User-friendly error message

#### `RecordingControls.tsx`

- Start/Stop recording buttons
- Clear and Download buttons
- Recording timer indicator

#### `TranscriptDisplay.tsx`

- Real-time transcript display
- Interim (live) vs final transcripts
- Word and segment statistics
- Runtime error display

## 🚀 Usage

```tsx
import AudioRecorder from "./components/AudioRecorder";

export default function Page() {
  return <AudioRecorder />;
}
```

## 🔧 Key Features

✅ **Clean Architecture** - Separation of concerns  
✅ **Reusable Hooks** - Extract and reuse logic easily  
✅ **Type Safety** - Full TypeScript support  
✅ **No Hydration Errors** - Proper SSR handling  
✅ **Maintainable** - Easy to understand and modify  
✅ **Testable** - Each piece can be tested independently

## 📦 Dependencies

- React 19+
- Next.js 16+
- TypeScript
- Tailwind CSS

## 🌐 Browser Support

- Chrome/Edge (recommended)
- Web Speech API required
- MediaRecorder API required

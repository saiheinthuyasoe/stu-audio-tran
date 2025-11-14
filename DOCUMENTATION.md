# Real-Time Audio Transcription & Translation App - Complete Overview

---

## 📋 Project Overview

**What it does:** A real-time audio transcription app that listens to your voice, converts speech to text, translates it into different languages, and can read it back to you using text-to-speech.

**Tech Stack:**

- **Framework:** Next.js 15 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **APIs:** Web Speech API (built-in browser), Google Translate API

---

## 🏗️ Architecture & File Structure

```
stu-audio-tran/
├── app/
│   ├── components/
│   │   └── AudioRecorder/
│   │       ├── index.tsx                    # Main component (orchestrates everything)
│   │       ├── RecordingControls.tsx        # Left sidebar with buttons
│   │       ├── TranscriptDisplay.tsx        # Main display area
│   │       ├── LanguageSelector.tsx         # Language dropdown
│   │       ├── HistoryModal.tsx             # History popup
│   │       ├── SidebarListenMode.tsx        # TTS playback controls
│   │       ├── LoadingState.tsx             # Loading spinner
│   │       ├── UnsupportedBrowser.tsx       # Browser compatibility warning
│   │       ├── hooks/
│   │       │   ├── useAudioRecorder.ts      # Speech recognition logic
│   │       │   ├── useTranslation.ts        # Translation logic
│   │       │   ├── useTextToSpeech.ts       # Text-to-speech logic
│   │       │   ├── useHistory.ts            # LocalStorage persistence
│   │       │   ├── useBrowserSupport.ts     # Feature detection
│   │       │   └── useIsClient.ts           # SSR safety
│   │       ├── types.ts                     # TypeScript interfaces
│   │       ├── constants.ts                 # Language codes & configs
│   │       └── utils.ts                     # Helper functions
│   ├── layout.tsx                           # App layout
│   ├── page.tsx                             # Home page
│   └── globals.css                          # Global styles
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## 🔧 Step-by-Step Feature Implementation

### **Step 1: Project Setup**

1. **Initialize Next.js project:**

   ```bash
   npx create-next-app@latest stu-audio-tran
   # Selected: TypeScript, Tailwind CSS, App Router
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Project runs on:** `http://localhost:3000`

---

### **Step 2: Browser Support Detection**

**File:** `hooks/useBrowserSupport.ts`

**Purpose:** Check if the user's browser supports Web Speech API

**How it works:**

```typescript
// Checks if browser supports speech recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const isSupported = !!SpeechRecognition;
```

**Supported browsers:**

- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ⚠️ Firefox (partial - no recognition, only synthesis)

---

### **Step 3: Speech Recognition (Recording Audio)**

**File:** `hooks/useAudioRecorder.ts`

**Core Technology:** Web Speech API

**How it works step-by-step:**

1. **Request microphone permission:**

   ```typescript
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
   ```

2. **Initialize speech recognition:**

   ```typescript
   const SpeechRecognition =
     window.SpeechRecognition || window.webkitSpeechRecognition;
   const recognition = new SpeechRecognition();
   recognition.continuous = true; // Keep listening
   recognition.interimResults = true; // Show live results
   recognition.lang = "en-US"; // English
   ```

3. **Handle results:**

   ```typescript
   recognition.onresult = (event) => {
     // Loop through results
     for (let i = event.resultIndex; i < event.results.length; i++) {
       const transcript = event.results[i][0].transcript;

       if (event.results[i].isFinal) {
         // Final result - save it
         const newSegment = {
           id: Date.now().toString(),
           text: transcript,
           timestamp: new Date().toISOString(),
         };
         setTranscripts((prev) => [...prev, newSegment]);
       } else {
         // Interim result - show live preview
         setInterimTranscript(transcript);
       }
     }
   };
   ```

4. **Auto-restart on end:**

   ```typescript
   recognition.onend = () => {
     if (isRecording) {
       recognition.start(); // Keep listening
     }
   };
   ```

5. **Recording timer:**
   ```typescript
   const timerRef = useRef(null);
   timerRef.current = setInterval(() => {
     setRecordingTime((prev) => prev + 1);
   }, 1000);
   ```

**State managed:**

- `isRecording`: boolean
- `transcripts`: array of segments
- `interimTranscript`: current live text
- `recordingTime`: seconds elapsed

---

### **Step 4: Real-Time Translation**

**File:** `hooks/useTranslation.ts`

**API:** Google Translate (unofficial free endpoint)

**How it works:**

1. **Translation function:**

   ```typescript
   const translateText = async (text: string): Promise<string> => {
     const response = await fetch(
       `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
         text
       )}`
     );

     const data = await response.json();
     // Returns: [[[translated, original, ...]]]
     return data[0].map((item) => item[0]).join("");
   };
   ```

2. **Translation cache (optimization):**

   ```typescript
   const translationCache = new Map<string, string>();

   // Check cache first
   if (cache.has(text)) {
     return cache.get(text);
   }

   // Translate and cache
   const translated = await translateText(text);
   cache.set(text, translated);
   ```

3. **Auto-translate on new transcripts:**
   ```typescript
   useEffect(() => {
     transcripts.forEach(async (t) => {
       if (!cache.has(t.text)) {
         const translated = await translateText(t.text);
         setCache((prev) => new Map(prev).set(t.text, translated));
       }
     });
   }, [transcripts]);
   ```

**Supported languages:** 30+ (Spanish, French, German, Chinese, Japanese, Arabic, etc.)

---

### **Step 5: Text-to-Speech (Listen Mode)**

**File:** `hooks/useTextToSpeech.ts`

**API:** Web Speech Synthesis API

**How it works:**

1. **Voice selection:**

   ```typescript
   const voices = window.speechSynthesis.getVoices();

   // Find best voice for target language
   const findVoice = (langCode) => {
     // Try exact match first (e.g., "es-ES")
     let voice = voices.find((v) => v.lang === langCode);

     // Fallback to language prefix (e.g., "es")
     if (!voice) {
       voice = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
     }

     return voice || voices[0]; // Default voice
   };
   ```

2. **Speak function:**

   ```typescript
   const speak = (text, index, lang) => {
     const utterance = new SpeechSynthesisUtterance(text);

     // Set voice and language
     const voice = findVoice(lang);
     utterance.voice = voice;
     utterance.lang = voice.lang;

     // Settings for better quality
     utterance.rate = 0.9; // Slightly slower
     utterance.pitch = 1.0;
     utterance.volume = 1.0;

     // Auto-play next segment when done
     utterance.onend = () => {
       const nextIndex = index + 1;
       if (nextIndex < transcripts.length) {
         speak(transcripts[nextIndex].text, nextIndex, lang);
       }
     };

     window.speechSynthesis.speak(utterance);
   };
   ```

3. **Pause/Resume (custom implementation):**

   ```typescript
   const pause = () => {
     // Save current position
     pausedIndexRef.current = currentIndex;

     // Stop playback
     window.speechSynthesis.cancel();
     setIsPaused(true);
   };

   const resume = () => {
     // Resume from saved position
     speak(
       transcripts[pausedIndexRef.current].text,
       pausedIndexRef.current,
       lang
     );
     setIsPaused(false);
   };
   ```

**Features:**

- Play original or translated text
- Automatic voice selection based on language
- Pause/Resume/Stop controls
- Sequential playback through all segments

---

### **Step 6: History & Persistence**

**File:** `hooks/useHistory.ts`

**Storage:** localStorage (browser storage)

**How it works:**

1. **Save session:**

   ```typescript
   const saveSession = (
     transcripts,
     duration,
     translationEnabled,
     targetLanguage
   ) => {
     const newSession = {
       id: Date.now().toString(),
       timestamp: new Date().toISOString(),
       transcripts: transcripts, // All segments with translations
       duration: duration, // Recording time
       translationEnabled: translationEnabled,
       targetLanguage: targetLanguage,
     };

     // Add to history (max 50 items)
     const newHistory = [newSession, ...history].slice(0, 50);

     // Save to localStorage
     localStorage.setItem(
       "audio-transcription-history",
       JSON.stringify(newHistory)
     );

     setHistory(newHistory);
   };
   ```

2. **Auto-save on stop:**

   ```typescript
   const handleStopRecording = () => {
     stopRecording();

     // Auto-save if has transcripts
     if (transcripts.length > 0) {
       saveSession(
         transcripts,
         recordingTime,
         translationEnabled,
         selectedLanguage
       );
     }
   };
   ```

3. **Load session:**
   ```typescript
   const handleLoadSession = (session) => {
     // Load transcripts
     setTranscripts(session.transcripts);

     // Restore settings
     setTranslationEnabled(session.translationEnabled);
     setSelectedLanguage(session.targetLanguage);

     // Rebuild translation cache
     const cache = new Map();
     session.transcripts.forEach((t) => {
       if (t.translatedText) {
         cache.set(t.text, t.translatedText);
       }
     });
     setTranslationCache(cache);
   };
   ```

**Features:**

- Auto-save on stop
- Manual save button
- View all sessions with timestamps
- Delete individual sessions
- Delete all sessions (with confirmation)
- Download sessions as text files
- Listen to saved sessions

---

### **Step 7: UI Components**

#### **Main Component** (`index.tsx`)

**Role:** Orchestrates all features

```typescript
export default function AudioRecorder() {
  // Hooks
  const { isRecording, transcripts, startRecording, stopRecording } =
    useAudioRecorder();
  const { translateText } = useTranslation(selectedLanguage);
  const { history, saveSession } = useHistory();

  // State
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("es");

  // Display logic
  const displayTranscripts = transcripts.map((t) => ({
    ...t,
    translatedText: translationCache.get(t.text),
  }));

  return (
    <div className="flex">
      <RecordingControls />
      <TranscriptDisplay />
      <HistoryModal />
    </div>
  );
}
```

#### **Recording Controls** (`RecordingControls.tsx`)

**Layout:** Left sidebar with icon buttons

**Buttons:**

1. **Record/Stop** - Start/stop recording (red when active)
2. **Clear** - Clear all transcripts
3. **Download** - Download as text file
4. **Translation Toggle** - Enable/disable translation
5. **History** - Open history modal
6. **Save** - Manual save to history
7. **Listen Mode** - Text-to-speech controls (when stopped)

#### **Transcript Display** (`TranscriptDisplay.tsx`)

**Layout:** Main content area

**Features:**

- Language selector dropdown
- Split view: Original | Translation
- Auto-scroll to bottom
- Word count
- Interim results (gray text)
- Timestamp for each segment
- Error notifications

#### **History Modal** (`HistoryModal.tsx`)

**Layout:** Full-screen overlay

**Features:**

- List of all saved sessions
- Expandable session cards
- Session metadata (date, duration, segment count)
- Actions per session:
  - Listen (play with TTS)
  - Download (save as .txt)
  - Load (restore to main view)
  - Delete
- "Delete All" button with confirmation

---

## 🎨 Styling System

**Framework:** Tailwind CSS

**Theme:**

- Light & Dark mode support
- Responsive design
- Custom colors:
  - Purple: Original transcript
  - Blue: Translation
  - Green: Success actions
  - Red: Destructive actions
  - Yellow: Warnings/errors

**Key patterns:**

```css
/* Button style */
bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-all transform hover:scale-110

/* Dark mode */
dark:bg-gray-800 dark:text-white

/* Layout */
flex flex-col gap-4 p-4
```

---

## 📊 Data Flow

```
User speaks
    ↓
Web Speech API → useAudioRecorder
    ↓
transcripts[] updated
    ↓
    ├─→ Display in UI
    ├─→ useTranslation (if enabled)
    │       ↓
    │   translationCache updated
    │       ↓
    │   Display translation
    └─→ Save to history
```

---

## 🔒 Error Handling

1. **Browser compatibility:**

   - Detect unsupported browsers
   - Show helpful error message

2. **Microphone permissions:**

   - Request access
   - Handle denial gracefully

3. **Network errors:**

   - Catch translation API failures
   - Return original text on error

4. **Speech recognition errors:**

   - `no-speech`: Silent (normal)
   - `not-allowed`: Show permission error
   - `network`: Explain tunnel issues
   - Auto-restart on errors

5. **User feedback:**
   - Dismissible error banners
   - Console logging for debugging

---

## 🚀 Deployment

**Platform:** Vercel (recommended)

**Why Vercel:**

- ✅ Free HTTPS (required for Web Speech API)
- ✅ Automatic Next.js optimization
- ✅ Global CDN
- ✅ GitHub integration

**Deploy steps:**

```bash
# Push to GitHub
git push

# Deploy
vercel

# Or connect GitHub repo on vercel.com
```

**Environment:** Production-ready with no config needed

---

## 🎯 Key Features Summary

1. ✅ **Real-time speech recognition** (continuous listening)
2. ✅ **30+ language translation** (Google Translate API)
3. ✅ **Text-to-speech playback** (original or translation)
4. ✅ **Session history** (localStorage, 50 max)
5. ✅ **Download transcripts** (text files)
6. ✅ **Dark mode support**
7. ✅ **Responsive design**
8. ✅ **Error handling** (graceful degradation)

---

## 🛠️ Technologies Deep Dive

### **Web Speech API**

- **Recognition:** Converts speech → text
- **Synthesis:** Converts text → speech
- **Browser support:** Chrome, Edge, Safari
- **Requires:** HTTPS or localhost

### **Next.js 15**

- **App Router:** File-based routing
- **Server Components:** Default (opt-in to client)
- **TypeScript:** Type safety
- **Turbopack:** Fast development

### **React 19**

- **Hooks:** useState, useEffect, useCallback, useRef
- **Patterns:** Custom hooks for logic separation
- **Performance:** Memoization, refs for optimization

---

# Real-Time Audio Transcription & Translation App

A real-time audio transcription application that listens to your voice, converts speech to text, translates it into 30+ languages, and can read it back to you using text-to-speech.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

---

## 📋 Features

- ✅ **Real-time Speech Recognition** - Continuous voice-to-text transcription
- ✅ **Multi-language Translation** - Translate to 30+ languages instantly
- ✅ **Text-to-Speech Playback** - Listen to original or translated text
- ✅ **Session History** - Save and reload previous transcription sessions
- ✅ **Download Transcripts** - Export as text files
- ✅ **Dark Mode Support** - Automatic theme detection
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Offline Storage** - Uses localStorage for persistence

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **APIs:**
  - Web Speech API (Speech Recognition & Synthesis)
  - Google Translate API (Unofficial)

---

## 📂 Project Structure

```
stu-audio-tran/
├── app/
│   ├── components/
│   │   └── AudioRecorder/
│   │       ├── index.tsx                    # Main orchestrator component
│   │       ├── RecordingControls.tsx        # Left sidebar controls
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

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern browser (Chrome, Edge, or Safari recommended)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/saiheinthuyasoe/stu-audio-tran.git
   cd stu-audio-tran
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 🎯 How It Works

### 1. **Speech Recognition Flow**

```
User speaks
    ↓
Web Speech API (Browser)
    ↓
useAudioRecorder hook
    ↓
transcripts[] state updated
    ↓
Display in UI (real-time)
```

**Key Implementation:**

```typescript
// Initialize speech recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true; // Keep listening
recognition.interimResults = true; // Show live results
recognition.lang = "en-US";

recognition.onresult = (event) => {
  // Process speech results
  const transcript = event.results[0][0].transcript;

  if (event.results[0].isFinal) {
    // Save final transcript
    setTranscripts((prev) => [...prev, { text: transcript }]);
  } else {
    // Show interim results
    setInterimTranscript(transcript);
  }
};
```

---

### 2. **Translation Flow**

```
Transcript created
    ↓
Check translation cache
    ↓
If not cached → Google Translate API
    ↓
Cache result
    ↓
Display translation
```

**Key Implementation:**

```typescript
const translateText = async (text: string) => {
  // Check cache first
  if (translationCache.has(text)) {
    return translationCache.get(text);
  }

  // Call Google Translate API
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`
  );

  const data = await response.json();
  const translated = data[0].map((item) => item[0]).join("");

  // Cache for future use
  translationCache.set(text, translated);

  return translated;
};
```

---

### 3. **Text-to-Speech Flow**

```
User clicks "Listen"
    ↓
Select appropriate voice for language
    ↓
Create speech utterances
    ↓
Play sequentially through all segments
    ↓
Auto-advance to next segment
```

**Key Implementation:**

```typescript
const speak = (text: string, lang: string) => {
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Find best voice for language
  const voices = speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang.startsWith(lang));

  utterance.voice = voice;
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Auto-play next segment
  utterance.onend = () => {
    playNextSegment();
  };

  speechSynthesis.speak(utterance);
};
```

---

### 4. **History Persistence**

```
Recording stops
    ↓
Auto-save to localStorage
    ↓
{
  id: timestamp,
  transcripts: [...],
  duration: seconds,
  language: 'es',
  translationEnabled: true
}
    ↓
Load session
    ↓
Restore transcripts + settings
```

**Storage Structure:**

```json
{
  "audio-transcription-history": [
    {
      "id": "1699999999999",
      "timestamp": "2025-11-14T10:30:00.000Z",
      "transcripts": [
        {
          "id": "1",
          "text": "Hello world",
          "translatedText": "Hola mundo",
          "timestamp": "10:30:15"
        }
      ],
      "duration": 45,
      "translationEnabled": true,
      "targetLanguage": "es"
    }
  ]
}
```

---

## 🎨 UI Components

### Main Layout

```
┌─────────────────────────────────────────────────┐
│  [Sidebar]  │  [Main Content Area]              │
│             │                                    │
│   Record    │  Language Selector: [Spanish ▼]   │
│   Clear     │                                    │
│   Download  │  Original Transcript               │
│   Translate │  ┌──────────────────────────────┐ │
│   History   │  │ Hello, how are you?          │ │
│   Save      │  │ I'm doing great today.       │ │
│             │  └──────────────────────────────┘ │
│   Listen:   │                                    │
│    [▶️]     │  Translation (Spanish)             │
│             │  ┌──────────────────────────────┐ │
│             │  │ Hola, ¿cómo estás?           │ │
│             │  │ Estoy muy bien hoy.          │ │
│             │  └──────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Component Breakdown

- **RecordingControls** - Left sidebar with all action buttons
- **TranscriptDisplay** - Main area showing original and translated text
- **LanguageSelector** - Dropdown for target language selection
- **SidebarListenMode** - TTS controls (play/stop with mode toggle)
- **HistoryModal** - Full-screen overlay for session management

---

## 🌍 Supported Languages

30+ languages including:

- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Hindi (hi)
- And many more...

Full list available in `constants.ts`

---

## 🔧 Key Technologies Deep Dive

### Web Speech API

**Speech Recognition:**

- Converts speech to text in real-time
- Supports continuous listening
- Provides interim and final results
- Auto-restarts on end

**Speech Synthesis:**

- Converts text to speech
- Multiple voices per language
- Adjustable rate, pitch, volume
- Sequential playback support

**Browser Support:**

- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ⚠️ Firefox (synthesis only, no recognition)

**Requirements:**

- HTTPS connection (or localhost)
- Microphone permission
- Direct browser connection (no proxies/tunnels)

---

### Next.js 15 Features Used

- **App Router** - File-based routing system
- **Server Components** - Default rendering (client components opt-in)
- **TypeScript** - Full type safety
- **Turbopack** - Fast development builds
- **CSS Modules** - Scoped styling with Tailwind

---

### React 19 Patterns

**Custom Hooks:**

```typescript
// Separation of concerns
useAudioRecorder(); // Speech recognition logic
useTranslation(); // Translation logic
useTextToSpeech(); // TTS logic
useHistory(); // Persistence logic
useBrowserSupport(); // Feature detection
```

**State Management:**

```typescript
// Local state with useState
const [transcripts, setTranscripts] = useState([]);

// Refs for mutable values
const recognitionRef = useRef(null);

// Memoization with useMemo
const displayTranscripts = useMemo(() => {
  return transcripts.map((t) => ({
    ...t,
    translatedText: cache.get(t.text),
  }));
}, [transcripts, cache]);
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy on Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Done!** Your app will be live with:
   - ✅ Automatic HTTPS
   - ✅ Global CDN
   - ✅ Continuous deployment
   - ✅ No configuration needed

### Alternative: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

---

## 🔒 Browser Requirements

### Minimum Requirements

- **HTTPS** or `localhost` (required for Web Speech API)
- Modern browser (Chrome 25+, Safari 14.1+, Edge 79+)
- Microphone access permission

### Known Limitations

- **Cloudflare Tunnel**: Speech recognition may not work through proxies
  - **Solution**: Use direct HTTPS or localhost
- **Firefox**: Limited speech recognition support
  - **Solution**: Use Chrome/Edge/Safari for full features

---

## 🐛 Error Handling

The app handles various error scenarios gracefully:

### Microphone Errors

```typescript
if (event.error === "not-allowed") {
  // User denied microphone permission
  showError("Microphone permission denied. Please allow access.");
}

if (event.error === "audio-capture") {
  // No microphone detected
  showError("No microphone found. Please connect one.");
}
```

### Network Errors

```typescript
if (event.error === "network") {
  // Network connectivity issue or tunnel problem
  showError("Network error. Try using localhost or direct HTTPS.");
}
```

### Translation Errors

```typescript
try {
  const translated = await translateText(text);
  return translated;
} catch (error) {
  console.error("Translation failed:", error);
  return text; // Return original on error
}
```

All errors are:

- Logged to console for debugging
- Displayed to user with helpful messages
- Dismissible via X button
- Non-blocking (app continues functioning)

---

## 📊 Performance Optimizations

### Translation Cache

```typescript
// Avoid re-translating same text
const cache = new Map<string, string>();

if (cache.has(text)) {
  return cache.get(text); // Instant return
}
```

### Auto-restart Recognition

```typescript
// Prevent recognition from stopping
recognition.onend = () => {
  if (isRecording) {
    recognition.start(); // Keep listening
  }
};
```

### Memoization

```typescript
// Compute display transcripts only when dependencies change
const displayTranscripts = useMemo(() => {
  return transcripts.map((t) => ({
    ...t,
    translatedText: translationCache.get(t.text),
  }));
}, [transcripts, translationCache]);
```

### Ref-based State

```typescript
// Avoid closure issues with callbacks
const isRecordingRef = useRef(false);

recognition.onend = () => {
  if (isRecordingRef.current) {
    // Always current value
    recognition.start();
  }
};
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Web Speech API by W3C
- Google Translate (unofficial API)
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework

---

## 📧 Contact

**Developer:** Sai Hein Thu Ya Soe  
**GitHub:** [@saiheinthuyasoe](https://github.com/saiheinthuyasoe)  
**Repository:** [stu-audio-tran](https://github.com/saiheinthuyasoe/stu-audio-tran)

---

## 🎯 Future Enhancements

Potential features for future development:

- [ ] Multiple speaker detection
- [ ] Audio file upload and transcription
- [ ] Export to multiple formats (PDF, DOCX, SRT)
- [ ] Cloud sync for history
- [ ] Collaborative transcription sessions
- [ ] Custom vocabulary/dictionary
- [ ] Speaker labeling
- [ ] Noise cancellation
- [ ] Audio visualization
- [ ] Keyboard shortcuts

---

**Built with ❤️ using Next.js, React, and TypeScript**

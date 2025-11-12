# History Feature

## Overview

The history feature allows users to save, view, and manage their transcription sessions. All sessions are stored locally in the browser's localStorage.

## Features

### 1. **Auto-Save on Stop Recording** 🎙️

- **Automatically saves** when you click the stop recording button
- Sessions are saved only if there are transcripts (no empty sessions)
- No manual save needed - your work is preserved automatically!

### 2. Save Sessions Manually 💾

- Click the **Save** button (green icon) to manually save the current transcription session
- Sessions include:
  - All transcript segments
  - Translations (if enabled)
  - Recording duration
  - Target language (if translation was used)
  - Timestamp of when the session was saved

### 3. View History 📚

- Click the **History** button (purple clock icon) to open the history modal
- View all saved sessions in chronological order (newest first)
- See session details including:
  - Date/time saved (with relative time like "2 hours ago")
  - Number of segments
  - Recording duration
  - Translation status

### 4. Expand Sessions

- Click on any session header to expand and view full transcript
- See both original and translated text (if applicable)
- View timestamps for each segment

### 5. Delete Options 🗑️

#### Delete Individual Sessions

- Each session has a **Delete** button to remove it individually
- Perfect for removing specific unwanted sessions

#### Delete All Sessions

- **"Delete All"** button in the history modal header (top right)
- Removes all sessions at once with a confirmation dialog
- Quick way to clear your entire history
- Only appears when there are sessions to delete

### 6. Session Actions

Each session has three actions:

- **Download**: Export the session transcript as a text file
- **Load**: Load the session back into the main view (coming soon)
- **Delete**: Remove the session from history

## Storage

- Uses browser's localStorage
- Maximum of 50 sessions stored
- When limit is reached, oldest sessions are automatically removed
- Storage key: `audio-transcription-history`

## Data Structure

Each session contains:

```typescript
{
  id: string;              // Unique identifier
  timestamp: string;       // ISO date string
  transcripts: Array<{     // Array of transcript segments
    id: string;
    text: string;
    timestamp: string;
    translatedText?: string;
  }>;
  duration: number;        // Recording duration in seconds
  translationEnabled: boolean;
  targetLanguage?: string; // Language code (e.g., "es", "fr")
}
```

## Tips

- Save important sessions before clearing transcripts
- Download sessions for permanent storage
- History is stored locally, so clearing browser data will remove it
- Sessions are automatically sorted by date (newest first)

## Future Enhancements

- Cloud sync for cross-device access
- Search and filter history
- Export multiple sessions at once
- Share sessions with others
- Tag and categorize sessions

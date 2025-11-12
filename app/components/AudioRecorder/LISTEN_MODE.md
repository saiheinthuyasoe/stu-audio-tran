# Listen Mode Feature 🔊

## Overview

Listen Mode allows you to play back transcripts using text-to-speech (TTS) technology. The browser reads your transcriptions out loud, making it perfect for reviewing content hands-free or for accessibility purposes.

## Features

### 1. **Main View Listen Mode** 🎧

- Appears automatically when you have transcripts and are NOT recording
- Located at the top of the transcript display area
- Beautiful purple/pink gradient design

#### Controls:

- **Play Button** (Purple) - Start playing all transcripts from the beginning
- **Pause Button** (Yellow) - Pause the playback
- **Resume Button** (Green) - Continue from where you paused
- **Stop Button** (Red) - Stop playback completely

#### Features:

- **Progress Indicator**: Shows which segment is currently playing (e.g., "Playing 3 of 10")
- **Visual Progress Bar**: Displays overall progress through all segments
- **Speaking Indicator**: Animated pulse dot when actively speaking
- **Translation Support**: Automatically plays translated text if translation is enabled

### 2. **History Listen Mode** 📚🔊

- Available for each saved session in the History Modal
- Click the **"Listen"** button (purple) on any expanded session
- Perfect for reviewing past transcriptions without loading them

#### How it Works:

1. Open History Modal (purple clock button)
2. Expand any session
3. Click the **"Listen"** button
4. Use **Pause/Resume/Stop** controls as needed
5. Only one session can be playing at a time

### 3. **Smart Features** 🧠

#### Auto-Sequencing

- Automatically plays segments in order
- No need to manually move to the next segment
- Smooth transition between segments

#### Translation Support

- When translation is enabled, plays the translated text
- Falls back to original text if translation is unavailable
- Indicated in the status text

#### Browser Compatibility

- Uses the Web Speech API (SpeechSynthesis)
- Supported in all modern browsers (Chrome, Edge, Safari, Firefox)
- No additional installation required

## Usage Tips

### Best Practices

1. **Pause Before Switching**: Pause or stop playback before closing modals or switching sessions
2. **Translation Mode**: Enable translation before playing if you want to hear translated text
3. **Volume Control**: Use your system volume to adjust playback level
4. **Speed**: Browser default speech rate is used (typically natural speed)

### Use Cases

- 📖 **Proofreading**: Listen to transcripts to catch errors you might miss when reading
- ♿ **Accessibility**: Great for users who prefer audio content
- 🚗 **Hands-Free Review**: Listen while doing other tasks
- 🌍 **Language Learning**: Hear pronunciations in translated language
- ✅ **Quality Check**: Verify transcript accuracy by listening

## Technical Details

### How It Works

- Uses browser's built-in `SpeechSynthesisUtterance` API
- No external dependencies or API calls required
- Runs completely in your browser (offline capable)
- Automatically cleans up resources when component unmounts

### State Management

- Tracks playback state (playing, paused, stopped)
- Monitors current segment index
- Prevents multiple simultaneous playbacks

### Performance

- Lightweight and efficient
- No audio file generation needed
- Instant playback start
- Minimal memory usage

## Keyboard Shortcuts

_Coming soon - keyboard controls for play/pause/stop_

## Future Enhancements

- Voice selection (male/female, different accents)
- Playback speed control (0.5x to 2x)
- Auto-scroll to current segment
- Highlight text as it's being spoken
- Skip forward/backward by segment
- Loop mode for language learning
- Keyboard shortcuts

## Browser Support

| Browser | Support | Notes                        |
| ------- | ------- | ---------------------------- |
| Chrome  | ✅ Full | Best quality voices          |
| Edge    | ✅ Full | Microsoft voices             |
| Safari  | ✅ Full | Apple voices                 |
| Firefox | ✅ Full | May have fewer voice options |
| Opera   | ✅ Full | Chromium-based               |

## Troubleshooting

### No Sound?

- Check system volume
- Verify browser isn't muted
- Check browser permissions (no special permission needed for TTS)

### Robotic Voice?

- This is normal - uses browser's default TTS engine
- Quality varies by operating system and browser
- Some browsers offer better voices than others

### Playback Stops Unexpectedly?

- May happen if browser tab loses focus (browser-dependent)
- Click Resume to continue
- Some browsers pause TTS when tab is inactive

## Privacy & Security

- ✅ Completely offline - no data sent to servers
- ✅ No audio recording during playback
- ✅ No external API calls
- ✅ Works without internet connection

import type { TranscriptSegment } from "./types";

/**
 * Format seconds into MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Download transcript as a text file
 */
export function downloadTranscript(
  transcripts: TranscriptSegment[],
  includeTranslation: boolean = false
): void {
  let text: string;

  if (includeTranslation && transcripts.some((t) => t.translatedText)) {
    // Format with both original and translation
    text = transcripts
      .map((t) => {
        const original = `[${t.timestamp}] Original: ${t.text}`;
        const translated = t.translatedText
          ? `             Translation: ${t.translatedText}`
          : "";
        return translated ? `${original}\n${translated}` : original;
      })
      .join("\n\n");
  } else {
    // Format with only original
    text = transcripts.map((t) => `[${t.timestamp}] ${t.text}`).join("\n");
  }

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transcript-${new Date().getTime()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculate total word count from transcripts
 */
export function calculateWordCount(transcripts: TranscriptSegment[]): number {
  return transcripts.reduce((acc, t) => acc + t.text.split(" ").length, 0);
}

/**
 * Format date for display in history
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import { useIsClient } from "./useIsClient";

/**
 * Hook to check if browser supports audio recording and speech recognition
 */
export function useBrowserSupport() {
  const isClient = useIsClient();

  const isSupported =
    isClient &&
    typeof window !== "undefined" &&
    (() => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      return Boolean(
        SpeechRecognition &&
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia
      );
    })();

  const supportError =
    isClient && !isSupported
      ? "Your browser does not support audio recording or speech recognition. Please use Chrome or Edge."
      : null;

  return { isClient, isSupported, supportError };
}

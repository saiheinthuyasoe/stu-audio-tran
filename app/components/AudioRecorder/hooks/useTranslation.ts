import { useState } from "react";

/**
 * Hook to translate text using a translation API
 * For demo purposes, this uses a mock implementation
 * In production, you would use Google Translate API, DeepL, or similar
 */
export function useTranslation(targetLanguage: string) {
  const [isTranslating, setIsTranslating] = useState(false);

  const normalizeLanguageCode = (code: string): string => {
    // Convert to Google Translate language codes
    const codeMap: Record<string, string> = {
      "zh-CN": "zh-CN",
      "zh-TW": "zh-TW",
      my: "my",
    };
    return codeMap[code] || code;
  };

  const translateText = async (text: string): Promise<string> => {
    if (!text || targetLanguage === "none") return text;

    setIsTranslating(true);

    try {
      const normalizedTarget = normalizeLanguageCode(targetLanguage);

      // Use Google Translate API (unofficial endpoint, best quality for all languages)
      const googleResponse = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${normalizedTarget}&dt=t&q=${encodeURIComponent(
          text
        )}`
      );

      if (googleResponse.ok) {
        const googleData = await googleResponse.json();
        // Google Translate returns array format: [[[translated, original, ...]]]
        if (
          googleData &&
          googleData[0] &&
          googleData[0][0] &&
          googleData[0][0][0]
        ) {
          const translated = googleData[0]
            .map((item: string[]) => item[0])
            .join("");
          if (translated && translated !== text) {
            return translated;
          }
        }
      }

      return text; // Return original if translation fails
    } catch (error) {
      console.error("Translation error:", error);
      return text; // Return original on error
    } finally {
      setIsTranslating(false);
    }
  };

  return { translateText, isTranslating };
}

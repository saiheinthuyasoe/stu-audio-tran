import { SUPPORTED_LANGUAGES, type LanguageCode } from "./constants";

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
  isLoading = false,
}: LanguageSelectorProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <label
        htmlFor="language-select"
        className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center"
      >
        Translate
      </label>
      <div className="relative">
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
          disabled={disabled}
          className={`px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

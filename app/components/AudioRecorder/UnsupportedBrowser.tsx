interface UnsupportedBrowserProps {
  errorMessage: string | null;
}

export function UnsupportedBrowser({ errorMessage }: UnsupportedBrowserProps) {
  return (
    <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <p className="text-red-600 dark:text-red-400 font-semibold">
        {errorMessage}
      </p>
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  message, 
  title = 'Error',
  onRetry,
  className = '' 
}: ErrorMessageProps) {
  return (
    <div 
      className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
      data-testid="error-message"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">❌</span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-700">{title}</h3>
          <p className="text-sm text-red-600 mt-1">{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

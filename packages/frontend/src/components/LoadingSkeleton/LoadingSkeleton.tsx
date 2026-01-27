interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'avatar' | 'custom';
  count?: number;
  className?: string;
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-1.5 mb-3">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
          <div className="h-5 w-14 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
    </div>
  );
}

function AvatarSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="h-10 w-10 bg-gray-200 rounded-full" />
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ 
  variant = 'card', 
  count = 1,
  className = '' 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <CardSkeleton />;
      case 'text':
        return <TextSkeleton />;
      case 'avatar':
        return <AvatarSkeleton />;
      case 'custom':
      default:
        return <div className="h-20 bg-gray-200 rounded animate-pulse" />;
    }
  };

  return (
    <div className={className} data-testid="loading-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={index > 0 ? 'mt-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}

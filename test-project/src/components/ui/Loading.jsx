import { cn } from "@/utils/cn";

const Loading = ({ className, variant = "calendar" }) => {
  if (variant === "calendar") {
    return (
      <div className={cn("space-y-6 animate-pulse", className)}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
          <div className="flex space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
          </div>
        </div>
        
        {/* Calendar grid skeleton */}
        <div className="grid grid-cols-7 gap-4">
          {/* Days header */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
          ))}
          
          {/* Time slots */}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (variant === "list") {
    return (
      <div className={cn("space-y-4 animate-pulse", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
              <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-secondary font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
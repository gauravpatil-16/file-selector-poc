const Loading = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Post Card Skeletons */}
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-card shadow-card p-4 space-y-4">
          {/* Post Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Post Content */}
          <div className="space-y-3">
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Post Image Placeholder */}
          {index % 2 === 0 && (
            <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse" />
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Loading
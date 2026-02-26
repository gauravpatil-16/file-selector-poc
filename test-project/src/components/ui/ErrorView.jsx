import ApperIcon from "@/components/ApperIcon"

const ErrorView = ({ 
  title = "Something went wrong", 
  message = "We're having trouble loading this content. Please try again.",
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 px-4 py-8 text-center">
      {/* Error Icon */}
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name="AlertCircle" size={32} className="text-error" />
      </div>

      {/* Error Content */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-primary text-white font-medium rounded-lg hover:shadow-lg transition-all duration-fast active:scale-95"
        >
          <ApperIcon name="RotateCw" size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  )
}

export default ErrorView
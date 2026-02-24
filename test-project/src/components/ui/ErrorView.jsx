import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const ErrorView = ({ 
  className, 
  title = "Oops! Something went wrong",
  message = "We're having trouble loading your data. Please try again.",
  onRetry,
  showRetry = true 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center space-y-6", className)}>
      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
        <ApperIcon name="AlertTriangle" className="w-10 h-10 text-error" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-secondary max-w-md">{message}</p>
      </div>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ApperIcon name="RefreshCw" className="w-5 h-5" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorView;
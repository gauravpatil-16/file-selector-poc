import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  icon = "FileText",
  title = "No content yet", 
  message = "There's nothing to show here at the moment.",
  actionLabel = "Create your first post",
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 px-4 py-8 text-center">
      {/* Empty Icon */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={icon} size={32} className="text-gray-400" />
      </div>

      {/* Empty Content */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
        {message}
      </p>

      {/* Action Button */}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-primary text-white font-medium rounded-lg hover:shadow-lg transition-all duration-fast active:scale-95"
        >
          <ApperIcon name="Plus" size={16} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  )
}

export default Empty
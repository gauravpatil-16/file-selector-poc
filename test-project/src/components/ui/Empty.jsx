import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  className,
  title,
  message,
  actionText,
  onAction,
  icon = "Calendar",
  variant = "default"
}) => {
  const variants = {
    default: {
      title: "No data available",
      message: "There's nothing to show here yet.",
      icon: "Calendar"
    },
    services: {
      title: "No services created yet",
      message: "Create your first service to start accepting bookings from clients.",
      actionText: "Create Service",
      icon: "Plus"
    },
    bookings: {
      title: "No bookings yet",
      message: "When clients book your services, they'll appear here.",
      icon: "Calendar"
    },
    availability: {
      title: "Set your availability",
      message: "Configure your working hours to let clients know when you're available.",
      actionText: "Set Hours",
      icon: "Clock"
    }
  };

  const config = variants[variant] || variants.default;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayActionText = actionText || config.actionText;
  const displayIcon = icon || config.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center space-y-6", className)}>
      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
        <ApperIcon name={displayIcon} className="w-10 h-10 text-primary" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">{displayTitle}</h3>
        <p className="text-secondary max-w-md">{displayMessage}</p>
      </div>
      
      {displayActionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          {displayActionText}
        </button>
      )}
    </div>
  );
};

export default Empty;
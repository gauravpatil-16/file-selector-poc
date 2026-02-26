import { useRef, useEffect } from "react"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"
import { formatDistance } from "date-fns"

const NotificationDropdown = ({ onClose }) => {
  const dropdownRef = useRef(null)

  // Sample notifications
  const notifications = [
    {
      id: "1",
      type: "like",
      actor: { username: "sarah_j", displayName: "Sarah Johnson", avatarUrl: null },
      message: "liked your post",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isRead: false
    },
    {
      id: "2", 
      type: "comment",
      actor: { username: "mike_dev", displayName: "Mike Chen", avatarUrl: null },
      message: "commented on your post",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false
    },
    {
      id: "3",
      type: "follow",
      actor: { username: "alex_photo", displayName: "Alex Rivera", avatarUrl: null },
      message: "started following you",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true
    }
  ]

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like": return "Heart"
      case "comment": return "MessageCircle"
      case "follow": return "UserPlus"
      default: return "Bell"
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "like": return "text-accent"
      case "comment": return "text-primary"
      case "follow": return "text-success"
      default: return "text-gray-500"
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-surface rounded-lg shadow-dropdown border border-gray-200 z-dropdown animate-scale-in"
      role="menu"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-fast"
          aria-label="Close notifications"
        >
          <ApperIcon name="X" size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors duration-fast cursor-pointer",
              !notification.isRead && "bg-blue-50/50"
            )}
            role="menuitem"
          >
            {/* Notification Icon */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              notification.type === "like" && "bg-accent/10",
              notification.type === "comment" && "bg-primary/10", 
              notification.type === "follow" && "bg-success/10"
            )}>
              <ApperIcon 
                name={getNotificationIcon(notification.type)}
                size={16}
                className={getNotificationColor(notification.type)}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 truncate">
                  {notification.actor.displayName}
                </span>
                <span className="text-gray-600 text-sm">
                  {notification.message}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                {formatDistance(notification.timestamp, new Date(), { addSuffix: true })}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
        ))}

        {/* Empty state placeholder */}
        {notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <ApperIcon name="Bell" size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button className="w-full text-center text-primary text-sm font-medium hover:text-primary/80 transition-colors duration-fast">
          View all notifications
        </button>
      </div>
    </div>
  )
}

export default NotificationDropdown
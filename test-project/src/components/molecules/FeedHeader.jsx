import { useState } from "react"
import ApperIcon from "@/components/ApperIcon"
import NotificationDropdown from "@/components/molecules/NotificationDropdown"
import SearchBar from "@/components/molecules/SearchBar"
import { cn } from "@/utils/cn"

const FeedHeader = ({ onRefresh, isRefreshing = false }) => {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="sticky top-0 bg-surface/80 backdrop-blur-lg border-b border-gray-200 z-sticky">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <ApperIcon name="Zap" size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Pulse
          </h1>
        </div>

{/* Search Bar - Hidden on small screens */}
        <div className="hidden sm:block flex-1 max-w-md mx-4">
          <SearchBar 
            placeholder="Search posts, topics, people..."
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search Button */}
          <SearchBar 
            placeholder="Search..."
            className="sm:hidden w-32"
          />
          
          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            className={cn(
              "p-2 rounded-full transition-all duration-fast",
              "hover:bg-gray-100 active:scale-95",
              isRefreshing && "animate-spin"
            )}
            disabled={isRefreshing}
            aria-label="Refresh feed"
          >
            <ApperIcon 
              name="RotateCw" 
              size={20} 
              className="text-gray-600"
            />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full transition-all duration-fast hover:bg-gray-100 active:scale-95 relative"
              aria-label="View notifications"
              aria-expanded={showNotifications}
            >
              <ApperIcon 
                name="Bell" 
                size={20} 
                className="text-gray-600"
              />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-medium">
                3
              </span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <NotificationDropdown 
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default FeedHeader
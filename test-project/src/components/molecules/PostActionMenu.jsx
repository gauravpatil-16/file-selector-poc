import { useRef, useEffect } from "react"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const PostActionMenu = ({ onReport, onHide, onClose }) => {
  const menuRef = useRef(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const menuItems = [
    {
      id: "report",
      label: "Report Post",
      icon: "Flag",
      action: onReport,
      className: "text-error hover:bg-error/10"
    },
    {
      id: "hide",
      label: "Hide Post", 
      icon: "EyeOff",
      action: onHide,
      className: "text-gray-600 hover:bg-gray-50"
    }
  ]

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-0 mt-1 w-48 bg-surface rounded-lg shadow-dropdown border border-gray-200 z-dropdown animate-scale-in"
      role="menu"
      aria-label="Post actions"
    >
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={item.action}
          className={cn(
            "w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-fast first:rounded-t-lg last:rounded-b-lg",
            item.className
          )}
          role="menuitem"
        >
          <ApperIcon name={item.icon} size={16} />
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export default PostActionMenu
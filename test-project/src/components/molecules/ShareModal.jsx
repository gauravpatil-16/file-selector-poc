import { useRef, useEffect } from "react"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const ShareModal = ({ post, onClose, onShare }) => {
  const modalRef = useRef(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    
    // Prevent body scroll
    document.body.style.overflow = "hidden"
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const shareOptions = [
    {
      id: "link",
      label: "Copy Link",
      icon: "Link",
      action: () => {
        navigator.clipboard.writeText(`https://pulse.app/post/${post.Id}`)
        toast.success("Link copied to clipboard!")
        onShare(post.Id, "link")
        onClose()
      }
    },
    {
      id: "twitter", 
      label: "Share on X",
      icon: "MessageSquare",
      action: () => {
        toast.info("X sharing coming soon!")
        onShare(post.Id, "twitter")
        onClose()
      }
    },
    {
      id: "facebook",
      label: "Share on Facebook", 
      icon: "Users",
      action: () => {
        toast.info("Facebook sharing coming soon!")
        onShare(post.Id, "facebook")
        onClose()
      }
    },
    {
      id: "whatsapp",
      label: "Share on WhatsApp",
      icon: "MessageCircle",
      action: () => {
        toast.info("WhatsApp sharing coming soon!")
        onShare(post.Id, "whatsapp")
        onClose()
      }
    },
    {
      id: "email",
      label: "Share via Email",
      icon: "Mail",
      action: () => {
        toast.info("Email sharing coming soon!")
        onShare(post.Id, "email")
        onClose()
      }
    }
  ]

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal flex items-end sm:items-center justify-center p-4"
      style={{ touchAction: 'none' }}
    >
      <div
        ref={modalRef}
        className={cn(
          "bg-surface w-full max-w-sm rounded-t-xl sm:rounded-xl",
          "shadow-modal animate-slide-up overflow-hidden"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="share-title" className="text-lg font-semibold text-gray-900">
            Share Post
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-fast"
            aria-label="Close share options"
          >
            <ApperIcon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Share Options */}
        <div className="p-4 space-y-2">
          {shareOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={option.action}
              className={cn(
                "w-full flex items-center space-x-3 p-3 rounded-lg",
                "hover:bg-gray-50 transition-all duration-fast",
                "active:scale-98 text-left"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <ApperIcon 
                  name={option.icon} 
                  size={18} 
                  className="text-gray-600"
                />
              </div>
              
              <span className="font-medium text-gray-900">
                {option.label}
              </span>
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 text-center text-gray-600 font-medium hover:text-gray-800 transition-colors duration-fast"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareModal
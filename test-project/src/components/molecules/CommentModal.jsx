import { useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import ApperIcon from "@/components/ApperIcon"
import Avatar from "@/components/atoms/Avatar"
import { cn } from "@/utils/cn"
import { formatDistance } from "date-fns"

const CommentModal = ({ post, onClose }) => {
  const modalRef = useRef(null)
  const backdropRef = useRef(null)
  const { user, isAuthenticated } = useSelector((state) => state.user)

  // Sample comments for the post
  const sampleComments = [
    {
      id: "c1",
      author: {
        id: "u3",
        username: "sarah_j",
        displayName: "Sarah Johnson",
        avatarUrl: null
      },
      content: "This is so inspiring! Thanks for sharing your thoughts on this topic. 🙌",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      likes: 12,
      replies: [
        {
          id: "r1",
          author: {
            id: "u4",
            username: "mike_dev",
            displayName: "Mike Chen",
            avatarUrl: null
          },
          content: "Couldn't agree more! 💯",
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          likes: 3
        }
      ]
    },
    {
      id: "c2",
      author: {
        id: "u5",
        username: "alex_photo",
        displayName: "Alex Rivera",
        avatarUrl: null
      },
      content: "Beautiful shot! What camera did you use for this? The lighting is perfect.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      likes: 8,
      replies: []
    },
    {
      id: "c3",
      author: {
        id: "u6",
        username: "emma_design",
        displayName: "Emma Wilson",
        avatarUrl: null
      },
      content: "Love the composition and the message behind this post ❤️",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      likes: 23,
      replies: []
    }
  ]

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

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div 
      ref={backdropRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal flex items-end sm:items-center justify-center p-4"
      style={{ touchAction: 'none' }}
    >
      <div
        ref={modalRef}
        className={cn(
          "bg-surface w-full max-w-lg max-h-[90vh] rounded-t-xl sm:rounded-xl",
          "shadow-modal animate-slide-up overflow-hidden"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comments-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="comments-title" className="text-lg font-semibold text-gray-900">
            Comments ({post.comments})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-fast"
            aria-label="Close comments"
          >
            <ApperIcon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {sampleComments.map((comment) => (
            <div key={comment.id} className="p-4 border-b border-gray-100 last:border-b-0">
              {/* Comment */}
              <div className="flex space-x-3">
                <Avatar
                  src={comment.author.avatarUrl}
                  alt={comment.author.displayName}
                  username={comment.author.username}
                  size="xs"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {comment.author.displayName}
                    </span>
                    <span className="text-xs text-gray-500">
                      @{comment.author.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistance(comment.timestamp, new Date(), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 text-sm leading-relaxed mb-2">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-accent transition-colors duration-fast">
                      <ApperIcon name="Heart" size={14} />
                      <span className="text-xs">{formatCount(comment.likes)}</span>
                    </button>
                    
                    <button className="text-xs text-gray-500 hover:text-primary transition-colors duration-fast">
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-10 mt-3 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex space-x-3">
                      <Avatar
                        src={reply.author.avatarUrl}
                        alt={reply.author.displayName}
                        username={reply.author.username}
                        size="xs"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {reply.author.displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            @{reply.author.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistance(reply.timestamp, new Date(), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <p className="text-gray-800 text-sm leading-relaxed mb-2">
                          {reply.content}
                        </p>
                        
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-accent transition-colors duration-fast">
                            <ApperIcon name="Heart" size={14} />
                            <span className="text-xs">{formatCount(reply.likes)}</span>
                          </button>
                          
                          <button className="text-xs text-gray-500 hover:text-primary transition-colors duration-fast">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Empty state */}
          {sampleComments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <ApperIcon name="MessageCircle" size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Comment Input - Conditional based on authentication */}
        <div className="p-4 border-t border-gray-200">
          {isAuthenticated ? (
            // Authenticated user - show comment input
            <div className="flex space-x-3">
              <Avatar
                src={user?.avatarUrl}
                alt={user?.name || "Your avatar"}
                username={user?.name || "you"}
                size="xs"
              />
              
              <div className="flex-1">
                <textarea
                  placeholder="Write a comment..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-fast"
                  rows="3"
                />
                
                <div className="flex items-center justify-between mt-2">
                  <button className="p-2 text-gray-500 hover:text-primary transition-colors duration-fast">
                    <ApperIcon name="Smile" size={16} />
                  </button>
                  
                  <button className="px-4 py-2 bg-gradient-primary text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-fast active:scale-95">
                    Post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Anonymous user - show login prompt
            <div className="text-center py-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="MessageCircle" size={20} className="text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    Join the conversation
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sign in to leave a comment and engage with the community
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Link
                    to="/authenticateduser/login"
                    className="px-4 py-2 bg-gradient-primary text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-fast active:scale-95"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/authenticateduser/signup"
                    className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-fast"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommentModal
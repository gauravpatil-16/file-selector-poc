import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import CommentModal from "@/components/molecules/CommentModal";
import ShareModal from "@/components/molecules/ShareModal";
import PostActionMenu from "@/components/molecules/PostActionMenu";
import { cn } from "@/utils/cn";
import { formatDistance } from "date-fns";

const PostCard = ({ post, onLike, onShare, onReport, onHide }) => {
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    onLike(post.Id)
    
    // Reset animation after completion
    setTimeout(() => setIsAnimating(false), 400)
  }

  const handleDoubleTap = (e) => {
    e.preventDefault()
    handleLike()
  }

  const formatCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <>
      <article className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-all duration-normal border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              username={post.author.username}
              size="sm"
            />
            <div>
              <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors duration-fast cursor-pointer">
                {post.author.displayName}
              </h3>
              <p className="text-xs text-gray-500">
                @{post.author.username} • {formatDistance(new Date(post.timestamp), new Date(), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-fast"
              aria-label="Post options"
            >
              <ApperIcon name="MoreHorizontal" size={16} className="text-gray-500" />
            </button>

            {showMenu && (
              <PostActionMenu
                onReport={() => {
                  onReport(post.Id)
                  setShowMenu(false)
                }}
                onHide={() => {
                  onHide(post.Id)
                  setShowMenu(false)
                }}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div 
          className="px-4 cursor-pointer select-none"
          onDoubleClick={handleDoubleTap}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {post.content && (
            <p className="text-gray-900 leading-relaxed mb-3 whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          {post.imageUrl && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-3">
              <img
                src={post.imageUrl}
                alt="Post content"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-fast",
              "hover:bg-red-50 active:scale-95",
              post.isLiked ? "text-accent" : "text-gray-600 hover:text-accent"
            )}
            aria-label={post.isLiked ? "Unlike post" : "Like post"}
          >
            <ApperIcon 
              name={post.isLiked ? "Heart" : "Heart"}
              size={18}
              className={cn(
                "transition-all duration-normal",
                post.isLiked && "fill-current",
                isAnimating && "animate-heart-beat"
              )}
            />
<span className="text-sm font-medium">
              {formatCount(post.likes)}
            </span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-fast hover:bg-blue-50 text-gray-600 hover:text-primary active:scale-95"
            aria-label="View comments"
          >
            <ApperIcon name="MessageCircle" size={18} />
            <span className="text-sm font-medium">
              {formatCount(post.comments)}
            </span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-fast hover:bg-green-50 text-gray-600 hover:text-success active:scale-95"
            aria-label="Share post"
          >
            <ApperIcon name="Share" size={18} />
            <span className="text-sm font-medium">
              {formatCount(post.shares)}
            </span>
          </button>
        </div>
      </article>

      {/* Modals */}
      {showComments && (
        <CommentModal
          post={post}
          onClose={() => setShowComments(false)}
        />
      )}

      {showShare && (
        <ShareModal
          post={post}
          onClose={() => setShowShare(false)}
          onShare={onShare}
        />
      )}
    </>
  )
}

export default PostCard
import React, { forwardRef } from "react";
import { useSelector } from "react-redux";
import { cn } from "@/utils/cn";

const Avatar = forwardRef(({ 
  src, 
  alt, 
  username = "", 
  size = "md", 
  className,
  ...props 
}, ref) => {
  const { user } = useSelector(state => state.user)
  
  const sizeClasses = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm", 
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-20 h-20 text-xl"
  }

  const getInitials = (username) => {
    if (!username) return "?"
    return username.charAt(0).toUpperCase()
  }

  const getGradientClass = (username) => {
    if (!username) return "bg-gradient-primary"
    
    // Generate consistent gradient based on username
    const hash = username.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)
    
    const gradients = [
      "bg-gradient-primary",
      "bg-gradient-accent", 
      "bg-gradient-to-br from-purple-500 to-pink-500",
      "bg-gradient-to-br from-blue-500 to-purple-500",
      "bg-gradient-to-br from-green-500 to-blue-500",
      "bg-gradient-to-br from-yellow-500 to-red-500"
    ]
    
    return gradients[hash % gradients.length]
  }

// Use actual user avatar when available
  const actualSrc = src || user?.avatarUrl || user?.AvatarUrl
  const actualUsername = username === "you" ? user?.FirstName || user?.Name || username : username || ""

  if (actualSrc) {
    return (
      <img
        ref={ref}
        src={actualSrc}
        alt={alt}
        className={cn(
          "rounded-full object-cover border-2 border-white shadow-sm",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-full flex items-center justify-center text-white font-semibold border-2 border-white shadow-sm",
        sizeClasses[size],
        getGradientClass(actualUsername),
        className
      )}
      {...props}
    >
      {getInitials(actualUsername)}
    </div>
  )
})

Avatar.displayName = "Avatar"

export default Avatar
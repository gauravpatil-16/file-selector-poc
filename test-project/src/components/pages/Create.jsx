import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import postService from "@/services/api/postService";

const Create = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.user)
  const [content, setContent] = useState("")
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [audience, setAudience] = useState("public")
  const [allowComments, setAllowComments] = useState(true)
  const [allowSharing, setAllowSharing] = useState(true)
  const [includeLocation, setIncludeLocation] = useState(false)

  const maxCharacters = 280

const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    
    if (files.length + images.length > 4) {
      toast.error("You can upload a maximum of 4 images per post")
      return
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name
          }
          setImages(prev => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      } else {
        toast.error("Please select only image files")
      }
    })
    
    // Reset input
    event.target.value = ""
  }

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const moveImage = (dragIndex, hoverIndex) => {
    const dragImage = images[dragIndex]
    const newImages = [...images]
    newImages.splice(dragIndex, 1)
    newImages.splice(hoverIndex, 0, dragImage)
    setImages(newImages)
  }

const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error("Please write something before posting!")
      return
    }

    if (content.length > maxCharacters) {
      toast.error(`Post exceeds ${maxCharacters} character limit`)
      return
    }

setIsSubmitting(true)
    
    try {
      const hasImages = images.length > 0
      
      await postService.create({
        content: content.trim(),
        imageUrl: hasImages ? images[0]?.preview : null,
        audience,
        allowComments,
        allowSharing,
        includeLocation
      })
      
      const successMessage = hasImages 
        ? "Post created successfully! (Image preview attached)"
        : "Post created successfully!"
      toast.success(successMessage)
      navigate("/")
    } catch (error) {
      toast.error("Failed to create post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

const remainingChars = maxCharacters - content.length
  const isOverLimit = remainingChars < 0
  const canPost = content.trim() && !isOverLimit && !isSubmitting

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-surface/80 backdrop-blur-lg border-b border-gray-200 z-sticky">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-fast"
            aria-label="Go back"
          >
            <ApperIcon name="ArrowLeft" size={20} className="text-gray-600" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">Create Post</h1>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canPost}
            className="px-4 py-2 bg-gradient-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-fast active:scale-95"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <ApperIcon name="Loader" size={16} className="animate-spin" />
                <span>Publishing...</span>
              </div>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </header>

<div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Compose Area */}
          <div className="bg-surface rounded-card shadow-card p-6 border border-gray-100">
            <div className="flex space-x-4">
              <Avatar
                username="you"
                alt="Your avatar" 
                size="md"
              />
              
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening? Share your thoughts..."
                  className="w-full min-h-32 p-0 border-0 resize-none focus:outline-none text-lg placeholder-gray-500 bg-transparent"
                  autoFocus
                />
                
                {/* Media Attachments */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Upload preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-fast rounded-lg flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-fast opacity-0 group-hover:opacity-100"
                            aria-label="Remove image"
                          >
                            <ApperIcon name="X" size={16} />
                          </button>
                          <button
                            type="button"
                            className="p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white transition-colors duration-fast opacity-0 group-hover:opacity-100"
                            aria-label="Edit image"
                          >
                            <ApperIcon name="Edit" size={16} />
                          </button>
                        </div>
                        {index === 0 && images.length > 1 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Compose Tools */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    {/* Image Upload */}
                    <label className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-fast">
                      <ApperIcon name="Image" size={20} className="text-gray-500" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    
                    {/* Emoji Picker */}
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-fast"
                      aria-label="Add emoji"
                    >
                      <ApperIcon name="Smile" size={20} className="text-gray-500" />
                    </button>
                    
                    {/* Location Toggle */}
                    <button
                      type="button"
                      onClick={() => setIncludeLocation(!includeLocation)}
                      className={`p-2 rounded-full transition-colors duration-fast ${
                        includeLocation 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-gray-100 text-gray-500"
                      }`}
                      aria-label="Add location"
                    >
                      <ApperIcon name="MapPin" size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Image Counter */}
                    {images.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {images.length}/4 photos
                      </span>
                    )}
                    
                    {/* Character Count */}
                    <div className={`text-sm font-medium ${
                      isOverLimit ? "text-error" : 
                      remainingChars <= 20 ? "text-warning" : 
                      "text-gray-500"
                    }`}>
                      {remainingChars}
                    </div>
                  </div>
                </div>
              </div>
            </div>

</div>

          {/* Publishing Controls */}
          <div className="bg-surface rounded-card shadow-card p-4 border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-4">Publishing Options</h3>
            
            {/* Audience Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who can see this post?
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="public">🌍 Everyone (Public)</option>
                  <option value="followers">👥 Followers only</option>
                  <option value="private">🔒 Only me (Private)</option>
                </select>
              </div>
              
              {/* Post Settings */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Allow comments</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={allowSharing}
                    onChange={(e) => setAllowSharing(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Allow sharing</span>
                </label>
              </div>
              
              {/* Location Toggle */}
              {includeLocation && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-primary">
                    <ApperIcon name="MapPin" size={16} />
                    <span className="text-sm font-medium">Location will be included</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Your approximate location will be visible to viewers
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Post Preview */}
          {content.trim() && (
            <div className="bg-surface rounded-card shadow-card p-4 border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">Post Preview</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex space-x-3">
                  <Avatar username="you" size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{user?.name || "Your Name"}</span>
                      <span className="text-xs text-gray-500">now</span>
                      {audience !== "public" && (
                        <span className="text-xs text-gray-500">
                          • {audience === "followers" ? "Followers" : "Private"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
                    {images.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        📸 {images.length} image{images.length !== 1 ? 's' : ''} attached
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
</form>
      </div>
</div>
  )
}

export default Create
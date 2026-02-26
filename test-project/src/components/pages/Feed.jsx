import { useState, useEffect, useCallback } from "react"
import { toast } from "react-toastify"
import FeedHeader from "@/components/molecules/FeedHeader"
import PostCard from "@/components/organisms/PostCard"
import FloatingActionButton from "@/components/molecules/FloatingActionButton"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import postService from "@/services/api/postService"

const Feed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadPosts = useCallback(async () => {
    try {
      setError("")
      const postsData = await postService.getAll()
      setPosts(postsData)
    } catch (err) {
      setError("Failed to load posts. Please try again.")
      console.error("Error loading posts:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      setError("")
      const postsData = await postService.getAll()
      setPosts(postsData)
      toast.success("Feed refreshed!")
    } catch (err) {
      setError("Failed to refresh posts. Please try again.")
      toast.error("Failed to refresh feed")
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleLike = useCallback(async (postId) => {
    try {
      const updatedPost = await postService.toggleLike(postId)
      if (updatedPost) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.Id === postId ? updatedPost : post
          )
        )
        
        if (updatedPost.isLiked) {
          toast.success("Post liked!")
        }
      }
    } catch (err) {
      toast.error("Failed to like post")
      console.error("Error liking post:", err)
    }
  }, [])

  const handleShare = useCallback(async (postId, platform) => {
    try {
      const updatedPost = await postService.incrementShares(postId)
      if (updatedPost) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.Id === postId ? updatedPost : post
          )
        )
      }
    } catch (err) {
      console.error("Error sharing post:", err)
    }
  }, [])

  const handleReport = useCallback((postId) => {
    toast.info("Post reported. Thank you for keeping our community safe.")
  }, [])

  const handleHide = useCallback((postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.Id !== postId))
    toast.success("Post hidden from your feed")
  }, [])

  // Load posts on mount
  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <FeedHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        <ErrorView
          title="Unable to load feed"
          message={error}
          onRetry={loadPosts}
        />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <FeedHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        <Empty
          icon="Users"
          title="Your feed is empty"
          message="Start following people to see their posts here, or create your first post to get the conversation started!"
          actionLabel="Create your first post"
        />
        <FloatingActionButton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <FeedHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      
      {/* Feed Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.Id}
            post={post}
            onLike={handleLike}
            onShare={handleShare}
            onReport={handleReport}
            onHide={handleHide}
          />
        ))}

        {/* Load more indicator */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            You're all caught up! 🎉
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  )
}

export default Feed
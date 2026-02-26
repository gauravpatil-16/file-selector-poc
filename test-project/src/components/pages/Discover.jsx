import { useState, useEffect, useCallback, useMemo } from 'react'
import { formatDistance } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from "@/components/ApperIcon"
import Avatar from "@/components/atoms/Avatar"
import PostCard from "@/components/organisms/PostCard"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import postService from "@/services/api/postService"

const Discover = () => {
  // State management
const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedHashtag, setSelectedHashtag] = useState(null)
  const [hashtagPosts, setHashtagPosts] = useState([])
  const [loadingHashtagPosts, setLoadingHashtagPosts] = useState(false)

  // Data states
  const [trendingHashtags, setTrendingHashtags] = useState([])
  const [popularPosts, setPopularPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for URL search parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const queryParam = urlParams.get('q')
    if (queryParam) {
      setSearchQuery(queryParam)
      // Clear URL parameter after extracting it
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])
  // Search filters
  const searchFilters = [
    { id: 'all', label: 'All', icon: 'Search' },
    { id: 'posts', label: 'Posts', icon: 'FileText' },
    { id: 'hashtags', label: 'Tags', icon: 'Hash' }
  ]

  // Load initial data
  const loadDiscoverData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [trendingResult, popularResult] = await Promise.all([
        postService.getTrendingHashtags(8),
        postService.getPopularPosts(10)
      ])

      setTrendingHashtags(trendingResult)
      setPopularPosts(popularResult)
    } catch (err) {
      console.error("Error loading discover data:", err)
      setError(err.message || 'Failed to load discovery content')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDiscoverData()
  }, [loadDiscoverData])

  // Debounced search
  const searchPosts = useCallback(async (query, type) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setIsSearching(true)
      const results = await postService.searchPosts(query, type, 20)
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (err) {
      console.error("Error searching:", err)
      toast.error('Failed to search posts')
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPosts(searchQuery, searchType)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchType, searchPosts])

  // Handle hashtag click
  const handleHashtagClick = useCallback(async (hashtag) => {
    try {
      setSelectedHashtag(hashtag)
      setLoadingHashtagPosts(true)
      const posts = await postService.getPostsByHashtag(hashtag.tag, 20)
      setHashtagPosts(posts)
      setShowSearchResults(true)
    } catch (err) {
      console.error("Error loading hashtag posts:", err)
      toast.error('Failed to load hashtag posts')
    } finally {
      setLoadingHashtagPosts(false)
    }
  }, [])

  // Handle search input
  const handleSearchInput = useCallback((e) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (!value.trim()) {
      setShowSearchResults(false)
      setSelectedHashtag(null)
    }
  }, [])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
    setSelectedHashtag(null)
    setHashtagPosts([])
  }, [])

  // Handle post interactions
  const handlePostLike = useCallback(async (postId) => {
    try {
      await postService.likePost(postId)
      
      // Update popular posts if needed
      setPopularPosts(prev => prev.map(post => 
        post.Id === postId 
          ? { ...post, likes: post.likes + (post.isLiked ? -1 : 1), isLiked: !post.isLiked }
          : post
      ))
      
      // Update search results if needed
      setSearchResults(prev => prev.map(post => 
        post.Id === postId 
          ? { ...post, likes: post.likes + (post.isLiked ? -1 : 1), isLiked: !post.isLiked }
          : post
      ))
      
      // Update hashtag posts if needed
      setHashtagPosts(prev => prev.map(post => 
        post.Id === postId 
          ? { ...post, likes: post.likes + (post.isLiked ? -1 : 1), isLiked: !post.isLiked }
          : post
      ))
    } catch (err) {
      console.error("Error liking post:", err)
      toast.error('Failed to like post')
    }
  }, [])

  const handlePostShare = useCallback(async (postId) => {
    try {
      await postService.sharePost(postId)
      toast.success('Post shared successfully!')
      
      // Update posts share count
      const updateShares = (posts) => posts.map(post => 
        post.Id === postId ? { ...post, shares: post.shares + 1 } : post
      )
      
      setPopularPosts(updateShares)
      setSearchResults(updateShares)
      setHashtagPosts(updateShares)
    } catch (err) {
      console.error("Error sharing post:", err)
      toast.error('Failed to share post')
    }
  }, [])

  // Get current posts to display
  const currentPosts = useMemo(() => {
    if (selectedHashtag) return hashtagPosts
    if (showSearchResults) return searchResults
    return []
  }, [selectedHashtag, hashtagPosts, showSearchResults, searchResults])

  // Loading state
  if (loading) {
    return <Loading />
  }

  // Error state
  if (error) {
    return (
      <ErrorView
        title="Failed to Load Discovery"
        message={error}
        onRetry={loadDiscoverData}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-surface/80 backdrop-blur-lg border-b border-gray-200 z-sticky">
        <div className="flex items-center h-14 px-4">
          <h1 className="text-xl font-bold text-gray-900">Discover</h1>
          {showSearchResults && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="ml-auto p-2 text-gray-600 hover:text-gray-800 transition-colors duration-fast"
              aria-label="Clear search"
            >
              <ApperIcon name="X" size={20} />
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Search Bar */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ApperIcon name="Search" size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="Search for topics, people, or posts..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-fast"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>

          {/* Search Filter Tabs */}
          {(searchQuery || showSearchResults) && (
            <div className="flex space-x-2">
              {searchFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSearchType(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-fast ${
                    searchType === filter.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ApperIcon name={filter.icon} size={16} />
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results or Hashtag Posts */}
        {showSearchResults && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedHashtag ? `Posts with ${selectedHashtag.tag}` : `Search Results for "${searchQuery}"`}
              {currentPosts.length > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({currentPosts.length} {currentPosts.length === 1 ? 'result' : 'results'})
                </span>
              )}
            </h2>
            
            {loadingHashtagPosts ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : currentPosts.length === 0 ? (
              <Empty
                title="No posts found"
                message={selectedHashtag ? `No posts found with ${selectedHashtag.tag}` : `No posts found for "${searchQuery}"`}
                actionLabel="Clear Search"
                onAction={handleClearSearch}
              />
            ) : (
              <div className="space-y-4">
                {currentPosts.map((post) => (
                  <PostCard
                    key={post.Id}
                    post={post}
                    onLike={() => handlePostLike(post.Id)}
                    onShare={() => handlePostShare(post.Id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Regular Discovery Content */}
        {!showSearchResults && (
          <>
            {/* Trending Hashtags */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trending Topics</h2>
              {trendingHashtags.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <ApperIcon name="Hash" size={32} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No trending topics right now</p>
                  <p className="text-sm text-gray-500 mt-1">Check back later for trending hashtags</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {trendingHashtags.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleHashtagClick(item)}
                      className="bg-surface rounded-lg p-4 hover:shadow-card transition-all duration-fast cursor-pointer border border-gray-100 text-left"
                    >
                      <div className="text-primary font-semibold text-sm mb-1">
                        {item.tag}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {item.posts} posts
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Popular Posts */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Posts</h2>
              {popularPosts.length === 0 ? (
                <Empty
                  title="No popular posts"
                  message="Check back later for popular content"
                  icon="TrendingUp"
                />
              ) : (
                <div className="space-y-4">
                  {popularPosts.map((post) => (
                    <PostCard
                      key={post.Id}
                      post={post}
                      onLike={() => handlePostLike(post.Id)}
                      onShare={() => handlePostShare(post.Id)}
                    />
                  ))}
                </div>
              )}

              {/* Feature Coming Soon */}
              <div className="text-center py-8 px-4">
                <div className="bg-gradient-primary/10 rounded-lg p-6 max-w-md mx-auto">
                  <ApperIcon name="Sparkles" size={32} className="mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold text-gray-900 mb-2">More Discovery Features Coming Soon!</h3>
                  <p className="text-gray-600 text-sm">
                    We're working on advanced search, personalized recommendations, and more ways to discover amazing content.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default Discover
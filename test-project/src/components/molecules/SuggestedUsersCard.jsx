import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Avatar from '@/components/atoms/Avatar'
import suggestedUsersService from '@/services/api/suggestedUsersService'
import { cn } from '@/utils/cn'

const SuggestedUsersCard = () => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [followingUsers, setFollowingUsers] = useState(new Set())
  const [dismissingUsers, setDismissingUsers] = useState(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      setLoading(true)
      const data = await suggestedUsersService.getAll()
      setSuggestions(data)
    } catch (error) {
      console.error('Error loading suggestions:', error)
      toast.error('Failed to load suggested users')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUser = async (suggestion) => {
    if (followingUsers.has(suggestion.user.id)) return

    try {
      setFollowingUsers(prev => new Set([...prev, suggestion.user.id]))
      
      await suggestedUsersService.followUser(suggestion.user.id)
      
      toast.success(`Now following ${suggestion.user.name}`)
      
      // Remove from suggestions after following
      setSuggestions(prev => prev.filter(s => s.user.id !== suggestion.user.id))
    } catch (error) {
      console.error('Error following user:', error)
      toast.error('Failed to follow user')
    } finally {
      setFollowingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(suggestion.user.id)
        return newSet
      })
    }
  }

  const handleDismiss = async (suggestion) => {
    if (dismissingUsers.has(suggestion.id)) return

    try {
      setDismissingUsers(prev => new Set([...prev, suggestion.id]))
      
      await suggestedUsersService.dismissSuggestion(suggestion.id)
      
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
      toast.success('Suggestion dismissed')
    } catch (error) {
      console.error('Error dismissing suggestion:', error)
      toast.error('Failed to dismiss suggestion')
    } finally {
      setDismissingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(suggestion.id)
        return newSet
      })
    }
  }

  const handleViewProfile = (userId) => {
    navigate(`/profile?userId=${userId}`)
  }

  const handleSeeAll = () => {
    navigate('/discover?tab=suggested')
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-card p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Suggested for you</h3>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-200 rounded mb-1 animate-pulse" />
                <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-surface rounded-card p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Suggested for you</h3>
        </div>
        <div className="text-center py-6">
          <ApperIcon name="Users" size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">No suggestions available right now</p>
          <p className="text-gray-400 text-xs mt-1">Check back later for new suggestions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-card p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Suggested for you</h3>
        <button
          type="button"
          onClick={handleSeeAll}
          className="text-sm text-primary font-medium hover:text-primary-dark transition-colors duration-fast"
        >
          See All
        </button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.slice(0, 3).map((suggestion) => (
          <div key={suggestion.id} className="flex items-center space-x-3">
            {/* Avatar */}
            <div 
              className="cursor-pointer"
              onClick={() => handleViewProfile(suggestion.user.id)}
            >
              <Avatar
                src={suggestion.user.avatarUrl}
                alt={suggestion.user.name}
                username={suggestion.user.firstName || suggestion.user.name}
                size="sm"
                className="hover:opacity-80 transition-opacity duration-fast"
              />
            </div>

            {/* User Info */}
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => handleViewProfile(suggestion.user.id)}
            >
              <h4 className="font-medium text-gray-900 hover:text-primary transition-colors duration-fast">
                {suggestion.user.name}
              </h4>
              <p className="text-xs text-gray-500">
                {suggestion.mutualConnections > 0 
                  ? `${suggestion.mutualConnections} mutual connection${suggestion.mutualConnections > 1 ? 's' : ''}`
                  : suggestion.reason
                }
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleFollowUser(suggestion)}
                disabled={followingUsers.has(suggestion.user.id)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-fast",
                  followingUsers.has(suggestion.user.id)
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary-dark active:scale-95"
                )}
              >
                {followingUsers.has(suggestion.user.id) ? (
                  <div className="flex items-center space-x-1">
                    <ApperIcon name="Loader2" size={14} className="animate-spin" />
                    <span>Following</span>
                  </div>
                ) : (
                  'Follow'
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDismiss(suggestion)}
                disabled={dismissingUsers.has(suggestion.id)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-fast text-gray-500 hover:text-gray-700"
                aria-label="Dismiss suggestion"
              >
                {dismissingUsers.has(suggestion.id) ? (
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <ApperIcon name="X" size={16} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuggestedUsersCard
import { useState } from "react"
import ApperIcon from "@/components/ApperIcon"

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-surface/80 backdrop-blur-lg border-b border-gray-200 z-sticky">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-fast">
            <ApperIcon name="Edit3" size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Search */}
        <div className="sticky top-14 bg-background/80 backdrop-blur-sm p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ApperIcon name="Search" size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-fast"
            />
          </div>
        </div>

        {/* Empty State - No Real Conversations Yet */}
        <div className="text-center py-12 px-4">
          <ApperIcon name="MessageCircle" size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h2>
          <p className="text-gray-600 mb-6">Start a conversation with someone from your network!</p>
          <button type="button" className="px-6 py-3 bg-gradient-primary text-white font-medium rounded-lg hover:shadow-lg transition-all duration-fast active:scale-95">
            Start messaging
          </button>
        </div>

        {/* Feature Coming Soon */}
        <div className="text-center py-8 px-4">
          <div className="bg-gradient-primary/10 rounded-lg p-6 max-w-md mx-auto">
            <ApperIcon name="MessageSquare" size={32} className="mx-auto mb-3 text-primary" />
            <h3 className="font-semibold text-gray-900 mb-2">Full Messaging Coming Soon!</h3>
            <p className="text-gray-600 text-sm">
              We're building a complete messaging experience with real-time chat, media sharing, and group conversations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages
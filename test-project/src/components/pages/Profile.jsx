import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { formatDistance } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Avatar from "@/components/atoms/Avatar";
import Create from "@/components/pages/Create";
import SuggestedUsersCard from "@/components/molecules/SuggestedUsersCard";
const Profile = () => {
  const { user: currentUser } = useSelector(state => state.user);
  
  const user = {
    username: currentUser?.FirstName?.toLowerCase() || "you",
    displayName: currentUser?.Name || "Your Name",
    bio: currentUser?.bio_c || "Passionate about connecting people through meaningful conversations. Love exploring new ideas, sharing thoughts, and building community. ✨",
    followers: "1,234",
    following: "567", 
    posts: "89",
    location: "San Francisco, CA",
    website: "yourwebsite.com",
    joinDate: "March 2023"
  }

  // Sample user posts
  const userPosts = [
    {
      id: "up1",
      content: "Beautiful sunset from my evening walk today! Sometimes you have to slow down to appreciate the simple moments 🌅",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop&crop=entropy&cs=tinysrgb",
      likes: 156,
      comments: 23,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6)
    },
    {
      id: "up2", 
      content: "Just finished reading an incredible book on design thinking. The power of human-centered design never ceases to amaze me! 📚",
      imageUrl: null,
      likes: 89,
      comments: 12,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
    },
    {
      id: "up3",
      content: "Weekend project: homemade pizza from scratch! The dough took 24 hours but it was so worth it 🍕",
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=entropy&cs=tinysrgb",
      likes: 234,
      comments: 45,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
    },
    {
      id: "up4",
      content: "Morning coffee and contemplation. There's something magical about the first sip that makes everything feel possible ☕",
      imageUrl: null,
      likes: 67,
      comments: 8,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
    },
    {
      id: "up5",
      content: "Exploring the city's art district today. So much creativity and inspiration in every corner!",
      imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop&crop=entropy&cs=tinysrgb",
      likes: 123,
      comments: 19,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    },
    {
      id: "up6",
      content: "Late night coding session with some jazz in the background. These are the moments when the best ideas flow 💻",
      imageUrl: null,
      likes: 91,
      comments: 14,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
    }
];

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-surface/80 backdrop-blur-lg border-b border-gray-200 z-sticky">
        <div className="flex items-center justify-between h-14 px-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{user.displayName}</h1>
            <p className="text-sm text-gray-500">{user.posts} posts</p>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-fast">
            <ApperIcon name="Settings" size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-surface border-b border-gray-200">
          {/* Cover Image Placeholder */}
          <div className="h-32 bg-gradient-primary relative" />
          
          <div className="px-4 pb-4">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <Avatar
                username={user.username}
                alt={user.displayName}
                size="xl"
                className="border-4 border-white"
              />
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-end mb-4">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors duration-fast">
                Edit Profile
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.displayName}</h2>
                <p className="text-gray-600">@{user.username}</p>
              </div>

              <p className="text-gray-800 leading-relaxed">
                {user.bio}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <ApperIcon name="MapPin" size={16} />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ApperIcon name="Link" size={16} />
                  <span className="text-primary">{user.website}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ApperIcon name="Calendar" size={16} />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900">{user.following}</span>
                  <span className="text-gray-600">Following</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900">{user.followers}</span>
<span className="text-gray-600">Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Users */}
        <div className="p-4 border-b border-gray-200">
          <SuggestedUsersCard />
        </div>

        {/* Posts Grid */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts</h3>
          
          <div className="grid grid-cols-3 gap-1">
            {userPosts.map((post) => (
              <div
                key={post.id}
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition-opacity duration-fast cursor-pointer"
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-primary/10 p-2">
                    <p className="text-xs text-gray-800 text-center leading-tight line-clamp-4">
                      {post.content}
                    </p>
                  </div>
                )}
                
                {/* Post Stats Overlay */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-fast flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex items-center space-x-4 text-white text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Heart" size={16} />
                      <span>{formatCount(post.likes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="MessageCircle" size={16} />
                      <span>{formatCount(post.comments)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty slots to show grid structure */}
            {[...Array(Math.max(0, 6 - userPosts.length))].map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <ApperIcon name="Plus" size={24} className="text-gray-400" />
              </div>
            ))}
          </div>

          {/* Empty State for No Posts */}
          {userPosts.length === 0 && (
            <div className="text-center py-12">
              <ApperIcon name="Camera" size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Share your first post to get started!</p>
              <button className="px-6 py-3 bg-gradient-primary text-white font-medium rounded-lg hover:shadow-lg transition-all duration-fast active:scale-95">
                Create your first post
              </button>
            </div>
          )}
        </div>

        {/* Feature Coming Soon */}
        <div className="text-center py-8 px-4">
          <div className="bg-gradient-primary/10 rounded-lg p-6 max-w-md mx-auto">
            <ApperIcon name="User" size={32} className="mx-auto mb-3 text-primary" />
            <h3 className="font-semibold text-gray-900 mb-2">Enhanced Profiles Coming Soon!</h3>
            <p className="text-gray-600 text-sm">
              We're building advanced profile customization, detailed analytics, and more ways to showcase your personality.
            </p>
          </div>
        </div>
      </div>
</div>
  );
};

export default Profile;
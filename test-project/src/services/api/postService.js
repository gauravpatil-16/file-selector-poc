import { getApperClient } from '@/services/apperClient'
import { userService } from './userService'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const postService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      
      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "likes_c"}},
          {"field": {"Name": "comments_c"}},
          {"field": {"Name": "shares_c"}},
          {"field": {"Name": "is_liked_c"}},
          {"field": {"Name": "author_id_c"}},
          {"field": {"Name": "popularity_score_c"}},
          {"field": {"Name": "trending_score_c"}}
        ],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }]
      })
      
      if (!response.success) {
        console.error("Failed to fetch posts:", response)
        throw new Error(response.message)
      }
      
      const posts = response.data || []
      
      // Fetch authors and combine with posts
      const postsWithAuthors = await Promise.all(
        posts.map(async (post) => {
          let author = { Id: post.author_id_c?.Id, Name: post.author_id_c?.Name, FirstName: post.author_id_c?.FirstName || post.author_id_c?.Name }
          
          return {
            Id: post.Id,
            content: post.content_c,
            imageUrl: post.image_url_c,
            timestamp: post.timestamp_c ? dayjs(post.timestamp_c).format() : dayjs().format(),
            likes: post.likes_c || 0,
            comments: post.comments_c || 0,
            shares: post.shares_c || 0,
            isLiked: post.is_liked_c || false,
            popularityScore: post.popularity_score_c || 0,
            trendingScore: post.trending_score_c || 0,
            author: {
              Id: author.Id,
              username: author.FirstName ? author.FirstName.toLowerCase().replace(/\s+/g, '_') : 'user',
              displayName: author.Name || 'Unknown User',
              avatarUrl: null,
              bio: null
            }
          }
        })
      )
      
      return postsWithAuthors
    } catch (error) {
      console.error("Error loading posts:", error)
      throw error
    }
  },

  async getPopularPosts(limit = 10) {
    try {
      const apperClient = getApperClient()
      
      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "likes_c"}},
          {"field": {"Name": "comments_c"}},
          {"field": {"Name": "shares_c"}},
          {"field": {"Name": "is_liked_c"}},
          {"field": {"Name": "author_id_c"}},
          {"field": {"Name": "popularity_score_c"}}
        ],
orderBy: [{
          "fieldName": "popularity_score_c",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      })
      
      if (!response.success) {
        console.error("Failed to fetch popular posts:", response)
        throw new Error(response.message)
      }
      
      const posts = response.data || []
      
      const postsWithAuthors = await Promise.all(
        posts.map(async (post) => {
          let author = { Id: post.author_id_c?.Id, Name: post.author_id_c?.Name, FirstName: post.author_id_c?.FirstName || post.author_id_c?.Name }
          
          return {
            Id: post.Id,
            content: post.content_c,
            imageUrl: post.image_url_c,
            timestamp: post.timestamp_c ? dayjs(post.timestamp_c).format() : dayjs().format(),
            likes: post.likes_c || 0,
            comments: post.comments_c || 0,
            shares: post.shares_c || 0,
            isLiked: post.is_liked_c || false,
            popularityScore: post.popularity_score_c || 0,
            author: {
              Id: author.Id,
              username: author.FirstName ? author.FirstName.toLowerCase().replace(/\s+/g, '_') : 'user',
              displayName: author.Name || 'Unknown User',
              avatarUrl: null,
              bio: null
            }
          }
        })
      )
      
      return postsWithAuthors
    } catch (error) {
      console.error("Error loading popular posts:", error)
      return []
    }
  },

  async getTrendingHashtags(limit = 8) {
    try {
      const apperClient = getApperClient()
      
      // Get recent posts to analyze hashtags
      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "likes_c"}},
          {"field": {"Name": "comments_c"}},
          {"field": {"Name": "shares_c"}},
          {"field": {"Name": "timestamp_c"}}
        ],
        where: [{
          "FieldName": "timestamp_c",
          "Operator": "RelativeMatch",
          "Values": ["last 7 day"],
          "Include": true
        }],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      })
      
      if (!response.success) {
        console.error("Failed to fetch posts for trending hashtags:", response)
        return []
      }
      
      const posts = response.data || []
      const hashtagCounts = {}
      
      // Extract and count hashtags
      posts.forEach(post => {
        if (post.content_c) {
          const hashtags = post.content_c.match(/#\w+/g) || []
          hashtags.forEach(hashtag => {
            const normalizedTag = hashtag.toLowerCase()
            if (!hashtagCounts[normalizedTag]) {
              hashtagCounts[normalizedTag] = {
                tag: hashtag,
                posts: 0,
                engagement: 0
              }
            }
            hashtagCounts[normalizedTag].posts += 1
            hashtagCounts[normalizedTag].engagement += (post.likes_c || 0) + (post.comments_c || 0) + (post.shares_c || 0)
          })
        }
      })
      
      // Sort by engagement and posts count
      const trending = Object.values(hashtagCounts)
        .sort((a, b) => (b.engagement + b.posts * 10) - (a.engagement + a.posts * 10))
        .slice(0, limit)
        .map(item => ({
          tag: item.tag,
          posts: item.posts > 1000 ? `${(item.posts / 1000).toFixed(1)}K` : item.posts.toString()
        }))
      
      return trending
    } catch (error) {
      console.error("Error getting trending hashtags:", error)
      return []
    }
  },

  async searchPosts(query, searchType = 'all', limit = 20) {
    try {
      if (!query || query.trim() === '') {
        return []
      }

      const apperClient = getApperClient()
      let where = []
      
      if (searchType === 'posts' || searchType === 'all') {
        where.push({
          "FieldName": "content_c",
          "Operator": "Contains",
          "Values": [query.trim()],
          "Include": true
        })
      }
      
      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "likes_c"}},
          {"field": {"Name": "comments_c"}},
          {"field": {"Name": "shares_c"}},
          {"field": {"Name": "is_liked_c"}},
          {"field": {"Name": "author_id_c"}},
          {"field": {"Name": "popularity_score_c"}}
        ],
        where: where,
        orderBy: [{
          "fieldName": "popularity_score_c",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      })
      
      if (!response.success) {
        console.error("Failed to search posts:", response)
        return []
      }
      
      const posts = response.data || []
      
      const postsWithAuthors = await Promise.all(
        posts.map(async (post) => {
          let author = { Id: post.author_id_c?.Id, Name: post.author_id_c?.Name, FirstName: post.author_id_c?.FirstName || post.author_id_c?.Name }
          
          return {
            Id: post.Id,
            content: post.content_c,
            imageUrl: post.image_url_c,
            timestamp: post.timestamp_c ? dayjs(post.timestamp_c).format() : dayjs().format(),
            likes: post.likes_c || 0,
            comments: post.comments_c || 0,
            shares: post.shares_c || 0,
            isLiked: post.is_liked_c || false,
            popularityScore: post.popularity_score_c || 0,
            author: {
              Id: author.Id,
              username: author.FirstName ? author.FirstName.toLowerCase().replace(/\s+/g, '_') : 'user',
              displayName: author.Name || 'Unknown User',
              avatarUrl: null,
              bio: null
            }
          }
        })
      )
      
      return postsWithAuthors
    } catch (error) {
      console.error("Error searching posts:", error)
      return []
    }
  },

  async getPostsByHashtag(hashtag, limit = 20) {
    try {
      const apperClient = getApperClient()
      
      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "likes_c"}},
          {"field": {"Name": "comments_c"}},
          {"field": {"Name": "shares_c"}},
          {"field": {"Name": "is_liked_c"}},
          {"field": {"Name": "author_id_c"}}
        ],
        where: [{
          "FieldName": "content_c",
          "Operator": "Contains",
          "Values": [hashtag],
          "Include": true
        }],
        orderBy: [{
          "fieldName": "timestamp_c",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          limit: limit,
          offset: 0
        }
      })
      
      if (!response.success) {
        console.error("Failed to fetch posts by hashtag:", response)
        return []
      }
      
      const posts = response.data || []
      
      const postsWithAuthors = await Promise.all(
        posts.map(async (post) => {
          let author = { Id: post.author_id_c?.Id, Name: post.author_id_c?.Name, FirstName: post.author_id_c?.FirstName || post.author_id_c?.Name }
          
          return {
            Id: post.Id,
            content: post.content_c,
            imageUrl: post.image_url_c,
            timestamp: post.timestamp_c ? dayjs(post.timestamp_c).format() : dayjs().format(),
            likes: post.likes_c || 0,
            comments: post.comments_c || 0,
            shares: post.shares_c || 0,
            isLiked: post.is_liked_c || false,
            author: {
              Id: author.Id,
              username: author.FirstName ? author.FirstName.toLowerCase().replace(/\s+/g, '_') : 'user',
              displayName: author.Name || 'Unknown User',
              avatarUrl: null,
              bio: null
            }
          }
        })
      )
      
      return postsWithAuthors
    } catch (error) {
      console.error("Error fetching posts by hashtag:", error)
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      
      const response = await apperClient.getRecordById('post_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "likes_c"}},
          {"field": {"Name": "comments_c"}},
          {"field": {"Name": "shares_c"}},
          {"field": {"Name": "is_liked_c"}},
          {"field": {"Name": "author_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error(`Failed to fetch post with Id: ${id}:`, response)
        return null
      }
      
      const post = response.data
      if (!post) return null
      
      let author = { Id: post.author_id_c?.Id, Name: post.author_id_c?.Name, FirstName: post.author_id_c?.FirstName || post.author_id_c?.Name }
      
      return {
        Id: post.Id,
        content: post.content_c,
        imageUrl: post.image_url_c,
        timestamp: post.timestamp_c ? dayjs(post.timestamp_c).format() : dayjs().format(),
        likes: post.likes_c || 0,
        comments: post.comments_c || 0,
        shares: post.shares_c || 0,
        isLiked: post.is_liked_c || false,
        author: {
          Id: author.Id,
          username: author.FirstName ? author.FirstName.toLowerCase().replace(/\s+/g, '_') : 'user',
          displayName: author.Name || 'Unknown User',
          avatarUrl: null,
          bio: null
        }
      }
    } catch (error) {
      console.error(`Error fetching record ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

async create(postData) {
    try {
      const apperClient = getApperClient()
      
      // Validate image URL length if provided (database limit is 255 characters)
      let imageUrl = postData.imageUrl || null
      if (imageUrl && imageUrl.length > 255) {
        console.warn('Image URL exceeds 255 characters, setting to null')
        imageUrl = null
      }
      
      const params = {
        records: [{
          Name: postData.content?.substring(0, 50) || 'New Post',
          content_c: postData.content,
          image_url_c: imageUrl,
          timestamp_c: dayjs().utc().toISOString(),
          likes_c: 0,
          comments_c: 0,
          shares_c: 0,
          is_liked_c: false
        }]
      }
      
      const response = await apperClient.createRecord('post_c', params)
      
      if (!response.success) {
        console.error("Failed to create post:", response)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} posts:`, failed)
        }
        
        if (successful.length > 0) {
          const newPost = successful[0].data
          return {
            Id: newPost.Id,
            content: newPost.content_c,
            imageUrl: newPost.image_url_c,
            timestamp: newPost.timestamp_c ? dayjs(newPost.timestamp_c).format() : dayjs().format(),
            likes: newPost.likes_c || 0,
            comments: newPost.comments_c || 0,
            shares: newPost.shares_c || 0,
            isLiked: newPost.is_liked_c || false,
            author: {
              Id: 1,
              username: 'you',
              displayName: 'You',
              avatarUrl: null,
              bio: null
            }
          }
        }
      }
      
      return null
    } catch (error) {
      console.error("Error creating post:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, data) {
    try {
      const apperClient = getApperClient()
      
      const updateData = {}
      if (data.content !== undefined) updateData.content_c = data.content
      if (data.imageUrl !== undefined) updateData.image_url_c = data.imageUrl
      if (data.likes !== undefined) updateData.likes_c = data.likes
      if (data.comments !== undefined) updateData.comments_c = data.comments
      if (data.shares !== undefined) updateData.shares_c = data.shares
      if (data.isLiked !== undefined) updateData.is_liked_c = data.isLiked
      
      const params = {
        records: [{
          Id: parseInt(id),
          ...updateData
        }]
      }
      
      const response = await apperClient.updateRecord('post_c', params)
      
      if (!response.success) {
        console.error("Failed to update post:", response)
        return null
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} posts:`, failed)
        }
        
        if (successful.length > 0) {
          return this.getById(id)
        }
      }
      
      return null
    } catch (error) {
      console.error("Error updating post:", error?.response?.data?.message || error)
      return null
    }
  },

  async toggleLike(id) {
    try {
      // Get current post state
      const currentPost = await this.getById(id)
      if (!currentPost) return null
      
      const newLikedState = !currentPost.isLiked
      const likeChange = newLikedState ? 1 : -1
      const newLikes = Math.max(0, currentPost.likes + likeChange)
      
      return this.update(id, {
        isLiked: newLikedState,
        likes: newLikes
      })
    } catch (error) {
      console.error("Error toggling like:", error)
      return null
    }
  },

  async incrementShares(id) {
    try {
      const currentPost = await this.getById(id)
      if (!currentPost) return null
      
      return this.update(id, {
        shares: currentPost.shares + 1
      })
    } catch (error) {
      console.error("Error incrementing shares:", error)
      return null
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await apperClient.deleteRecord('post_c', params)
      
      if (!response.success) {
        console.error("Failed to delete post:", response)
        return false
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} posts:`, failed)
        }
        
        return successful.length > 0
      }
      
      return false
    } catch (error) {
      console.error("Error deleting post:", error?.response?.data?.message || error)
      return false
    }
  }
}

export default postService
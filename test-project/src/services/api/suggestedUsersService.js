import { getApperClient } from '@/services/apperClient'

export const suggestedUsersService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      
      const response = await apperClient.admin.fetchRecords('suggested_users_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "suggested_user_id_c"}},
          {"field": {"Name": "mutual_connections_c"}},
          {"field": {"Name": "suggestion_reason_c"}}
        ],
orderBy: [{
          "fieldName": "mutual_connections_c",
          "sorttype": "DESC"
        }],
        pagingInfo: {
          limit: 5,
          offset: 0
        }
      })
      
      if (!response.success) {
        console.error("Failed to fetch suggested users:", response)
        throw new Error(response.message)
      }
      
      // Transform the data to include user details
      const suggestions = response.data || []
      const enrichedSuggestions = []
      
      for (const suggestion of suggestions) {
        try {
          const userResponse = await apperClient.admin.getRecordById('User', suggestion.suggested_user_id_c, {
            fields: [
              {"field": {"Name": "Id"}},
              {"field": {"Name": "Name"}},
              {"field": {"Name": "FirstName"}},
              {"field": {"Name": "LastName"}},
              {"field": {"Name": "AvatarUrl"}},
              {"field": {"Name": "bio_c"}}
            ]
          })
          
          if (userResponse.success && userResponse.data) {
            enrichedSuggestions.push({
              id: suggestion.Id,
              mutualConnections: suggestion.mutual_connections_c || 0,
              reason: suggestion.suggestion_reason_c || 'Suggested for you',
              user: {
                id: userResponse.data.Id,
                name: userResponse.data.Name || `${userResponse.data.FirstName} ${userResponse.data.LastName}`.trim(),
                firstName: userResponse.data.FirstName,
                lastName: userResponse.data.LastName,
                avatarUrl: userResponse.data.AvatarUrl,
                bio: userResponse.data.bio_c
              }
            })
          }
        } catch (userError) {
          console.error(`Error fetching user details for suggestion ${suggestion.Id}:`, userError)
        }
      }
      
      return enrichedSuggestions
    } catch (error) {
      console.error("Error fetching suggested users:", error)
      return []
    }
  },

async followUser(userId) {
    // For now, we'll just return success since we don't have a follow table
    // In a real app, this would create a record in a follows/connections table
    return { success: true, message: 'User followed successfully' }
  },

  async dismissSuggestion(suggestionId) {
    try {
      const apperClient = getApperClient()
      
      const response = await apperClient.admin.deleteRecord('suggested_users_c', suggestionId)
      
      if (!response.success) {
        console.error(`Failed to dismiss suggestion ${suggestionId}:`, response)
        throw new Error(response.message)
      }
      
      return { success: true, message: 'Suggestion dismissed' }
    } catch (error) {
      console.error(`Error dismissing suggestion ${suggestionId}:`, error)
      throw error
    }
  }
}

export default suggestedUsersService
import { getApperClient } from '@/services/apperClient'

export const userService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      
      const response = await apperClient.admin.fetchRecords('User', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "FirstName"}},
          {"field": {"Name": "LastName"}},
          {"field": {"Name": "Email"}},
          {"field": {"Name": "AvatarUrl"}},
          {"field": {"Name": "bio_c"}}
        ],
        orderBy: [{
          "fieldName": "Name",
          "sorttype": "ASC"
        }]
      })
      
      if (!response.success) {
        console.error("Failed to fetch users:", response)
        throw new Error(response.message)
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  },

async getById(id) {
    try {
      const apperClient = getApperClient()
      
      const response = await apperClient.admin.getRecordById('User', id, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "FirstName"}},
          {"field": {"Name": "LastName"}},
          {"field": {"Name": "Email"}},
          {"field": {"Name": "AvatarUrl"}},
          {"field": {"Name": "bio_c"}}
        ]
      })
      
      if (!response.success) {
        console.error(`Failed to fetch user with Id: ${id}:`, response)
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

async followUser(userId) {
    // For now, we'll simulate following a user
    // In a real implementation, this would create a follow relationship record
    return { success: true, message: 'User followed successfully' }
  }
}
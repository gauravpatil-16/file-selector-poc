import { getApperClient } from '@/services/apperClient';

const getApperClientInstance = () => {
  const client = getApperClient();
  if (!client) {
    throw new Error('ApperClient not available');
  }
  return client;
};

export const userService = {
  async getCurrentUser() {
    try {
      const apperClient = getApperClientInstance();
      
      // Get current user ID from Redux would be preferred, but we'll use admin fetchRecords
      const response = await apperClient.admin.fetchRecords('User', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "FirstName"}},
          {"field": {"Name": "LastName"}},
          {"field": {"Name": "Email"}},
          {"field": {"Name": "AvatarUrl"}},
          {"field": {"Name": "business_name_c"}},
          {"field": {"Name": "logo_url_c"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });
      
      if (!response.success) {
        console.error("Failed to fetch current user:", response);
        throw new Error(response.message);
      }
      
      return response.data?.[0] || null;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },

  async updateBusinessInfo(userId, businessData) {
    try {
      const apperClient = getApperClientInstance();
      
      const params = {
        records: [{
          Id: userId,
          business_name_c: businessData.businessName,
          logo_url_c: businessData.logoUrl
        }]
      };
      
      const response = await apperClient.admin.updateRecord('User', params);
      
      if (!response.success) {
        console.error("Failed to update business info:", response);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        return successful[0]?.data;
      }
    } catch (error) {
      console.error("Error updating business info:", error?.response?.data?.message || error);
      throw error;
    }
  }
};
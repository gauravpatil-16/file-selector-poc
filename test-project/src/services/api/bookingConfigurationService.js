import { getApperClient } from "@/services/apperClient";

const getApperClientInstance = () => {
  const client = getApperClient();
  if (!client) {
    throw new Error('ApperClient not available');
  }
  return client;
};

export const bookingConfigurationService = {
  async getAll() {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('booking_configuration_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "business_logo_c"}},
          {"field": {"Name": "services_c"}},
          {"field": {"Name": "slug_c"}},
          {"field": {"Name": "Owner"}}
        ],
        orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}]
      });
      
      if (!response.success) {
        console.error("Failed to fetch booking configurations:", response);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching booking configurations:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.getRecordById('booking_configuration_c', id, {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "business_logo_c"}},
          {"field": {"Name": "services_c"}},
          {"field": {"Name": "slug_c"}},
          {"field": {"Name": "Owner"}}
        ]
      });
      
      if (!response.success) {
        console.error(`Failed to fetch booking configuration with Id: ${id}:`, response);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking configuration ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

async getBySlug(slug) {
    try {
      const apperClient = getApperClientInstance();
      
      if (!apperClient) {
        throw new Error("ApperClient not available - check SDK initialization");
      }
      
      if (!slug) {
        throw new Error("Slug is required to fetch booking configuration");
      }
      
      const response = await apperClient.fetchRecords('booking_configuration_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "business_logo_c"}},
          {"field": {"Name": "services_c"}},
          {"field": {"Name": "slug_c"}},
          {"field": {"Name": "Owner"}}
        ],
        where: [
          {
            "FieldName": "slug_c",
            "Operator": "EqualTo",
            "Values": [slug],
            "Include": true
          }
        ]
      });
      
      if (!response.success) {
        console.error("Failed to fetch booking configuration by slug:", response);
        throw new Error(`Database query failed: ${response.message || 'Unknown error'}`);
      }
      
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error("Error fetching booking configuration by slug:", error);
      throw error;
    }
  },

async getUserConfig() {
    try {
      const apperClient = getApperClientInstance();
      
      if (!apperClient) {
        throw new Error("ApperClient not available - check SDK initialization");
      }
      
      // First, always check for existing configuration (RLS automatically filters to user's records)
      const response = await apperClient.fetchRecords('booking_configuration_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "business_logo_c"}},
          {"field": {"Name": "services_c"}},
          {"field": {"Name": "slug_c"}},
          {"field": {"Name": "Owner"}}
        ],
        orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}]
      });
      
      if (!response.success) {
        console.error("Failed to fetch user booking configuration:", response);
        throw new Error(`Database query failed: ${response.message || 'Unknown error'}`);
      }
      
      // If configuration exists, return it
      if (response.data && response.data.length > 0) {
        console.log("Found existing booking configuration for user");
        return response.data[0];
      }
      
      // No configuration found - auto-create one for the authenticated user
      console.log("No booking configuration found for user, creating default configuration");
      
      const newSlug = await this.generateRandomSlug();
      const defaultConfig = {
        Name: "My Booking Page",
        user_name_c: "Booking Provider",
        business_logo_c: "",
        services_c: "[]",
        slug_c: newSlug
      };
      
      const createResponse = await apperClient.createRecord('booking_configuration_c', {
        records: [defaultConfig]
      });
      
      if (!createResponse.success) {
        console.error("Failed to create booking configuration:", createResponse);
        throw new Error(`Failed to create configuration: ${createResponse.message || 'Unknown error'}`);
      }
      
      if (createResponse.results && createResponse.results.length > 0) {
        const successful = createResponse.results.filter(r => r.success);
        if (successful.length > 0) {
          console.log("Successfully created default booking configuration for user");
          return successful[0].data;
        }
      }
      
      console.error("Failed to create booking configuration - no successful results");
      throw new Error("Configuration creation succeeded but no data returned");
      
    } catch (error) {
      console.error("Error ensuring user booking configuration:", error);
      throw error; // Re-throw to allow calling code to handle appropriately
    }
  },

  async create(configData) {
    try {
      const apperClient = getApperClientInstance();
      
      const params = {
        records: [{
          Name: configData.name,
          user_name_c: configData.userName,
          business_logo_c: configData.businessLogo,
          services_c: configData.services,
          slug_c: configData.slug
        }]
      };
      
      const response = await apperClient.createRecord('booking_configuration_c', params);
      
      if (!response.success) {
        console.error("Failed to create booking configuration:", response);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error}`);
            });
if (record.message) console.error(record.message);
          });
        }
        return successful[0]?.data;
      }
    } catch (error) {
      console.error("Error creating booking configuration:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, configData) {
    try {
      const apperClient = getApperClientInstance();
      
      const params = {
        records: [{
          Id: id,
          Name: configData.name,
          user_name_c: configData.userName,
          business_logo_c: configData.businessLogo,
          services_c: configData.services,
          slug_c: configData.slug
        }]
      };
      
      const response = await apperClient.updateRecord('booking_configuration_c', params);
      
      if (!response.success) {
        console.error("Failed to update booking configuration:", response);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error}`);
            });
if (record.message) console.error(record.message);
          });
        }
        return successful[0]?.data;
      }
    } catch (error) {
      console.error("Error updating booking configuration:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClientInstance();
      
      const params = { 
        RecordIds: [id]
      };
      
      const response = await apperClient.deleteRecord('booking_configuration_c', params);
      
      if (!response.success) {
        console.error("Failed to delete booking configuration:", response);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
if (record.message) console.error(record.message);
          });
        }
        return { success: true };
      }
    } catch (error) {
      console.error("Error deleting booking configuration:", error?.response?.data?.message || error);
      throw error;
    }
  },

async generateRandomSlug() {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let slug = '';
      
      // Generate random alphanumeric string
      do {
        slug = '';
        for (let i = 0; i < 12; i++) {
slug += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      } while (await this.getBySlug(slug)); // Ensure uniqueness
      
      return slug;
    } catch (error) {
      console.error("Error generating random slug:", error);
      return `booking-${Date.now()}`;
    }
  }
};
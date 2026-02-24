import { getApperClient } from '@/services/apperClient';

const getApperClientInstance = () => {
  const client = getApperClient();
  if (!client) {
    throw new Error('ApperClient not available');
  }
  return client;
};

export const serviceService = {
async getAll() {
    try {
      const apperClient = getApperClientInstance();
      
const response = await apperClient.fetchRecords('service_c', {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "duration_c"}}, 
          {"field": {"Name": "price_c"}}, 
          {"field": {"Name": "description_c"}}, 
          {"field": {"Name": "is_active_c"}},
          {"field": {"Name": "slug_c"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });
      
      if (!response.success) {
        console.error("Failed to fetch services:", response);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  },
async getById(id) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.getRecordById('service_c', id, {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "duration_c"}}, 
          {"field": {"Name": "price_c"}}, 
          {"field": {"Name": "description_c"}}, 
          {"field": {"Name": "is_active_c"}},
          {"field": {"Name": "slug_c"}}
        ]
      });
      
      if (!response.success) {
        console.error(`Failed to fetch service with Id: ${id}:`, response);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async getBySlug(slug) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('service_c', {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "duration_c"}}, 
          {"field": {"Name": "price_c"}}, 
          {"field": {"Name": "description_c"}}, 
          {"field": {"Name": "is_active_c"}},
          {"field": {"Name": "slug_c"}}
        ],
        where: [
          {
            "FieldName": "slug_c",
            "Operator": "EqualTo",
            "Values": [slug],
            "Include": true
          },
          {
            "FieldName": "is_active_c",
            "Operator": "EqualTo",
            "Values": [true],
            "Include": true
          }
        ]
      });
      
      if (!response.success) {
        console.error(`Failed to fetch service with slug: ${slug}:`, response);
        throw new Error(response.message);
      }
      
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error(`Error fetching service by slug ${slug}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

async create(serviceData) {
    try {
      const apperClient = getApperClientInstance();
      
      // Use booking configuration slug if provided, otherwise generate unique slug
      const slug = serviceData.bookingConfigSlug || await this.generateUniqueSlug(serviceData.name);
      
      const params = {
        records: [{
          Name: serviceData.name,
          duration_c: serviceData.duration,
          price_c: serviceData.price,
          description_c: serviceData.description,
          is_active_c: serviceData.isActive,
          slug_c: slug
        }]
      };
      
      const response = await apperClient.createRecord('service_c', params);
      
      if (!response.success) {
        console.error("Failed to create service:", response);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
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
      console.error("Error creating service:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async generateUniqueSlug(serviceName) {
    try {
      // Create slug from service name
      let baseSlug = serviceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Ensure minimum length
      if (baseSlug.length < 3) {
        baseSlug = `service-${baseSlug}`;
      }
      
      // Check uniqueness and append number if needed
      let slug = baseSlug;
      let counter = 1;
      
      while (await this.isSlugTaken(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      return slug;
    } catch (error) {
      console.error("Error generating slug:", error);
      // Fallback to timestamp-based slug
      return `service-${Date.now()}`;
    }
  },

async isSlugTaken(slug) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('service_c', {
        fields: [{"field": {"Name": "slug_c"}}],
        where: [
          {
            "FieldName": "slug_c",
            "Operator": "EqualTo",
            "Values": [slug],
            "Include": true
          }
        ]
      });
      
      return response.success && response.data && response.data.length > 0;
    } catch (error) {
      console.error("Error checking slug uniqueness:", error);
      // If we can't check, assume it's taken to be safe
      return true;
    }
  },

  async getAllBySlug(slug) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('service_c', {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "duration_c"}}, 
          {"field": {"Name": "price_c"}}, 
          {"field": {"Name": "description_c"}}, 
          {"field": {"Name": "is_active_c"}},
          {"field": {"Name": "slug_c"}}
        ],
        where: [
          {
            "FieldName": "slug_c",
            "Operator": "EqualTo",
            "Values": [slug],
            "Include": true
          },
          {
            "FieldName": "is_active_c",
            "Operator": "EqualTo",
            "Values": [true],
            "Include": true
          }
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });
      
      if (!response.success) {
        console.error(`Failed to fetch services with slug: ${slug}:`, response);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching services by slug ${slug}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, serviceData) {
    try {
      const apperClient = getApperClientInstance();
      
const params = {
        records: [{
          Id: id,
          Name: serviceData.name,
          duration_c: serviceData.duration,
          price_c: serviceData.price,
          description_c: serviceData.description,
          is_active_c: serviceData.isActive,
          slug_c: serviceData.slug
        }]
      };
      
      const response = await apperClient.updateRecord('service_c', params);
      
      if (!response.success) {
        console.error("Failed to update service:", response);
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
      console.error("Error updating service:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClientInstance();
      
      const params = { 
        RecordIds: [id]
      };
      
      const response = await apperClient.deleteRecord('service_c', params);
      
      if (!response.success) {
        console.error("Failed to delete service:", response);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return { success: true };
      }
    } catch (error) {
      console.error("Error deleting service:", error?.response?.data?.message || error);
      throw error;
    }
},

  async generateSampleData() {
    const sampleServices = [
      {
        name: "Business Consultation",
        duration: 60,
        price: 150.00,
        description: "Strategic business planning and growth consultation session.",
        isActive: true
      },
      {
        name: "Personal Training",
        duration: 45,
        price: 75.00,
        description: "One-on-one fitness training session with certified trainer.",
        isActive: true
      },
      {
        name: "Legal Consultation",
        duration: 90,
        price: 200.00,
        description: "Professional legal advice and document review session.",
        isActive: true
      }
    ];

    for (const service of sampleServices) {
      await this.create(service);
    }
    
    return sampleServices;
  }
};
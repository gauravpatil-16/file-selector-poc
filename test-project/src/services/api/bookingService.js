import { getApperClient } from '@/services/apperClient';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Generate random alphanumeric slug
const generateSlug = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return [];
};

// Generate user booking page slug
const generateUserSlug = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
};

dayjs.extend(utc);
dayjs.extend(timezone);

const getApperClientInstance = () => {
  const client = getApperClient();
  if (!client) {
    throw new Error('ApperClient not available');
  }
  return client;
};

export const bookingService = {
async getAll() {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('booking_c', {
fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "client_name_c"}}, 
          {"field": {"Name": "client_email_c"}}, 
          {"field": {"Name": "client_phone_c"}}, 
          {"field": {"Name": "start_time_c"}}, 
          {"field": {"Name": "end_time_c"}}, 
          {"field": {"Name": "status_c"}}, 
          {"field": {"Name": "notes_c"}}, 
          {"field": {"Name": "service_id_c"}},
          {"field": {"Name": "slug_c"}},
          {"field": {"Name": "booking_page_slug_c"}}
        ],
        orderBy: [{"fieldName": "start_time_c", "sorttype": "DESC"}]
      });
      
      if (!response.success) {
        console.error("Failed to fetch bookings:", response);
        throw new Error(response.message);
      }
      
// Return bookings with UTC times - components will convert to local for display
      const bookings = (response.data || []).map(booking => ({
        ...booking,
        start_time_c: booking.start_time_c,
        end_time_c: booking.end_time_c
      }));
      return bookings;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },

  async getUserBookings() {
    try {
      const apperClient = getApperClientInstance();
      const { bookingConfigurationService } = await import('./bookingConfigurationService');
      
      // Get user's booking configuration to find their slug
      const userConfig = await bookingConfigurationService.getUserConfig();
      
      if (!userConfig || !userConfig.slug_c) {
        console.log("No booking configuration found for user, returning empty results");
        return [];
      }
      
      // Fetch bookings matching the user's booking page slug
      const response = await apperClient.fetchRecords('booking_c', {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "client_name_c"}}, 
          {"field": {"Name": "client_email_c"}}, 
          {"field": {"Name": "client_phone_c"}}, 
          {"field": {"Name": "start_time_c"}}, 
          {"field": {"Name": "end_time_c"}}, 
          {"field": {"Name": "status_c"}}, 
          {"field": {"Name": "notes_c"}}, 
          {"field": {"Name": "service_id_c"}},
          {"field": {"Name": "slug_c"}},
          {"field": {"Name": "booking_page_slug_c"}}
        ],
        where: [
          {
            "FieldName": "booking_page_slug_c",
            "Operator": "EqualTo",
            "Values": [userConfig.slug_c],
            "Include": true
          }
        ],
        orderBy: [{"fieldName": "start_time_c", "sorttype": "DESC"}]
      });
      
      if (!response.success) {
        console.error("Failed to fetch user bookings:", response);
        throw new Error(response.message);
      }
      
      // Convert UTC dates to local time for display
const bookings = (response.data || []).map(booking => ({
        ...booking,
        start_time_c: booking.start_time_c,
        end_time_c: booking.end_time_c
      }));
      
      return bookings;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.getRecordById('booking_c', id, {
fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "client_name_c"}}, 
          {"field": {"Name": "client_email_c"}}, 
          {"field": {"Name": "client_phone_c"}}, 
          {"field": {"Name": "start_time_c"}}, 
          {"field": {"Name": "end_time_c"}}, 
          {"field": {"Name": "status_c"}}, 
          {"field": {"Name": "notes_c"}}, 
          {"field": {"Name": "service_id_c"}},
{"field": {"Name": "slug_c"}},
          {"field": {"Name": "booking_page_slug_c"}}
        ]
      });
      
      if (!response.success) {
        console.error(`Failed to fetch booking with Id: ${id}:`, response);
        throw new Error(response.message);
      }
      
      if (!response?.data) {
        return null;
      }
      
      // Convert UTC dates to local time for display
const booking = response.data;
      return {
        ...booking,
        start_time_c: booking.start_time_c,
        end_time_c: booking.end_time_c
      };
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

async create(bookingData) {
    try {
      const apperClient = getApperClientInstance();
      const slug = generateSlug();
      
      const params = {
        records: [{
          Name: bookingData.clientName,
          client_name_c: bookingData.clientName,
          client_email_c: bookingData.clientEmail,
          client_phone_c: bookingData.clientPhone,
          start_time_c: dayjs(bookingData.startTime).utc().toISOString(),
          end_time_c: dayjs(bookingData.endTime).utc().toISOString(),
          status_c: bookingData.status,
          notes_c: bookingData.notes,
          service_id_c: parseInt(bookingData.serviceId),
          slug_c: slug,
          booking_page_slug_c: bookingData.bookingPageSlug
        }]
      };
      const response = await apperClient.createRecord('booking_c', params);
      
      if (!response.success) {
        console.error("Failed to create booking:", response);
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
      console.error("Error creating booking:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, bookingData) {
    try {
      const apperClient = getApperClientInstance();
      
      const updateData = {
Id: id
      };
      
      if (bookingData.clientName !== undefined) updateData.client_name_c = bookingData.clientName;
      if (bookingData.clientEmail !== undefined) updateData.client_email_c = bookingData.clientEmail;
      if (bookingData.clientPhone !== undefined) updateData.client_phone_c = bookingData.clientPhone;
      if (bookingData.startTime !== undefined) updateData.start_time_c = dayjs(bookingData.startTime).utc().toISOString();
      if (bookingData.endTime !== undefined) updateData.end_time_c = dayjs(bookingData.endTime).utc().toISOString();
      if (bookingData.status !== undefined) updateData.status_c = bookingData.status;
      if (bookingData.notes !== undefined) updateData.notes_c = bookingData.notes;
      if (bookingData.serviceId !== undefined) updateData.service_id_c = parseInt(bookingData.serviceId);
if (bookingData.name !== undefined) updateData.Name = bookingData.name;
      if (bookingData.slug !== undefined) updateData.slug_c = bookingData.slug;
      if (bookingData.bookingPageSlug !== undefined) updateData.booking_page_slug_c = bookingData.bookingPageSlug;
      const params = {
        records: [updateData]
      };
      
      const response = await apperClient.updateRecord('booking_c', params);
      
      if (!response.success) {
        console.error("Failed to update booking:", response);
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
      console.error("Error updating booking:", error?.response?.data?.message || error);
      throw error;
    }
  },
async getBySlug(slug) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('booking_c', {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "client_name_c"}}, 
          {"field": {"Name": "client_email_c"}}, 
          {"field": {"Name": "client_phone_c"}}, 
          {"field": {"Name": "start_time_c"}}, 
          {"field": {"Name": "end_time_c"}}, 
          {"field": {"Name": "status_c"}}, 
          {"field": {"Name": "notes_c"}}, 
          {"field": {"Name": "service_id_c"}},
{"field": {"Name": "slug_c"}},
          {"field": {"Name": "booking_page_slug_c"}}
        ],
        where: [
          {
            FieldName: "slug_c",
            Operator: "EqualTo",
            Values: [slug],
            Include: true
          }
        ]
      });
      
      if (!response.success) {
        console.error("Failed to fetch booking by slug:", response);
        throw new Error(response.message);
      }
      
      if (!response.data || response.data.length === 0) {
        return null;
      }
      
      // Convert UTC dates to local time for display
      const booking = response.data[0];
return {
        ...booking,
        start_time_c: dayjs(booking.start_time_c).format('YYYY-MM-DDTHH:mm'),
        end_time_c: dayjs(booking.end_time_c).format('YYYY-MM-DDTHH:mm')
      };
    } catch (error) {
      console.error("Error fetching booking by slug:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClientInstance();
      
      const params = { 
        RecordIds: [id]
      };
      
      const response = await apperClient.deleteRecord('booking_c', params);
      
      if (!response.success) {
        console.error("Failed to delete booking:", response);
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
      console.error("Error deleting booking:", error?.response?.data?.message || error);
      throw error;
    }
  }
};
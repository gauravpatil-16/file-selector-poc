import { getApperClient } from '@/services/apperClient';

const getApperClientInstance = () => {
  const client = getApperClient();
  if (!client) {
    throw new Error('ApperClient not available');
  }
  return client;
};

export const availabilityService = {
  async getAll() {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('availability_c', {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "day_of_week_c"}}, 
          {"field": {"Name": "start_time_c"}}, 
          {"field": {"Name": "end_time_c"}}, 
          {"field": {"Name": "is_active_c"}}
        ],
        orderBy: [{"fieldName": "day_of_week_c", "sorttype": "ASC"}]
      });
      
      if (!response.success) {
        console.error("Failed to fetch availability:", response);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching availability:", error);
      throw error;
    }
  },

  async getByService(serviceId) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('availability_c', {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "day_of_week_c"}}, 
          {"field": {"Name": "start_time_c"}}, 
          {"field": {"Name": "end_time_c"}}, 
          {"field": {"Name": "is_active_c"}}
        ],
        where: [{
          "FieldName": "Name",
          "Operator": "Contains",
          "Values": [`Service ${serviceId}`]
        }],
        orderBy: [{"fieldName": "day_of_week_c", "sorttype": "ASC"}]
      });
      
      if (!response.success) {
        console.error("Failed to fetch service availability:", response);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching service availability:", error);
      throw error;
    }
  },

  async getByServiceAndDay(serviceId, dayOfWeek) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('availability_c', {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "day_of_week_c"}}, 
          {"field": {"Name": "start_time_c"}}, 
          {"field": {"Name": "end_time_c"}}, 
          {"field": {"Name": "is_active_c"}}
        ],
        where: [
          {
            "FieldName": "Name",
            "Operator": "Contains", 
            "Values": [`Service ${serviceId}`]
          },
          {
            "FieldName": "day_of_week_c",
            "Operator": "EqualTo",
            "Values": [dayOfWeek]
          }
        ]
      });
      
      if (!response.success) {
        console.error("Failed to fetch service availability for day:", response);
        throw new Error(response.message);
      }
      
      const dayAvailability = response.data?.[0];
      if (!dayAvailability) {
        return {
          day_of_week_c: dayOfWeek,
          start_time_c: "09:00",
          end_time_c: "17:00",
          is_active_c: false
        };
      }
      
      return dayAvailability;
    } catch (error) {
      console.error("Error fetching service availability by day:", error);
      throw error;
    }
  },

  async getByDay(dayOfWeek) {
    try {
      const apperClient = getApperClientInstance();
      
      const response = await apperClient.fetchRecords('availability_c', {
        fields: [
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "day_of_week_c"}}, 
          {"field": {"Name": "start_time_c"}}, 
          {"field": {"Name": "end_time_c"}}, 
          {"field": {"Name": "is_active_c"}}
        ],
        where: [{
          "FieldName": "day_of_week_c",
          "Operator": "EqualTo",
          "Values": [dayOfWeek]
        }]
      });
      
      if (!response.success) {
        console.error("Failed to fetch availability for day:", response);
        throw new Error(response.message);
      }
      
      const dayAvailability = response.data?.[0];
      if (!dayAvailability) {
        return {
          day_of_week_c: dayOfWeek,
          start_time_c: "09:00",
          end_time_c: "17:00",
          is_active_c: false
        };
      }
      
      return dayAvailability;
    } catch (error) {
      console.error("Error fetching availability by day:", error);
      throw error;
    }
  },

async update(dayOfWeek, availabilityData) {
    try {
      const apperClient = getApperClientInstance();
      
      // First check if record exists
      const existing = await this.getByDay(dayOfWeek);
      
      if (existing && existing.Id) {
        // Update existing record
        const params = {
          records: [{
            Id: existing.Id,
            Name: `Day ${dayOfWeek} Availability`,
            day_of_week_c: dayOfWeek,
            start_time_c: availabilityData.startTime || availabilityData.start_time_c,
            end_time_c: availabilityData.endTime || availabilityData.end_time_c,
            is_active_c: availabilityData.isActive !== undefined ? availabilityData.isActive : availabilityData.is_active_c
          }]
        };
        
        const response = await apperClient.updateRecord('availability_c', params);
        
        if (!response.success) {
          console.error("Failed to update availability:", response);
          throw new Error(response.message);
        }
        
        return response.results?.[0]?.data;
      } else {
        // Create new record
        const params = {
          records: [{
            Name: `Day ${dayOfWeek} Availability`,
            day_of_week_c: dayOfWeek,
            start_time_c: availabilityData.startTime || availabilityData.start_time_c,
            end_time_c: availabilityData.endTime || availabilityData.end_time_c,
            is_active_c: availabilityData.isActive !== undefined ? availabilityData.isActive : availabilityData.is_active_c
          }]
        };
        
        const response = await apperClient.createRecord('availability_c', params);
        
        if (!response.success) {
          console.error("Failed to create availability:", response);
          throw new Error(response.message);
        }
        
        return response.results?.[0]?.data;
      }
    } catch (error) {
      console.error("Error updating availability:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async updateServiceAvailability(serviceId, dayOfWeek, availabilityData) {
    try {
      const apperClient = getApperClientInstance();
      
      // First check if service-specific record exists
      const existing = await this.getByServiceAndDay(serviceId, dayOfWeek);
      
      if (existing && existing.Id) {
        // Update existing record
        const params = {
          records: [{
            Id: existing.Id,
            Name: `Service ${serviceId} Day ${dayOfWeek} Availability`,
            day_of_week_c: dayOfWeek,
            start_time_c: availabilityData.startTime || availabilityData.start_time_c,
            end_time_c: availabilityData.endTime || availabilityData.end_time_c,
            is_active_c: availabilityData.isActive !== undefined ? availabilityData.isActive : availabilityData.is_active_c
          }]
        };
        
        const response = await apperClient.updateRecord('availability_c', params);
        
        if (!response.success) {
          console.error("Failed to update service availability:", response);
          throw new Error(response.message);
        }
        
        return response.results?.[0]?.data;
      } else {
        // Create new service-specific record
        const params = {
          records: [{
            Name: `Service ${serviceId} Day ${dayOfWeek} Availability`,
            day_of_week_c: dayOfWeek,
            start_time_c: availabilityData.startTime || availabilityData.start_time_c,
            end_time_c: availabilityData.endTime || availabilityData.end_time_c,
            is_active_c: availabilityData.isActive !== undefined ? availabilityData.isActive : availabilityData.is_active_c
          }]
        };
        
        const response = await apperClient.createRecord('availability_c', params);
        
        if (!response.success) {
          console.error("Failed to create service availability:", response);
          throw new Error(response.message);
        }
        
        return response.results?.[0]?.data;
      }
    } catch (error) {
      console.error("Error updating service availability:", error?.response?.data?.message || error);
      throw error;
    }
  },

async generateSampleAvailability() {
    // Generate Monday-Friday business hours
    const businessDays = [1, 2, 3, 4, 5]; // Monday to Friday
    
    for (const dayOfWeek of businessDays) {
      const availability = {
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00", 
        isActive: true
      };
      
      await this.update(dayOfWeek, availability);
    }

    return businessDays.length;
  },

  async generateServiceAvailability(serviceId, schedule) {
    // Generate service-specific availability based on provided schedule
    for (const availabilityItem of schedule) {
      const availability = {
        startTime: availabilityItem.startTime,
        endTime: availabilityItem.endTime,
        isActive: availabilityItem.isActive
      };
      
      await this.updateServiceAvailability(serviceId, availabilityItem.dayOfWeek, availability);
    }

return schedule.length;
  },

  async getAvailableTimeslots(serviceId, date) {
    try {
      const dayOfWeek = new Date(date).getDay();
      const availability = await this.getByServiceAndDay(serviceId, dayOfWeek);
      
      if (!availability.is_active_c) {
        return [];
      }
      
      const slots = [];
      const startTime = availability.start_time_c;
      const endTime = availability.end_time_c;
      
      // Get service duration (default to 60 minutes if not found)
      let serviceDuration = 60;
      try {
        const { serviceService } = await import('./serviceService');
        const service = await serviceService.getById(serviceId);
        serviceDuration = service?.duration_c || 60;
      } catch (error) {
        console.error("Error getting service duration:", error);
      }
      
      // Generate time slots
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += serviceDuration) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeString,
          available: true,
          serviceId,
          date,
          duration: serviceDuration
        });
      }
      
      return slots;
    } catch (error) {
      console.error("Error getting available timeslots:", error);
      return [];
    }
  },

  async getWeeklyTimeslots(serviceId, startDate) {
    try {
      const slots = {};
      const weekDays = [];
      
      // Generate 7 days starting from startDate
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        weekDays.push(dateString);
      }
      
      // Get timeslots for each day
      for (const dateString of weekDays) {
        slots[dateString] = await this.getAvailableTimeslots(serviceId, dateString);
      }
      
      return slots;
    } catch (error) {
      console.error("Error getting weekly timeslots:", error);
      return {};
    }
  }
};
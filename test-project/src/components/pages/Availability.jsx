import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import AvailabilityRow from "@/components/molecules/AvailabilityRow";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ApperIcon from "@/components/ApperIcon";
import { availabilityService } from "@/services/api/availabilityService";
import { serviceService } from "@/services/api/serviceService";

const Availability = () => {
  const [availability, setAvailability] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
const loadServices = async () => {
    try {
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
      
      // Set first service as default if none selected
      if (servicesData.length > 0 && !selectedService) {
        setSelectedService(servicesData[0]);
      }
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError("");
      
      let data = [];
      if (selectedService) {
        data = await availabilityService.getByService(selectedService.Id);
      } else {
        data = await availabilityService.getAll();
      }
      
      // Ensure we have availability for all 7 days
      const fullWeekAvailability = [];
      for (let day = 0; day < 7; day++) {
        const existing = data.find(a => a.day_of_week_c === day);
        fullWeekAvailability.push(existing || {
          day_of_week_c: day,
          start_time_c: "09:00",
          end_time_c: "17:00",
          is_active_c: day >= 1 && day <= 5 // Monday to Friday by default
        });
      }
      
      setAvailability(fullWeekAvailability);
    } catch (err) {
      console.error("Error loading availability:", err);
      setError("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadAvailability();
    }
  }, [selectedService]);

const handleToggleDay = (dayOfWeek) => {
    setAvailability(prev => prev.map(a => 
      a.day_of_week_c === dayOfWeek 
        ? { ...a, is_active_c: !a.is_active_c }
        : a
    ));
  };

  const handleTimeChange = (dayOfWeek, field, value) => {
    const fieldMap = {
      'startTime': 'start_time_c',
      'endTime': 'end_time_c'
    };
    const mappedField = fieldMap[field] || field;
    
    setAvailability(prev => prev.map(a => 
      a.day_of_week_c === dayOfWeek 
        ? { ...a, [mappedField]: value }
        : a
    ));
  };

const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save each day's availability for the selected service
      for (const dayAvailability of availability) {
        if (selectedService) {
          await availabilityService.updateServiceAvailability(
            selectedService.Id,
            dayAvailability.day_of_week_c, 
            dayAvailability
          );
        } else {
          await availabilityService.update(dayAvailability.day_of_week_c, dayAvailability);
        }
      }
      
      toast.success(`Availability saved successfully${selectedService ? ` for ${selectedService.Name}` : ''}!`);
    } catch (err) {
      console.error("Error saving availability:", err);
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

const handleSetBusinessHours = () => {
    const businessHours = availability.map(a => ({
      ...a,
      is_active_c: a.day_of_week_c >= 1 && a.day_of_week_c <= 5, // Monday to Friday
      start_time_c: "09:00",
      end_time_c: "17:00"
    }));
    setAvailability(businessHours);
    toast.success("Set to standard business hours (Mon-Fri, 9 AM - 5 PM)");
  };

  const handleSet247 = () => {
    const fullTime = availability.map(a => ({
      ...a,
      is_active_c: true,
      start_time_c: "00:00",
      end_time_c: "23:59"
    }));
    setAvailability(fullTime);
    toast.success("Set to 24/7 availability");
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView onRetry={loadAvailability} />;

return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
          Service Availability
        </h1>
        <p className="text-secondary">
          Set working hours for each service across different days of the week
        </p>
      </div>

{/* Service Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Service to Configure
        </label>
        <Select
          value={selectedService?.Id || ''}
          onChange={(e) => {
            const service = services.find(s => s.Id === parseInt(e.target.value));
            setSelectedService(service);
          }}
          className="max-w-md"
        >
          <option value="">Select a service...</option>
          {services.map((service) => (
            <option key={service.Id} value={service.Id}>
              {service.Name} ({service.duration_c} min, ${service.price_c})
            </option>
          ))}
        </Select>
      </div>

      {/* Service-Based Availability Display */}
      {!selectedService && services.length > 0 && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Time by Service:</h3>
          <div className="space-y-2">
            {services.map((service, index) => {
              const serviceAvailability = availability.filter(a => a.is_active_c);
              const timeRanges = serviceAvailability.map(a => `${a.start_time_c} to ${a.end_time_c}`);
              const uniqueRanges = [...new Set(timeRanges)];
              
              return (
                <div key={service.Id} className="text-sm text-gray-700">
                  <strong>{index + 1}. {service.Name}:</strong> {uniqueRanges.join(', ') || 'No availability set'}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!selectedService && (
        <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <ApperIcon name="Info" className="w-5 h-5 text-primary mr-2" />
            <p className="text-sm text-primary font-medium">
              Please select a service to configure its availability schedule.
            </p>
          </div>
        </div>
      )}

      {selectedService && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <ApperIcon name="Settings" className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-gray-900">Configuring: {selectedService.Name}</h3>
              <p className="text-sm text-gray-600">
                Duration: {selectedService.duration_c} minutes • Price: ${selectedService.price_c}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          variant="outline"
          icon="Briefcase"
          onClick={handleSetBusinessHours}
        >
          Business Hours
        </Button>
        
        <Button
          variant="outline"
          icon="Clock"
          onClick={handleSet247}
        >
          24/7 Available
        </Button>
        
        <div className="ml-auto">
          <Button
            icon="Save"
            onClick={handleSave}
            loading={saving}
          >
            Save Changes
          </Button>
        </div>
      </div>

{/* Availability Settings */}
      {selectedService && (
        <div className="space-y-4">
          {availability.map((dayAvailability) => (
            <AvailabilityRow
              key={dayAvailability.day_of_week_c}
              day={dayAvailability.day_of_week_c}
              availability={dayAvailability}
              onToggle={handleToggleDay}
              onTimeChange={handleTimeChange}
              serviceName={selectedService.Name}
            />
          ))}
        </div>
      )}

{/* Helper Text */}
      {selectedService && (
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <ApperIcon name="Info" className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">Service-Specific Availability Tips:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Each service can have its own unique availability schedule</li>
                <li>Set different hours for each day based on service requirements</li>
                <li>Time slots will be generated based on the {selectedService.duration_c}-minute service duration</li>
                <li>Changes apply only to the selected service: {selectedService.Name}</li>
                <li>Remember to save your changes after making adjustments</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;
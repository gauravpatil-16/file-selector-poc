import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import Modal from "@/components/atoms/Modal";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import { serviceService } from "@/services/api/serviceService";
import { bookingService } from "@/services/api/bookingService";
import ApperIcon from "@/components/ApperIcon";

const BookingForm = ({ isOpen, onClose, selectedTime = null, selectedService = null, slug = null }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
const [formData, setFormData] = useState({
    serviceId: selectedService?.Id?.toString() || "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: ""
  });

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");
const data = await serviceService.getAll();
      const activeServices = data.filter(service => service.is_active_c);
      setServices(activeServices);
    } catch (err) {
      console.error("Error loading services:", err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
if (isOpen) {
      loadServices();
      // Update form data when selected service changes
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          serviceId: selectedService.Id?.toString() || ""
        }));
      }
    }
  }, [isOpen, selectedService]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }
    
    if (!formData.serviceId) {
      toast.error("Please select a service");
      return;
    }
    
    const selectedService = services.find(s => s.Id === parseInt(formData.serviceId));
    if (!selectedService) {
      toast.error("Invalid service selected");
      return;
    }

    try {
      setSubmitting(true);
      
const startTime = new Date(selectedTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + selectedService.duration_c);
      
      const bookingData = {
        serviceId: formData.serviceId,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        startTime: dayjs(startTime).utc().toISOString(),
        endTime: dayjs(endTime).utc().toISOString(),
        status: "Confirmed",
        notes: formData.notes,
        slug: slug // Include booking page slug
      };
      
      const newBooking = await bookingService.create(bookingData);
      
      toast.success("Booking confirmed successfully!");
      onClose();
      navigate(`/booking-confirmation/${newBooking.Id}`);
    } catch (err) {
      console.error("Error creating booking:", err);
      toast.error("Failed to create booking");
    } finally {
      setSubmitting(false);
    }
};

  const currentSelectedService = services.find(s => s.Id === parseInt(formData.serviceId));

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Book Service">
        <Loading />
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Book Service">
        <ErrorView onRetry={loadServices} />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Service" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selected Time Display */}
        {selectedTime && (
          <Card variant="gradient" className="p-4">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-1">Selected Time</h3>
<p className="text-lg font-bold text-primary">
                {dayjs(selectedTime).format("dddd, MMMM D, YYYY [at] h:mm A")}
              </p>
            </div>
          </Card>
        )}

        {/* Service Selection */}
        <Select
          label="Select Service"
          required
          value={formData.serviceId}
          onChange={(e) => handleInputChange("serviceId", e.target.value)}
          disabled={!!selectedService} // Disable if service is pre-selected
        >
          <option value="">Choose a service...</option>
          {services.map((service) => (
            <option key={service.Id} value={service.Id}>
              {service.Name} - {service.duration_c} min - ${service.price_c}
            </option>
          ))}
        </Select>
        
        {/* Service Info Display */}
        {currentSelectedService && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Selected Service</p>
                <p className="text-sm text-gray-600">
                  {currentSelectedService.Name} - {currentSelectedService.duration_c} min - ${currentSelectedService.price_c}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Selected Time Display */}
        {selectedTime && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <ApperIcon name="Clock" className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-900">Selected Time</p>
                <p className="text-sm text-gray-600">
{dayjs(selectedTime).format("dddd, MMMM D [at] h:mm A")}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Client Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Your Information</h4>
          <Input
            label="Full Name"
            required
            value={formData.clientName}
            onChange={(e) => handleInputChange("clientName", e.target.value)}
            placeholder="Enter your full name"
          />
          
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.clientEmail}
            onChange={(e) => handleInputChange("clientEmail", e.target.value)}
            placeholder="Enter your email address"
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => handleInputChange("clientPhone", e.target.value)}
            placeholder="Enter your phone number (optional)"
          />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-primary focus:ring-primary/20 hover:border-gray-400 placeholder:text-gray-400"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any special requests or notes..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="success"
            loading={submitting}
            disabled={!selectedTime || !formData.serviceId || !formData.clientName || !formData.clientEmail}
            className="flex-1"
          >
            Confirm Booking
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingForm;
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Modal from "@/components/atoms/Modal";
import { serviceService } from "@/services/api/serviceService";
import { bookingConfigurationService } from "@/services/api/bookingConfigurationService";

const ServiceForm = ({ isOpen, onClose, service = null, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [bookingConfig, setBookingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: "",
    description: "",
    isActive: true
  });

useEffect(() => {
    const loadBookingConfig = async () => {
      try {
        const config = await bookingConfigurationService.getUserConfig();
        setBookingConfig(config);
      } catch (error) {
        console.error("Error loading booking configuration:", error);
      }
    };

    if (isOpen) {
      loadBookingConfig();
    }

    if (service) {
      setFormData({
        name: service.Name,
        duration: service.duration_c.toString(),
        price: service.price_c.toString(),
        description: service.description_c,
        isActive: service.is_active_c
      });
    } else {
      setFormData({
        name: "",
        duration: "",
        price: "",
        description: "",
        isActive: true
      });
    }
  }, [service, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
const serviceData = {
        name: formData.name,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        description: formData.description,
        isActive: formData.isActive
      };
      
      if (service) {
        // For updates, include existing slug
        serviceData.slug = service.slug_c;
        await serviceService.update(service.Id, serviceData);
        toast.success("Service updated successfully!");
      } else {
        // For creates, use booking configuration slug if available
        if (bookingConfig?.slug_c) {
          serviceData.bookingConfigSlug = bookingConfig.slug_c;
        }
        await serviceService.create(serviceData);
        toast.success("Service created successfully!");
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={service ? "Edit Service" : "Create New Service"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Service Name"
          required
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g., Hair Cut, Consultation, Massage"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duration (minutes)"
            type="number"
            required
            min="15"
            step="15"
            value={formData.duration}
            onChange={(e) => handleInputChange("duration", e.target.value)}
            placeholder="60"
          />
          
          <Input
            label="Price ($)"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="50.00"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-primary focus:ring-primary/20 hover:border-gray-400 placeholder:text-gray-400"
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe what this service includes..."
          />
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange("isActive", e.target.checked)}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Service is active and available for booking
          </label>
        </div>
        
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
            loading={submitting}
            disabled={!formData.name || !formData.duration || !formData.price}
            className="flex-1"
          >
            {service ? "Update Service" : "Create Service"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ServiceForm;
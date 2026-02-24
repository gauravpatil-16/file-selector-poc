import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import ServiceCard from "@/components/molecules/ServiceCard";
import ServiceForm from "@/components/organisms/ServiceForm";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import TimeSlotList from "@/components/molecules/TimeSlotList";
import ApperIcon from "@/components/ApperIcon";
import { serviceService } from "@/services/api/serviceService";
import { availabilityService } from "@/services/api/availabilityService";
import { dataInitializer } from "@/services/api/dataInitializer";

const Services = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [timeslots, setTimeslots] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await serviceService.getAll();
      setServices(data);
    } catch (err) {
      console.error("Error loading services:", err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
}, []);

  const handleCreateService = () => {
    setEditingService(null);
    setShowForm(true);
  };
  const handleGenerateSample = async () => {
    try {
      setLoading(true);
      await dataInitializer.initializeIfNeeded();
      await loadServices();
      toast.success("Sample services generated successfully!");
    } catch (err) {
      console.error("Error generating sample data:", err);
      toast.error("Failed to generate sample services");
    } finally {
      setLoading(false);
    }
  };

const handleEditService = (service) => {
    setEditingService(service);
    setShowForm(true);
  };
  const handleToggleStatus = async (service) => {
    try {
      const updatedService = {
        duration: service.duration_c,
        price: service.price_c,
        description: service.description_c,
        isActive: !service.is_active_c 
      };
      await serviceService.update(service.Id, updatedService);
      
      setServices(prev => prev.map(s => 
        s.Id === service.Id ? { ...s, is_active_c: updatedService.isActive } : s
      ));
      
      toast.success(`Service ${updatedService.isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error("Error updating service:", err);
      toast.error("Failed to update service");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingService(null);
  };

const handleFormSuccess = () => {
    setShowForm(false);
    setEditingService(null);
    loadServices();
  };

  const handleServiceSelect = async (service) => {
    setSelectedService(service);
    try {
      const slots = await availabilityService.getWeeklyTimeslots(service.Id, selectedDate);
      setTimeslots(slots);
    } catch (err) {
      console.error("Error loading timeslots:", err);
      setTimeslots({});
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    if (selectedService) {
      try {
        const slots = await availabilityService.getWeeklyTimeslots(selectedService.Id, date);
        setTimeslots(slots);
      } catch (err) {
        console.error("Error loading timeslots:", err);
        setTimeslots({});
      }
    }
  };

return (
<div className="container mx-auto px-4 py-8">
      {/* Business Branding Section */}
      {isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Settings" className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
              <p className="text-gray-600">Create and manage your services, set pricing and availability</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
            {isAuthenticated ? 'Service Management' : 'Available Services'}
          </h1>
          <p className="text-secondary">
            {isAuthenticated ? 'Create and manage your available services' : 'Browse available services and book appointments'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated && services.length === 0 && (
            <Button
              variant="outline"
              icon="Wand2"
              onClick={handleGenerateSample}
              loading={loading}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300"
            >
              Generate Sample Services & Availability
            </Button>
          )}
          
          {isAuthenticated && (
            <Button
              icon="Plus"
              onClick={handleCreateService}
            >
              Create Service
            </Button>
          )}
        </div>
      </div>

      {loading && <Loading />}
      
      {error && <ErrorView message={error} onRetry={loadServices} />}

      {!loading && !error && services.length === 0 ? (
        <Empty 
          variant="services"
onAction={handleCreateService}
        />
      ) : !loading && !error ? (
        <div className="space-y-8">
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.Id}
                service={service}
                onEdit={isAuthenticated ? handleEditService : undefined}
                onToggleStatus={isAuthenticated ? handleToggleStatus : undefined}
                onSelect={handleServiceSelect}
                isSelected={selectedService?.Id === service.Id}
                showActions={isAuthenticated}
              />
            ))}
          </div>

          {/* Selected Service Timeslots */}
          {selectedService && (
            <div className="mt-12">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <ApperIcon name="Clock" className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Available Times for {selectedService.Name}</h3>
                    <p className="text-sm text-gray-600">
                      Duration: {selectedService.duration_c} minutes • Price: ${selectedService.price_c}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium text-gray-700">Week Starting:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

<TimeSlotList
                timeslots={timeslots}
                service={selectedService}
                onBookSlot={(slot) => {
                  navigate("/book");
                }}
              />
            </div>
          )}
        </div>
) : null}

      {isAuthenticated && (
        <ServiceForm
          isOpen={showForm}
          onClose={handleFormClose}
          service={editingService}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default Services;
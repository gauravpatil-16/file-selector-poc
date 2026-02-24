import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import Modal from "@/components/atoms/Modal";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import ServiceCard from "@/components/molecules/ServiceCard";
import { bookingConfigurationService } from "@/services/api/bookingConfigurationService";
import { serviceService } from "@/services/api/serviceService";
import { dataInitializer } from "@/services/api/dataInitializer";
import Services from "@/components/pages/Services";
import Select from "@/components/atoms/Select";

const BookingConfiguration = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.user);
  
const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    businessLogo: '',
    slug: ''
  });

const isPublicView = !!slug;
  const isOwner = !isPublicView && isAuthenticated;
  const canBook = isPublicView; // Public users can book services
  // Load configuration based on slug or user
const loadData = async () => {
   try {
     setLoading(true);
     setError('');
     
     // Initialize sample data if needed
     await dataInitializer.initializeIfNeeded();

     if (isPublicView) {
       // Public view - load by slug
       const configData = await bookingConfigurationService.getBySlug(slug);
       if (configData) {
         setConfig(configData);
         setFormData({
           name: configData.Name || '',
           userName: configData.user_name_c || '',
           businessLogo: configData.business_logo_c || '',
           slug: configData.slug_c || ''
         });
         
         // Parse services if stored as JSON string
         try {
           const serviceIds = configData.services_c ? JSON.parse(configData.services_c) : [];
           if (serviceIds.length > 0) {
             const servicesData = await serviceService.getAll();
             const filteredServices = servicesData.filter(service => 
               serviceIds.includes(service.Id) && service.is_active_c
             );
             setServices(filteredServices);
           }
         } catch (parseError) {
           console.error('Error parsing services:', parseError);
           setError('Failed to parse service configuration');
         }
       } else {
         setError('Booking configuration not found for this URL');
       }
     } else if (isAuthenticated) {
       // Authenticated view - load or auto-create user's config
       try {
         const [userConfig, allServices] = await Promise.all([
           bookingConfigurationService.getUserConfig(),
           serviceService.getAll()
         ]);

         // CRITICAL: getUserConfig auto-creates if none exists
         // Ensure we properly track this as an existing config for updates
         if (userConfig && userConfig.Id) {
           console.log('Setting existing config for updates:', userConfig.Id);
           setConfig(userConfig);
           setFormData({
             name: userConfig.Name || '',
             userName: userConfig.user_name_c || user?.name || '',
             businessLogo: userConfig.business_logo_c || '',
             slug: userConfig.slug_c || ''
           });

           try {
             const serviceIds = userConfig.services_c ? JSON.parse(userConfig.services_c) : [];
             setSelectedServices(serviceIds);
             
             // Set user's configured services for display
             if (serviceIds.length > 0) {
               const userServices = allServices.filter(service => 
                 serviceIds.includes(service.Id) && service.is_active_c
               );
               setServices(userServices);
             } else {
               // No services selected yet - show empty state
               setServices([]);
             }
           } catch (parseError) {
             console.error('Error parsing services:', parseError);
             setSelectedServices([]);
             setServices([]);
           }
         } else {
           setError('Failed to load or create booking configuration');
         }
         
       } catch (configError) {
         console.error('Error loading/creating configuration:', configError);
         setError(`Configuration error: ${configError.message || 'Unknown error'}`);
       }
     } else {
       setError('Authentication required to access this page');
     }
   } catch (err) {
     console.error('Error loading configuration:', err);
     setError(`Failed to load configuration: ${err.message || 'Unknown error'}`);
   } finally {
     setLoading(false);
   }
 };

  // Handle booking creation for public users
  const handleBookService = (service) => {
    if (isPublicView) {
      navigate(`/book/${slug}?service=${service.Id}`);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, isAuthenticated, user?.userId]);

const handleSave = async () => {
   if (!isAuthenticated || isPublicView) return;

   try {
     setSaving(true);
     
     const configData = {
       name: formData.name,
       userName: formData.userName,
       businessLogo: formData.businessLogo,
       services: JSON.stringify(selectedServices),
       slug: formData.slug
     };

     let savedConfig;
     // CRITICAL: Check for existing config with ID (including auto-created ones)
     if (config && config.Id) {
       console.log('Updating existing configuration with ID:', config.Id);
       savedConfig = await bookingConfigurationService.update(config.Id, configData);
       toast.success('Configuration updated successfully!');
     } else {
       console.log('Creating new configuration');
       savedConfig = await bookingConfigurationService.create(configData);
       toast.success('Configuration created successfully!');
     }

     // Update state with the saved configuration
     if (savedConfig) {
       setConfig(savedConfig);
       setFormData({
         name: savedConfig.Name || '',
         userName: savedConfig.user_name_c || '',
         businessLogo: savedConfig.business_logo_c || '',
         slug: savedConfig.slug_c || ''
       });
     }
     
     setIsEditing(false);
     
     // Reload services based on selection
     if (selectedServices.length > 0) {
       const allServices = await serviceService.getAll();
       const userServices = allServices.filter(service => 
         selectedServices.includes(service.Id)
       );
       setServices(userServices);
     }
     
   } catch (err) {
     console.error('Error saving configuration:', err);
     toast.error('Failed to save configuration');
   } finally {
     setSaving(false);
   }
 };

// Manual configuration creation removed - configurations are auto-created when needed

// Manual configuration creation removed - configurations are auto-created when needed

  const handleServiceSelection = async () => {
    try {
      const allServices = await serviceService.getAll();
      const activeServices = allServices.filter(service => service.is_active_c);
      setServices(activeServices);
      setShowServiceModal(true);
    } catch (err) {
      console.error('Error loading services:', err);
      toast.error('Failed to load services');
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/book/${formData.slug}`;
  };

  const copyShareUrl = async () => {
    const shareUrl = getShareUrl();
    const shareData = {
      title: `Book with ${formData.userName || formData.name}`,
      text: `Book a service with ${formData.userName || formData.name}`,
      url: shareUrl
    };

    try {
      // Try native share API first (mobile devices)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
        return;
      }
    } catch (error) {
      // If share is cancelled or fails, fall back to clipboard
      console.log('Native share cancelled or failed, falling back to clipboard');
    }

    // Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (clipboardError) {
      // Final fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
            {isPublicView ? 'Book a Service' : 'Booking Configuration'}
          </h1>
          <p className="text-secondary">
            {isPublicView 
              ? 'Choose from available services and book your appointment'
              : 'Manage your booking page and shareable configuration'
            }
          </p>
          {isPublicView && (
            <p className="text-sm text-gray-500 mt-2">
              This booking page is publicly accessible
            </p>
          )}
        </div>

{isOwner && !isPublicView && (
          <div className="flex gap-3">
            {/* Manual configuration creation removed - configurations are auto-created when needed */}
            {config && (
              <Button
                variant="outline"
                icon="Share"
                onClick={copyShareUrl}
                className="transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
              >
                Share This Page
              </Button>
            )}
            <Button
              icon={isEditing ? "Check" : "Edit"}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              loading={saving}
              disabled={saving}
            >
              {isEditing ? 'Save Changes' : 'Edit Configuration'}
            </Button>
          </div>
        )}
      </div>

{/* Configuration Card */}
      <Card className="mb-8 p-6">
        {/* Business Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center">
            {formData.businessLogo ? (
              <img 
                src={formData.businessLogo} 
                alt="Business Logo" 
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <ApperIcon name="Store" className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            {isOwner && isEditing && !isPublicView ? (
              <div className="space-y-3">
                <Input
                  label="Page Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Booking Page"
                  required
                />
                <Input
                  label="Your Name"
                  value={formData.userName}
                  onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                  placeholder="Your display name"
                  required
                />
                <Input
                  label="Business Logo URL (optional)"
                  value={formData.businessLogo}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessLogo: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
                <Input
                  label="Random Slug (Auto-generated)"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Generated automatically"
                  disabled
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {formData.name || 'Booking Configuration'}
                </h2>
                <p className="text-gray-600">
                  {formData.userName ? `with ${formData.userName}` : 'Professional Services'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Service Selection */}
        {isOwner && !isPublicView && (
          <div className="border-t pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Selected Services</h3>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  icon="Plus"
                  onClick={handleServiceSelection}
                >
                  Select Services
                </Button>
              )}
            </div>
            
            {selectedServices.length === 0 ? (
              <Empty
                title="No services selected"
                message="Select services to display on your booking page"
                icon="Calendar"
              />
            ) : (
              <div className="text-sm text-gray-600">
                {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        )}
      </Card>

{/* Manual configuration creation removed - configurations are auto-created when needed */}
{/* Services Display */}
      {services.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {isPublicView ? 'Available Services' : 'Your Services'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.Id}
                service={service}
                onBook={isPublicView ? () => handleBookService(service) : undefined}
                showActions={!isPublicView}
                onEdit={isOwner ? (service) => {/* Handle edit */} : undefined}
                onToggleStatus={isOwner ? (service) => {/* Handle toggle */} : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Service Selection Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        title="Select Services"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Choose which services to display on your booking page</p>
          
          {services.length === 0 ? (
            <Empty
              title="No services available"
              message="Create some services first to display on your booking page"
              icon="Calendar"
            />
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {services.map((service) => (
                <div
                  key={service.Id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedServices.includes(service.Id)
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleServiceToggle(service.Id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{service.Name}</h4>
                      <p className="text-sm text-gray-600">{service.description_c}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-600">{service.duration_c} minutes</span>
                        <span className="font-semibold text-primary">${service.price_c}</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selectedServices.includes(service.Id)
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {selectedServices.includes(service.Id) && (
                        <ApperIcon name="Check" className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowServiceModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowServiceModal(false)}
            >
              Done ({selectedServices.length} selected)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingConfiguration;
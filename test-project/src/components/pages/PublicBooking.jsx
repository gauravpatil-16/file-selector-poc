import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, startOfDay, isAfter, isPast } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import TimeSlot from "@/components/molecules/TimeSlot";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { serviceService } from "@/services/api/serviceService";
import { availabilityService } from "@/services/api/availabilityService";
import { bookingService } from "@/services/api/bookingService";

const PublicBooking = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState(null);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [step, setStep] = useState(1); // 1: Service, 2: Date & Time, 3: Details
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get business data by slug - this will need to be implemented
      // For now, we'll load all data and filter by active services
      const [servicesData, availabilityData, bookingsData] = await Promise.all([
        serviceService.getAll(),
        availabilityService.getAll(),
        bookingService.getAll()
      ]);
      
      const activeServices = servicesData.filter(service => service.is_active_c);
      setServices(activeServices);
      setAvailability(availabilityData);
      setBookings(bookingsData);
      
      // Set business data (in a real app, this would come from the slug lookup)
      setBusinessData({
        name: "Professional Services",
        description: "Book your appointment with our professional services",
        slug: slug
      });
      
    } catch (err) {
      console.error("Error loading business data:", err);
      setError("Business not found or unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadBusinessData();
    }
  }, [slug]);

const getAvailableTimeSlots = (date) => {
    const dayOfWeek = date.getDay();
    const dayAvailability = availability.find(a => a.day_of_week_c === dayOfWeek && a.is_active_c);
    
    if (!dayAvailability) return [];
    
    const slots = [];
    const [startHour, startMinute] = dayAvailability.start_time_c.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.end_time_c.split(':').map(Number);
    
    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const slotDateTime = new Date(currentTime);
      
      // Check for booking conflicts - include service-specific filtering
const isBooked = bookings.some(booking => {
        if (!booking.start_time_c) return false;
        
        // Check if booking conflicts with this timeslot - convert UTC to local for comparison
        const bookingStart = dayjs(booking.start_time_c).toDate();
        const bookingEnd = dayjs(booking.end_time_c).toDate();
        
        // Check for time overlap
        const slotEnd = new Date(slotDateTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + (selectedService?.duration_c || 30));
        
        return (
          (slotDateTime >= bookingStart && slotDateTime < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotDateTime <= bookingStart && slotEnd >= bookingEnd)
        );
      });
      
      const isSlotPast = isPast(slotDateTime);
      
      // Only include available slots that are not booked and not in the past
      if (!isBooked && !isSlotPast) {
        slots.push(new Date(currentTime));
      }
      
      // Move to next slot based on service duration or 30 minutes minimum
      const slotDuration = selectedService ? Math.max(30, selectedService.duration_c) : 30;
      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }
    
    return slots;
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleNextStep = () => {
    if (step === 2 && selectedTime) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleClientDataChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService || !selectedTime) {
      toast.error("Please select a service and time");
      return;
    }

    try {
      setSubmitting(true);
      
const startTime = new Date(selectedTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + selectedService.duration_c);
      
      const bookingData = {
        serviceId: selectedService.Id.toString(),
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        startTime: dayjs(startTime).utc().toISOString(),
        endTime: dayjs(endTime).utc().toISOString(),
        status: "Confirmed",
        notes: clientData.notes,
        bookingPageSlug: slug // Store booking page slug for tracking
      };
      
      const newBooking = await bookingService.create(bookingData);
      toast.success("Booking confirmed successfully!");
      navigate(`/booking-confirmation/${newBooking.slug_c}`);
    } catch (err) {
      console.error("Error creating booking:", err);
      toast.error("Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const getNextAvailableDates = () => {
    const dates = [];
    let currentDate = startOfDay(new Date());
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(currentDate, i);
      const availableSlots = getAvailableTimeSlots(date);
      
      if (availableSlots.length > 0) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  if (loading) return <Loading />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md mx-auto p-8 text-center">
        <ApperIcon name="AlertCircle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Business Not Found</h1>
        <p className="text-gray-600">{error}</p>
      </Card>
    </div>
  );

  const availableDates = getNextAvailableDates();
  const availableTimeSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Business Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Calendar" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{businessData?.name}</h1>
              <p className="text-gray-600">{businessData?.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    stepNumber <= step
                      ? "bg-gradient-to-r from-primary to-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      stepNumber < step ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Choose a Service</h2>
                
                {services.length === 0 ? (
                  <Empty
                    title="No services available"
                    message="This business doesn't have any active services available for booking."
                    icon="Calendar"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <Card
                        key={service.Id}
                        variant="gradient"
                        className={`p-6 cursor-pointer transition-all duration-200 hover:scale-105 ${
                          selectedService?.Id === service.Id
                            ? "ring-2 ring-primary shadow-lg"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {service.Name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {service.description_c}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">
                            {service.duration_c} minutes
                          </span>
                          <span className="text-lg font-bold text-primary">
                            ${service.price_c}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {step === 2 && selectedService && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    icon="ArrowLeft"
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                  <h2 className="text-xl font-bold text-gray-900">
                    Select Date & Time for {selectedService.Name}
                  </h2>
                </div>

                {/* Date Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Available Dates</h3>
                  
                  {availableDates.length === 0 ? (
                    <Empty
                      title="No available dates"
                      message="There are no available time slots in the next 14 days."
                      icon="Calendar"
                    />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {availableDates.slice(0, 7).map((date) => (
                        <button
                          key={date.toISOString()}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-lg text-center border-2 transition-all duration-200 ${
                            selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                              ? "border-primary bg-primary/10"
                              : "border-gray-200 hover:border-primary hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-xs text-gray-600 mb-1">
                            {format(date, "EEE")}
                          </div>
                          <div className="font-semibold">
                            {format(date, "MMM d")}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                {selectedDate && availableTimeSlots.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      Available Times for {format(selectedDate, "EEEE, MMMM d")}
                    </h3>
                    
<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {availableTimeSlots.map((time) => (
                        <TimeSlot
                          key={time.toISOString()}
                          time={time}
                          isAvailable={true}
                          isOccupied={false}
                          isSelected={selectedTime && selectedTime.getTime() === time.getTime()}
                          onClick={() => handleTimeSelect(time)}
                          className="h-12"
                        />
                      ))}
                    </div>
                    
                    {selectedTime && (
                      <div className="flex justify-end">
                        <Button onClick={handleNextStep}>
                          Continue to Details
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Client Details */}
            {step === 3 && selectedService && selectedTime && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    icon="ArrowLeft"
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                  <h2 className="text-xl font-bold text-gray-900">Your Details</h2>
                </div>

                {/* Booking Summary */}
                <Card variant="gradient" className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Service:</span>
                      <div className="font-semibold">{selectedService.Name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Date & Time:</span>
                      <div className="font-semibold">
                        {format(selectedTime, "EEE, MMM d 'at' h:mm a")}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration & Price:</span>
                      <div className="font-semibold">
                        {selectedService.duration_c} min • ${selectedService.price_c}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Client Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      required
                      value={clientData.name}
                      onChange={(e) => handleClientDataChange("name", e.target.value)}
                      placeholder="Enter your full name"
                    />
                    
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={clientData.email}
                      onChange={(e) => handleClientDataChange("email", e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={clientData.phone}
                    onChange={(e) => handleClientDataChange("phone", e.target.value)}
                    placeholder="Enter your phone number (optional)"
                  />
                  
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Notes
                    </label>
                    <textarea
                      className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-primary focus:ring-primary/20 hover:border-gray-400 placeholder:text-gray-400"
                      rows={3}
                      value={clientData.notes}
                      onChange={(e) => handleClientDataChange("notes", e.target.value)}
                      placeholder="Any special requests or notes..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={submitting}
                      disabled={!clientData.name || !clientData.email}
                      size="lg"
                      icon="Check"
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;
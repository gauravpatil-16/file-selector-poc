import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ApperIcon from "@/components/ApperIcon";
import { bookingService } from "@/services/api/bookingService";
import { serviceService } from "@/services/api/serviceService";

const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
if (!id) {
        setError("Booking slug not found");
        return;
      }

      const bookingData = await bookingService.getBySlug(id);
      setBooking(bookingData);
      
if (bookingData.service_id_c) {
        const serviceId = bookingData.service_id_c?.Id || parseInt(bookingData.service_id_c);
        const serviceData = await serviceService.getById(serviceId);
        setService(serviceData);
      }
    } catch (err) {
      console.error("Error loading booking details:", err);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadBookingDetails();
  }, [id]);

  const handleAddToCalendar = () => {
    if (!booking || !service) return;

const startTime = dayjs(booking.start_time_c);
    const endTime = dayjs(booking.end_time_c);
    
    const calendarEvent = {
      title: `${service.Name} - ${booking.client_name_c}`,
      start: startTime.format('YYYYMMDDTHHmmss') + 'Z',
      end: endTime.format('YYYYMMDDTHHmmss') + 'Z',
      description: `Booking with ${booking.client_name_c}\n\nService: ${service.Name}\nDuration: ${service.duration_c} minutes\nPrice: $${service.price_c}${booking.notes_c ? `\n\nNotes: ${booking.notes_c}` : ''}`,
      location: booking.client_email_c
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${calendarEvent.start}/${calendarEvent.end}&details=${encodeURIComponent(calendarEvent.description)}&location=${encodeURIComponent(calendarEvent.location)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView onRetry={loadBookingDetails} />;
  if (!booking) return <ErrorView title="Booking not found" message="The requested booking could not be found." showRetry={false} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-success to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="Check" className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-secondary">
            Your appointment has been successfully booked
          </p>
        </div>

        {/* Booking Details Card */}
        <Card variant="elevated" className="p-8 mb-6">
          <div className="space-y-6">
            {/* Service Information */}
            <div className="text-center pb-6 border-b border-gray-200">
<h2 className="text-2xl font-bold text-gray-900 mb-2">
                {service?.Name || "Service"}
              </h2>
              <Badge variant="confirmed">Confirmed</Badge>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ApperIcon name="Calendar" className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
<div className="font-semibold text-gray-900">
                      {dayjs(booking.start_time_c).format("dddd, MMMM D, YYYY")}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <ApperIcon name="Clock" className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-gray-600">Time</div>
<div className="font-semibold text-gray-900">
                      {dayjs(booking.start_time_c).format("h:mm A")} - {dayjs(booking.end_time_c).format("h:mm A")}
                    </div>
                  </div>
                </div>
                
{service?.duration_c && (
                  <div className="flex items-center gap-3">
                    <ApperIcon name="Timer" className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-semibold text-gray-900">
                        {service.duration_c} minutes
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ApperIcon name="User" className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-gray-600">Client</div>
<div className="font-semibold text-gray-900">
                      {booking.client_name_c}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <ApperIcon name="Mail" className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
<div className="font-semibold text-gray-900">
                      {booking.client_email_c}
                    </div>
                  </div>
                </div>
                
{booking.client_phone_c && (
                  <div className="flex items-center gap-3">
                    <ApperIcon name="Phone" className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-semibold text-gray-900">
                        {booking.client_phone_c}
                      </div>
                    </div>
                  </div>
                )}
                
{service?.price_c && (
                  <div className="flex items-center gap-3">
                    <ApperIcon name="DollarSign" className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-gray-600">Price</div>
                      <div className="font-bold text-primary text-lg">
                        {formatPrice(service.price_c)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Description */}
{service?.description_c && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Service Details</h3>
                <p className="text-gray-600">{service.description_c}</p>
              </div>
            )}

            {/* Notes */}
{booking.notes_c && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-600">{booking.notes_c}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            icon="Calendar"
            onClick={handleAddToCalendar}
            className="flex-1"
          >
            Add to Calendar
          </Button>
          
          <Button
            variant="default"
            icon="ArrowLeft"
            onClick={() => navigate("/")}
            className="flex-1"
          >
            Back to Calendar
          </Button>
        </div>

        {/* Next Steps */}
        <Card variant="gradient" className="p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ApperIcon name="Info" className="w-5 h-5 text-primary" />
            What's Next?
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <ApperIcon name="Check" className="w-4 h-4 text-success mt-0.5" />
              <span>You will receive a confirmation email shortly</span>
            </li>
            <li className="flex items-start gap-2">
              <ApperIcon name="Check" className="w-4 h-4 text-success mt-0.5" />
              <span>Add this appointment to your calendar using the button above</span>
            </li>
            <li className="flex items-start gap-2">
              <ApperIcon name="Check" className="w-4 h-4 text-success mt-0.5" />
              <span>If you need to reschedule or cancel, please contact us</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmation;
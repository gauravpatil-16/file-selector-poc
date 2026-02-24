import React, { useEffect, useState } from "react";
import { addDays, addMinutes, format, isPast, isSameDay, isToday, startOfDay, startOfWeek } from "date-fns";
import { cn } from "@/utils/cn";
import TimeSlot from "@/components/molecules/TimeSlot";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { bookingService } from "@/services/api/bookingService";
import { availabilityService } from "@/services/api/availabilityService";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Bookings from "@/components/pages/Bookings";

dayjs.extend(utc);
dayjs.extend(timezone);
const CalendarGrid = ({ onTimeSlotClick, selectedDate: initialDate = new Date(), selectedService }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [bookingsData, availabilityData] = await Promise.all([
        bookingService.getAll(),
        availabilityService.getAll()
      ]);
      
// Convert UTC dates to local time for bookings
      const processedBookings = bookingsData.map(booking => ({
        ...booking,
        start_time_c: booking.start_time_c ? dayjs(booking.start_time_c).toISOString() : null,
        end_time_c: booking.end_time_c ? dayjs(booking.end_time_c).toISOString() : null
      }));
      
      setBookings(processedBookings);
      setAvailability(availabilityData);
    } catch (err) {
      console.error("Error loading calendar data:", err);
      setError("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
loadData();
  }, []);

const getAvailableTimeSlots = (date) => {
    if (!selectedService) return [];
const dayOfWeek = date.getDay();
    
    // First, try to find service-specific availability
    const serviceAvailability = availability.find(a => 
      a.day_of_week_c === dayOfWeek && 
      a.is_active_c &&
      a.Name && 
      a.Name.includes(`Service ${selectedService.Id}`)
    );
    
    // Fallback to general availability if no service-specific availability exists
    const dayAvailability = serviceAvailability || availability.find(a => 
      a.day_of_week_c === dayOfWeek && 
      a.is_active_c &&
      (!a.Name || !a.Name.includes('Service'))
    );
    
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
      
      // Check for booking conflicts with service-specific filtering
      const conflictingBooking = bookings.find(booking => {
        if (!booking.start_time_c || !booking.service_id_c) return false;
        
        // Only check bookings for the same service if we have a selected service
        if (selectedService && parseInt(booking.service_id_c) !== selectedService.Id) {
          return false;
        }
        
const bookingStart = dayjs(booking.start_time_c).toDate();
        const bookingEnd = dayjs(booking.end_time_c).toDate();
        
        // Calculate slot end time based on service duration
        const slotEnd = new Date(slotDateTime);
        const slotDuration = selectedService ? Math.max(30, selectedService.duration_c) : 30;
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);
        
        // Check for time overlap
        return (
          (slotDateTime >= bookingStart && slotDateTime < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotDateTime <= bookingStart && slotEnd >= bookingEnd)
        );
      });
      
      const isSlotPast = isPast(slotDateTime);
      const isOccupied = !!conflictingBooking;
      
      // Always include slots for display purposes, but mark occupancy
      if (isSlotPast) {
        // Skip past slots entirely
      } else if (isOccupied) {
        slots.push({
          time: new Date(currentTime),
          isAvailable: false,
          isBooked: true,
          isOccupied: true,
          booking: conflictingBooking
        });
      } else {
        slots.push({
          time: new Date(currentTime),
          isAvailable: true,
          isBooked: false,
          isOccupied: false,
          booking: null
        });
      }
      
      // Move to next slot based on service duration or 30 minutes minimum
      const slotDuration = selectedService ? Math.max(30, selectedService.duration_c) : 30;
      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }
    
    return slots;
  };
const getCurrentWeekDays = () => {
    const startOfCurrentWeek = startOfWeek(selectedDate);
    const allDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
    
    // Filter to show only current date and future dates
    const today = startOfDay(new Date());
    return allDays.filter(day => !isPast(startOfDay(day)) || isSameDay(day, today));
  };

const getFirstBookableDate = () => {
    const weekDays = getCurrentWeekDays();
    
    // Find the first date that has available booking slots
    for (const day of weekDays) {
      const daySlots = getAvailableTimeSlots(day);
      const hasAvailableSlots = daySlots.some(slot => {
        return slot.isAvailable && slot.time > new Date();
      });
      
      if (hasAvailableSlots) {
        return day;
      }
    }
    
    // If no bookable slots found, return the first day as fallback
    return weekDays.length > 0 ? weekDays[0] : new Date();
  };
  if (loading) return <Loading variant="calendar" />;
  if (error) return <ErrorView onRetry={loadData} />;

  const weekDays = getCurrentWeekDays();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          {format(selectedDate, "MMMM yyyy")}
        </h2>
        
        <div className="flex flex-col items-end space-y-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon="ChevronLeft"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              Previous Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="ChevronRight"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              Next Week
            </Button>
          </div>
          
{/* First bookable date info */}
          <div className="text-sm text-gray-600">
            Bookings available from {format(getFirstBookableDate(), "EEEE, MMMM d")}
          </div>
        </div>
      </div>

      {/* Service Selection Reminder */}
      {!selectedService && (
        <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-lg">
          <div className="flex items-center">
            <ApperIcon name="Info" className="w-5 h-5 text-primary mr-2" />
            <p className="text-sm text-primary font-medium">
              Please select a service above to view available time slots.
            </p>
          </div>
        </div>
      )}

{/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Days Header */}
        <div className={cn(
          "grid bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200",
          `grid-cols-${weekDays.length}`
        )}>
          {weekDays.map((date, index) => {
            const isCurrentDay = isToday(date);
            const dayName = format(date, "EEE");
            
            return (
              <div 
                key={index}
                className={cn(
                  "p-4 text-center border-r border-gray-200 last:border-r-0",
                  isCurrentDay && "bg-gradient-to-r from-primary/10 to-blue-600/10"
                )}
              >
                <div className="text-sm font-semibold text-gray-600 mb-1">{dayName}</div>
                <div className={cn(
                  "text-lg font-bold",
                  isCurrentDay ? "text-primary" : "text-gray-900"
                )}>
                  {format(date, "d")}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Time Slots Grid */}
<div className={cn("grid", `grid-cols-${weekDays.length}`)}>
          {weekDays.map((day, dayIndex) => {
            const daySlots = getAvailableTimeSlots(day);
            
            return (
              <div key={dayIndex} className="min-h-[400px] border-r border-gray-200 last:border-r-0">
                {daySlots.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <ApperIcon name="Clock" className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {!selectedService ? "Select service" : "No slots"}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
{daySlots.map((slot, slotIndex) => (
                      <TimeSlot
                        key={slotIndex}
                        time={slot.time}
                        isAvailable={slot.isAvailable}
                        isBooked={slot.isBooked}
                        isOccupied={slot.isOccupied}
                        isPast={isPast(slot.time)}
                        booking={slot.booking}
                        onClick={slot.isAvailable ? onTimeSlotClick : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
</div>
    </div>
  );
};

export default CalendarGrid;
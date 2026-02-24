import React, { useEffect, useState } from "react";
import { format, isAfter, isBefore, isToday } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import BookingCard from "@/components/molecules/BookingCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { bookingService } from "@/services/api/bookingService";
import { serviceService } from "@/services/api/serviceService";

dayjs.extend(utc);
dayjs.extend(timezone);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [bookingsData, servicesData] = await Promise.all([
        bookingService.getUserBookings(),
        serviceService.getAll()
      ]);
      
      setBookings(bookingsData);
      setServices(servicesData);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const handleCancelBooking = async (booking) => {
    try {
      await bookingService.update(booking.Id, { status: "Cancelled" });
      
      setBookings(prev => prev.map(b => 
        b.Id === booking.Id ? { ...b, status_c: "Cancelled" } : b
      ));
      
      toast.success("Booking cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error("Failed to cancel booking");
    }
  };

  const handleRescheduleBooking = (booking) => {
    // For demo purposes, show a toast. In a real app, this would open a reschedule form
    toast.info("Reschedule functionality would open here");
  };

  const getFilteredAndSortedBookings = () => {
    let filtered = [...bookings];
    const now = new Date();

    // Apply filters
    switch (filter) {
      case "upcoming":
        filtered = filtered.filter(b => isAfter(dayjs(b.start_time_c).toDate(), now) && b.status_c === "Confirmed");
        break;
      case "today":
        filtered = filtered.filter(b => isToday(dayjs(b.start_time_c).toDate()));
        break;
      case "past":
        filtered = filtered.filter(b => isBefore(dayjs(b.end_time_c).toDate(), now));
        break;
      case "cancelled":
        filtered = filtered.filter(b => b.status_c === "Cancelled");
        break;
      default:
        // All bookings
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(b.start_time_c) - new Date(a.start_time_c));
        break;
      case "name":
        filtered.sort((a, b) => a.client_name_c.localeCompare(b.client_name_c));
        break;
      case "service":
        filtered.sort((a, b) => {
          const serviceA = services.find(s => s.Id === (a.service_id_c?.Id || parseInt(a.service_id_c)))?.Name || "";
          const serviceB = services.find(s => s.Id === (b.service_id_c?.Id || parseInt(b.service_id_c)))?.Name || "";
          return serviceA.localeCompare(serviceB);
        });
        break;
      default:
        break;
    }

    return filtered;
  };

const getBookingStats = () => {
    const now = new Date();
    const upcoming = bookings.filter(b => isAfter(dayjs(b.start_time_c).toDate(), now) && b.status_c === "Confirmed").length;
    const today = bookings.filter(b => isToday(dayjs(b.start_time_c).toDate()) && b.status_c === "Confirmed").length;
    const cancelled = bookings.filter(b => b.status_c === "Cancelled").length;
    
    return { upcoming, today, cancelled, total: bookings.length };
  };

  if (loading) return <Loading variant="list" />;
  if (error) return <ErrorView onRetry={loadData} />;

  const filteredBookings = getFilteredAndSortedBookings();
  const stats = getBookingStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
          Bookings
        </h1>
        <p className="text-secondary">
          Manage all your appointments and client bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <ApperIcon name="Calendar" className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <ApperIcon name="Clock" className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-gray-600">Upcoming</span>
          </div>
          <div className="text-2xl font-bold text-success">{stats.upcoming}</div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-amber-100 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <ApperIcon name="Sun" className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-gray-600">Today</span>
          </div>
          <div className="text-2xl font-bold text-warning">{stats.today}</div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-rose-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <ApperIcon name="X" className="w-4 h-4 text-error" />
            <span className="text-sm font-medium text-gray-600">Cancelled</span>
          </div>
          <div className="text-2xl font-bold text-error">{stats.cancelled}</div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:w-48"
        >
          <option value="all">All Bookings</option>
          <option value="upcoming">Upcoming</option>
          <option value="today">Today</option>
          <option value="past">Past</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sm:w-48"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="service">Sort by Service</option>
        </Select>
        
        <div className="sm:ml-auto">
          <Button
            variant="outline"
            icon="RefreshCw"
            onClick={loadData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Empty 
          variant="bookings"
          title={filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
          message="Bookings will appear here as they are created."
        />
) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const service = services.find(s => s.Id === (booking.service_id_c?.Id || parseInt(booking.service_id_c)));
            return (
              <BookingCard
                key={booking.Id}
                booking={booking}
                service={service}
                onCancel={handleCancelBooking}
                onReschedule={handleRescheduleBooking}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
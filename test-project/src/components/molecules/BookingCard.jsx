import { formatDistanceToNow } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const BookingCard = ({ 
  booking, 
  service,
  onCancel,
  onReschedule,
  showActions = true,
  className 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

const isUpcoming = dayjs(booking.start_time_c).toDate() > new Date();
  const isPast = dayjs(booking.end_time_c).toDate() < new Date();

  return (
    <Card variant="gradient" className={cn("p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
<h3 className="text-lg font-bold text-gray-900">{service?.Name || "Unknown Service"}</h3>
            <Badge variant={booking.status_c?.toLowerCase()}>
              {booking.status_c}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <ApperIcon name="User" className="w-4 h-4" />
<span className="font-medium text-gray-900">{booking.client_name_c}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <ApperIcon name="Mail" className="w-4 h-4" />
              <span>{booking.client_email_c}</span>
            </div>
            
{booking.client_phone_c && (
              <div className="flex items-center gap-2 text-gray-600">
                <ApperIcon name="Phone" className="w-4 h-4" />
                <span>{booking.client_phone_c}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-gray-600">
              <ApperIcon name="Calendar" className="w-4 h-4" />
<span className="font-medium text-gray-900">
                {dayjs(booking.start_time_c).format("dddd, MMMM D, YYYY")}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <ApperIcon name="Clock" className="w-4 h-4" />
<span className="font-medium text-gray-900">
                {dayjs(booking.start_time_c).format("h:mm A")} - {dayjs(booking.end_time_c).format("h:mm A")}
              </span>
            </div>
            
{service?.price_c && (
              <div className="flex items-center gap-2 text-gray-600">
                <ApperIcon name="DollarSign" className="w-4 h-4" />
                <span className="font-bold text-primary text-lg">{formatPrice(service.price_c)}</span>
              </div>
            )}
            
{booking.notes_c && (
              <div className="flex items-start gap-2 text-gray-600 mt-3">
                <ApperIcon name="MessageSquare" className="w-4 h-4 mt-0.5" />
                <span className="text-gray-700">{booking.notes_c}</span>
              </div>
            )}
          </div>
        </div>
        
<div className="text-right text-sm text-gray-500">
          {isUpcoming ? `in ${formatDistanceToNow(dayjs(booking.start_time_c).toDate())}` : 
           isPast ? `${formatDistanceToNow(dayjs(booking.start_time_c).toDate())} ago` : "Today"}
        </div>
      </div>
      
{showActions && isUpcoming && booking.status_c === "Confirmed" && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            icon="Calendar"
            onClick={() => onReschedule?.(booking)}
          >
            Reschedule
          </Button>
          
          <Button
            variant="danger"
            size="sm"
            icon="X"
            onClick={() => onCancel?.(booking)}
          >
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );
};

export default BookingCard;
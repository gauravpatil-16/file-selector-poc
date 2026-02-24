import { cn } from "@/utils/cn";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TimeSlot = ({ 
  time, 
  isAvailable = true, 
  isSelected = false, 
  isBooked = false, 
  isOccupied = false,
  isPast = false,
  onClick,
  booking = null,
  className 
}) => {
  const handleClick = () => {
    if (isAvailable && !isPast && onClick) {
      onClick(time);
    }
  };

const getSlotStyles = () => {
    if (isPast) {
      return "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed";
    }
    if (isBooked || isOccupied) {
      return "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-md cursor-not-allowed";
    }
    if (isSelected) {
      return "bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary border-2 scale-102 shadow-lg";
    }
    if (isAvailable) {
      return "bg-white border-gray-300 hover:border-primary hover:scale-102 hover:shadow-md cursor-pointer";
    }
    return "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed";
  };

  return (
    <div
      className={cn(
        "p-3 rounded-xl border-2 transition-all duration-200 text-center min-h-[80px] flex flex-col justify-center",
        getSlotStyles(),
        className
      )}
      onClick={handleClick}
    >
<div className="text-sm font-semibold">
        {dayjs(time).format("h:mm A")}
      </div>
      
{(isBooked || isOccupied) && booking && (
        <div className="text-xs mt-1 opacity-90">
          {booking.client_name_c}
        </div>
      )}
      {(isBooked || isOccupied) && !booking && (
        <div className="text-xs mt-1 opacity-90">
          Occupied
        </div>
      )}
      
      {!isAvailable && !isBooked && !isPast && (
        <div className="text-xs mt-1">
          Unavailable
        </div>
      )}
    </div>
  );
};

export default TimeSlot;
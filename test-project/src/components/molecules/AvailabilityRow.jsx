import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const AvailabilityRow = ({ 
  day, 
  availability, 
  onToggle, 
  onTimeChange,
  serviceName,
  className 
}) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[day];

return (
    <div className={cn("flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200", className)}>
      <div className="w-24">
        <span className="font-semibold text-gray-900">{dayName}</span>
        {serviceName && (
          <div className="text-xs text-gray-500 mt-1">
            {serviceName}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant={availability.is_active_c ? "success" : "secondary"}
          size="sm"
          onClick={() => onToggle(day)}
          icon={availability.is_active_c ? "Check" : "X"}
        >
          {availability.is_active_c ? "Open" : "Closed"}
        </Button>
      </div>
      
{availability.is_active_c && (
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1">
            <Input
              type="time"
              value={availability.start_time_c}
              onChange={(e) => onTimeChange(day, 'startTime', e.target.value)}
              className="text-sm"
            />
          </div>
          
          <span className="text-gray-500 font-medium">to</span>
          
          <div className="flex-1">
            <Input
              type="time"
              value={availability.end_time_c}
              onChange={(e) => onTimeChange(day, 'endTime', e.target.value)}
              className="text-sm"
            />
          </div>
          
          {serviceName && (
            <div className="text-xs text-gray-500 ml-2">
              for {serviceName}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailabilityRow;
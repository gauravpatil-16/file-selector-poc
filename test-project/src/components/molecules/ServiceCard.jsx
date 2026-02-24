import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const ServiceCard = ({ 
  service, 
  onEdit, 
  onToggleStatus,
  onBook,
  showActions = true,
  className 
}) => {
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Card variant="gradient" className={cn("p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
<h3 className="text-lg font-bold text-gray-900">{service.Name}</h3>
            <Badge variant={service.is_active_c ? "active" : "inactive"}>
              {service.is_active_c ? "Active" : "Inactive"}
            </Badge>
          </div>
          
<p className="text-secondary text-sm mb-3 line-clamp-2">{service.description_c}</p>
          
<div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Duration: <span className="font-semibold text-gray-900">{formatDuration(service.duration_c)}</span>
            </span>
            <span className="text-gray-600">
              Price: <span className="font-bold text-primary text-lg">{formatPrice(service.price_c)}</span>
            </span>
          </div>
        </div>
</div>
      
      {/* Conditional Actions */}
      {onBook ? (
        // Public booking mode - show Book button
        <div className="flex items-center justify-center">
          <Button
            variant="success"
            size="sm"
            icon="Calendar"
            onClick={() => onBook(service)}
            className="w-full"
          >
            Book Service
          </Button>
        </div>
      ) : showActions ? (
        // Owner mode - show Edit and Toggle buttons
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon="Edit"
            onClick={() => onEdit?.(service)}
            disabled={!onEdit}
          >
            Edit
          </Button>
          
          <Button
            variant={service.is_active_c ? "secondary" : "success"}
            size="sm"
            icon={service.is_active_c ? "Eye" : "EyeOff"}
            onClick={() => onToggleStatus?.(service)}
            disabled={!onToggleStatus}
          >
            {service.is_active_c ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

export default ServiceCard;
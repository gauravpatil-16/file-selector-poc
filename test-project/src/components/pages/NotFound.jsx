import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-9xl font-black text-gray-200 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
              <ApperIcon name="Calendar" className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Page Not Found
          </h1>
          <p className="text-secondary text-lg">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            icon="Home"
            size="lg"
          >
            Go to Calendar
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/book")}
            icon="Plus"
            size="lg"
          >
            Book Service
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/services")}
            >
              Services
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/bookings")}
            >
              Bookings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/availability")}
            >
              Availability
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
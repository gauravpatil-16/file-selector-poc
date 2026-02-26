import { Link } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="Search" size={48} className="text-primary" />
          </div>
          <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
        </div>

        {/* Error Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have wandered off. 
          Don't worry, even the best explorers sometimes take a wrong turn.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-primary text-white font-medium rounded-lg hover:shadow-lg transition-all duration-fast active:scale-95"
          >
            <ApperIcon name="Home" size={18} />
            <span>Back to Feed</span>
          </Link>
          
          <Link
            to="/discover"
            className="inline-flex items-center justify-center space-x-2 w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-fast active:scale-95"
          >
            <ApperIcon name="Compass" size={18} />
            <span>Explore Discover</span>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Still can't find what you're looking for?{" "}
            <button className="text-primary hover:text-primary/80 font-medium transition-colors duration-fast">
              Get help
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
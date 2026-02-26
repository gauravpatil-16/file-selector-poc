import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/layouts/Root';
import ApperIcon from '@/components/ApperIcon';

const AccessDenied = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Get message from URL params or use default
  const message = searchParams.get('message') || "You don't have permission to access this page.";

  const handleLogout = async () => {
    await logout();
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ApperIcon name="ShieldX" size={40} className="text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={18} />
            Go Back
          </button>
          
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ApperIcon name="LogOut" size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
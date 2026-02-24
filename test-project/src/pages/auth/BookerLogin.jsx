import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/layouts/Root';
import { useSelector } from 'react-redux';

function BookerLogin() {
  const { isInitialized } = useAuth();
  const { user } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  // Hardcode profile slug from profiles.json
  const profileSlug = "|+IhkEfDlBWfEPd+wslKNSUkRZsBhUN86JKrfqg8dnnc=";
  
  useEffect(() => {
    if (isInitialized) {
      const { ApperUI } = window.ApperSDK;
      if(!user) {
        // Pass profileSlug as second parameter
        ApperUI.showLogin("#authentication", { profileSlug });
} else {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectPath = searchParams.get('redirect');
        navigate(redirectPath ? redirectPath : "/services");
      }
    }
  }, [isInitialized]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-surface-800 rounded-lg shadow-md">
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-r from-primary to-primary-dark text-white text-2xl 2xl:text-3xl font-bold">
            B
          </div>
          <div className="flex flex-col gap-1 items-center justify-center">
            <div className="text-center text-lg xl:text-xl font-bold">
              Booker Sign In
            </div>
            <div className="text-center text-sm text-gray-500">
              Access your booking management dashboard
            </div>
          </div>
        </div>
        <div id="authentication" />
        <div className="text-center mt-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Don't have an account?{' '}
            <Link to="/booker/signup" className="font-medium text-primary hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default BookerLogin;
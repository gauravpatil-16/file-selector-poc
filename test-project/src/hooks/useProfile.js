import { useSelector } from 'react-redux';

export const useProfile = () => {
  // Access user from Redux state
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  const profileName = user?.profile?.name;
  
  // Helper functions for common profile checks
  const isBooker = profileName === 'Booker_c';
  // Add helpers for all profiles in profiles.json
  
  // Generic checker
  const hasProfile = (profile) => profileName === profile;
  
  return {
    profileName,
    isBooker,
    hasProfile,
    user,
    isAuthenticated,
  };
};
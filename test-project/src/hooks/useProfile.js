import { useSelector } from 'react-redux';

export const useProfile = () => {
  // Access user from Redux state
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  const profileName = user?.profile?.name;
  
  // Helper functions for common profile checks
  const isAuthenticatedUser = profileName === 'AuthenticatedUser_c';
  const isPublicProfile = profileName === 'PublicProfile_c';
  
  // Generic checker
  const hasProfile = (profile) => profileName === profile;
  
  return {
    profileName,
    isAuthenticatedUser,
    isPublicProfile,
    hasProfile,
    user,
    isAuthenticated,
  };
};
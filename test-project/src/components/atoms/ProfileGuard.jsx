import { useProfile } from '@/hooks/useProfile';

function ProfileGuard({ 
  profiles,           // Array of allowed profile names
  fallback = null,    // What to show if profile doesn't match
  children 
}) {
  const { profileName } = useProfile();
  
  const hasAccess = profiles.includes(profileName);
  
  if (!hasAccess) {
    return fallback;
  }
  
  return <>{children}</>;
}

export default ProfileGuard;
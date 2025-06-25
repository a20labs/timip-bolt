import React from 'react';
import { useParams } from 'react-router-dom';
import { ProfilePage as ProfilePageComponent } from '../components/profile/ProfilePage';

export function ProfilePage() {
  // Extract handle from URL params
  const { handle } = useParams<{ handle: string }>();
  
  if (!handle) {
    return <div className="text-center p-8">Profile handle not found</div>;
  }
  
  return <ProfilePageComponent />;
}

export default ProfilePage;
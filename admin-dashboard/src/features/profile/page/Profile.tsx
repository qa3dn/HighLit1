import React from 'react';
import { useProfile } from '../useProfile';

const Profile = () => {
  const { data, isLoading } = useProfile();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Profile Content Coming Soon</h1>
    </div>
  );
};

export default Profile;

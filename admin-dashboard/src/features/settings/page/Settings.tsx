import React from 'react';
import { useSettings } from '../useSettings';

const Settings = () => {
  const { data, isLoading } = useSettings();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings Content Coming Soon</h1>
    </div>
  );
};

export default Settings;

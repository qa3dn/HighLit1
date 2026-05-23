import React from 'react';
import { useSaved } from '../useSaved';

const Saved = () => {
  const { data, isLoading } = useSaved();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Saved Content Coming Soon</h1>
    </div>
  );
};

export default Saved;

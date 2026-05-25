import { useState } from 'react';

export const useJobs = () => {
  const [data] = useState([]);
  const [isLoading] = useState(false);
  const [error] = useState(null);

  return { data, isLoading, error };
};

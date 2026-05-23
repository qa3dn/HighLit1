import { useState } from 'react';

export const useJobs = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  return { data, isLoading, error };
};

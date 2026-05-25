import { useState } from 'react';

export const useSaved = () => {
  const [data] = useState([]);
  const [isLoading] = useState(false);
  const [error] = useState(null);

  return { data, isLoading, error };
};

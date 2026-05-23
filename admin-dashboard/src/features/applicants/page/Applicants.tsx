import React from 'react';
import { useApplicants } from '../useApplicants';

const Applicants = () => {
  const { data, isLoading } = useApplicants();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Applicants Content Coming Soon</h1>
    </div>
  );
};

export default Applicants;

import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, hint, icon, accent }) => {
  return (
    <div className="rounded-xl border border-border bg-gray-light p-5 transition-all hover:border-accent/40 hover:shadow-glow animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary font-arabic">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${accent ? 'text-accent' : 'text-text'}`}>{value}</p>
          {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
        </div>
        {icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
};

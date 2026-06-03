import type { ComponentType } from 'react';

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

interface TabsProps<K extends string> {
  tabs: TabItem<K>[];
  active: K;
  onChange: (key: K) => void;
}

export function Tabs<K extends string>({ tabs, active, onChange }: TabsProps<K>) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

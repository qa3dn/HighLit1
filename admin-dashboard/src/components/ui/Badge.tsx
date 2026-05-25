
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const variants = {
    success: "bg-accent/10 text-accent border-accent/20",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    danger: "bg-red-500/10 text-red-500 border-red-500/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    default: "bg-gray text-text-secondary border-border"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border font-sans tracking-wide ${variants[variant]}`}>
      {children}
    </span>
  );
};


interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  const spinner = (
    <div className={`relative ${sizes[size]} animate-spin`}>
      <div className="absolute inset-0 rounded-full border-t-accent border-r-transparent border-b-transparent border-l-transparent"></div>
      <div className="absolute inset-0 rounded-full border-solid border-border opacity-20"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
};

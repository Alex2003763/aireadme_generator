import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. text-blue-500
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'text-slate-100' }) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'w-4 h-4 border-2';
      break;
    case 'lg':
      sizeClasses = 'w-12 h-12 border-4';
      break;
    case 'md':
    default:
      sizeClasses = 'w-8 h-8 border-[3px]';
      break;
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses} ${color}`}
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default Spinner;
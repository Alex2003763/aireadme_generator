import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant, ...props }) => {
  let baseStyle = "px-6 py-3 rounded-md font-semibold shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800";
  
  // Variant styles can be expanded here
  // For now, specific styles are applied directly in App.jsx or ArrayInputField.jsx for more control
  // This provides a basic structure if variants were to be standardized.
  if (variant === 'primary') {
    baseStyle += " bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500";
  } else if (variant === 'danger') {
     baseStyle += " bg-red-600 hover:bg-red-700 text-white focus:ring-red-500";
  } else {
     baseStyle += " text-white"; // Default or let className override
  }

  return (
    <button
      {...props}
      className={`${baseStyle} ${className || ''} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
};

export default Button;
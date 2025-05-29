import React, { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-slate-700 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-1 text-indigo-300">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-4">{description}</p>}
      {children}
    </div>
  );
};

export default SectionCard;
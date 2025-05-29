import React from 'react';

interface TextAreaFieldProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ id, value, onChange, placeholder, rows = 4, label }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-3 bg-slate-600 border border-slate-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-100 placeholder-slate-400"
      />
    </div>
  );
};

export default TextAreaField;
import React from 'react';

interface InputFieldProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  label?: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, value, onChange, placeholder, type = 'text', label }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 bg-slate-600 border border-slate-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-100 placeholder-slate-400"
      />
    </div>
  );
};

export default InputField;
import React from 'react';
import { SelectOption } from '../types'; // Import SelectOption type

interface SelectFieldProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[]; // Use SelectOption[] for structured options
  label?: string;
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ id, value, onChange, options, label, className }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full p-3 bg-slate-600 border border-slate-500 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-100 ${className || ''}`}
      >
        {options.map(option => (
          <option key={option.name} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
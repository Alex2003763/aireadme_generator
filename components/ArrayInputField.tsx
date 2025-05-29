
import React, { useState } from 'react';
import Button from './Button'; // Assuming Button component exists

interface ArrayInputFieldProps {
  id: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  noun?: string; // e.g., "feature", "technology"
  label?: string;
}

const ArrayInputField: React.FC<ArrayInputFieldProps> = ({ id, items, onChange, placeholder, noun = 'item', label }) => {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = value;
    onChange(updatedItems);
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
      <ul className="space-y-2 mb-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              className="flex-grow p-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400"
              placeholder={`Enter ${noun} #${index + 1}`}
            />
            <Button
              onClick={() => handleRemoveItem(index)}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 text-sm"
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder || `Add a new ${noun}`}
          className="flex-grow p-3 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); }}}
        />
        <Button
          onClick={handleAddItem}
          className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
        >
          Add {noun.charAt(0).toUpperCase() + noun.slice(1)}
        </Button>
      </div>
    </div>
  );
};

export default ArrayInputField;

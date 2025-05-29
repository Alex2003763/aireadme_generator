import React, { useState, useEffect } from 'react';
import InputField from './InputField';
import Button from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveApiKey: (key: string) => void;
  currentApiKey: string | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaveApiKey, currentApiKey }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    setApiKeyInput(currentApiKey || '');
  }, [currentApiKey, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSaveApiKey(apiKeyInput.trim());
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-indigo-400">API Settings</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 p-1 rounded-full"
            aria-label="Close settings modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Enter your OpenRouter API key to enable AI-powered content generation. 
            You can get an API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline">OpenRouter.ai</a>.
          </p>
          <InputField
            id="openRouterApiKey"
            label="OpenRouter API Key"
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="sk-or-..."
          />
          <p className="text-xs text-slate-400">
            Your API key is stored locally in your browser and is never sent to our servers.
            The default model used is <code className="text-xs bg-slate-700 p-1 rounded">deepseek/deepseek-chat-v3-0324:free</code>.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <Button 
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
          >
            Save API Key
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
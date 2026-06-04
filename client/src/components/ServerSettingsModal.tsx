import React, { useState } from 'react';
import { X, Server, Smartphone, Monitor } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../utils/api';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      if (!apiUrl.trim()) {
        setMessage('API URL cannot be empty');
        return;
      }
      if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        setMessage('URL must start with http:// or https://');
        return;
      }
      setApiBaseUrl(apiUrl.trim());
      setMessage('Settings saved successfully!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1000);
    } catch (err) {
      setMessage('Invalid URL');
    }
  };

  const handlePreset = (url: string) => {
    setApiUrl(url);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gym-card border border-gym-border/60 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gym-text-secondary hover:text-gym-text-primary transition duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="bg-gym-accent/15 p-2 rounded-lg text-gym-accent border border-gym-accent/20">
            <Server className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-gym-text-primary">Server Settings</h3>
        </div>

        <p className="text-xs text-gym-text-secondary mb-4 leading-relaxed">
          Configure the API server address. By default, the app connects to the localhost server.
        </p>

        {message && (
          <div className={`p-2.5 rounded-lg text-xs mb-4 text-center border ${
            message.includes('success') 
              ? 'bg-gym-accent/10 border-gym-accent/30 text-gym-accent' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gym-text-secondary uppercase tracking-wider mb-1.5">
              API Server URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="block w-full px-3 py-2 bg-gym-dark border border-gym-border rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent transition duration-200 text-sm"
              placeholder="http://10.0.2.2:5000"
            />
          </div>

          <div>
            <span className="block text-[11px] font-bold text-gym-text-secondary uppercase tracking-wider mb-2">
              Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePreset('http://10.0.2.2:5000')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gym-border/60 rounded-xl text-xs bg-gym-dark/50 hover:bg-gym-dark text-gym-text-primary hover:border-gym-accent/40 transition duration-200 cursor-pointer"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Android Emulator</span>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('http://localhost:5000')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gym-border/60 rounded-xl text-xs bg-gym-dark/50 hover:bg-gym-dark text-gym-text-primary hover:border-gym-accent/40 transition duration-200 cursor-pointer"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Localhost</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gym-border/60 rounded-xl text-xs font-semibold text-gym-text-secondary hover:text-gym-text-primary transition duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 px-4 bg-gym-accent text-gym-dark rounded-xl text-xs font-bold hover:bg-gym-accent/90 transition duration-200 cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSettingsModal;

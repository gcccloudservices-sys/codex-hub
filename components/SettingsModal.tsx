
import React, { useState, useEffect } from 'react';
import { MarsConfig } from '../types';
import { SaveIcon, SettingsIcon, CloseIcon } from './Icons';

interface SettingsModalProps {
  config: MarsConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MarsConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ config, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<MarsConfig>(config);

  useEffect(() => {
    setFormData(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden border border-[var(--border-color-hover)] shadow-2xl shadow-cyan-900/20 transform transition-all scale-100">
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                <SettingsIcon className="w-5 h-5 text-[var(--accent)]" />
             </div>
             <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Configurações de Conexão</h2>
                <p className="text-xs text-[var(--text-secondary)]">Gerencie credenciais e overrides.</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          
          <div className="flex items-center justify-between p-4 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-color)]">
              <div>
                 <label className="text-sm font-bold text-white block">Override Local</label>
                 <span className="text-xs text-[var(--text-secondary)]">Forçar uso das chaves abaixo em vez do .env</span>
              </div>
              <button 
                onClick={() => setFormData(prev => ({...prev, useLocalOverride: !prev.useLocalOverride}))}
                className={`w-12 h-6 rounded-full transition-all relative ${formData.useLocalOverride ? 'bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${formData.useLocalOverride ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
          </div>
          
          <div className={`space-y-5 transition-opacity duration-300 ${formData.useLocalOverride ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">GitHub PAT</label>
              <input 
                type="password" 
                value={formData.githubTokenOverride} 
                onChange={(e) => setFormData(prev => ({...prev, githubTokenOverride: e.target.value}))}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full bg-black/40 border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-1">Gemini API Key</label>
              <input 
                type="password" 
                value={formData.geminiApiKey} 
                onChange={(e) => setFormData(prev => ({...prev, geminiApiKey: e.target.value}))}
                placeholder="AIzaSy...xxxxxxxxxxxx"
                className="w-full bg-black/40 border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder-white/20"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-[var(--border-color)] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-bold text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-colors">Cancelar</button>
          <button 
            onClick={() => { onSave({...formData, lastUpdate: Date.now()}); onClose(); }}
            className="px-6 py-2.5 bg-[var(--accent)] text-black rounded-lg text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-[var(--accent-glow)] flex items-center gap-2"
          >
            <SaveIcon className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

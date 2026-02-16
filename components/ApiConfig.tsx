import React, { useState } from 'react';
import { MarsConfig } from '../types';
import { SaveIcon, BrainIcon } from './Icons';

interface ApiConfigProps {
  onConfigured: () => void;
  onSaveConfig: (config: MarsConfig) => void;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ onConfigured, onSaveConfig }) => {
  const [githubToken, setGithubToken] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const handleSave = () => {
    if (githubToken.trim() && geminiApiKey.trim()) {
      const newConfig: MarsConfig = {
        githubTokenOverride: githubToken,
        geminiApiKey: geminiApiKey,
        useLocalOverride: true,
        lastUpdate: Date.now(),
      };
      onSaveConfig(newConfig);
      onConfigured();
    }
  };

  const isFormValid = githubToken.trim() !== '' && geminiApiKey.trim() !== '';

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-8">
      <div className="text-center mb-10 animate-fade-in-up">
        {/* FIX: Replaced inline style with a Tailwind arbitrary property to resolve prop type error. The 'style' prop is not defined on IconProps. */}
        <BrainIcon className="w-16 h-16 text-[var(--accent)] mx-auto mb-4 [filter:drop-shadow(0_0_15px_var(--accent-glow))]"/>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white">Configuração de API</h1>
        <p className="text-[var(--text-secondary)] mt-2">Insira suas chaves de API para ativar o Codex Engine.</p>
      </div>

      <div className="w-full max-w-lg glass-panel rounded-2xl p-8 space-y-6 animate-fade-in-up" style={{animationDelay: '200ms'}}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-secondary)]">GitHub PAT</label>
           <p className="text-xs text-[var(--text-tertiary)] -mt-1">
                Necessário para ler os arquivos do repositório.
                <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline ml-1 font-bold">
                  Crie um token com escopo 'repo'.
                </a>
              </p>
          <input 
            type="password" 
            value={githubToken} 
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full bg-[var(--surface-secondary)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Google Gemini API Key</label>
           <p className="text-xs text-[var(--text-tertiary)] -mt-1">
                Usada para toda a lógica de IA e geração de código.
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline ml-1 font-bold">
                  Obtenha uma chave no Google AI Studio.
                </a>
              </p>
          <input 
            type="password" 
            value={geminiApiKey} 
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="AIzaSy...xxxxxxxxxxxx"
            className="w-full bg-[var(--surface-secondary)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all"
          />
        </div>

        <button 
            onClick={handleSave}
            disabled={!isFormValid}
            className="w-full mt-4 py-3 bg-[var(--accent)] text-black rounded-md text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-[var(--accent-glow)] disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
            <SaveIcon className="w-4 h-4" />
            Salvar e Continuar
        </button>
      </div>
    </div>
  );
};

export default ApiConfig;
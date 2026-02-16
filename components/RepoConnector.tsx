import React, { useState } from 'react';
import { LinkIcon, SpinnerIcon, BrainIcon } from './Icons';

interface RepoConnectorProps {
    onConnect: (url: string) => void;
    isLoading: boolean;
}

export const RepoConnector: React.FC<RepoConnectorProps> = ({ onConnect, isLoading }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onConnect(url.trim());
        }
    };

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center p-8">
            <div className="text-center mb-10 animate-fade-in-up">
                {/* FIX: Replaced inline style with a Tailwind arbitrary property to resolve prop type error. The 'style' prop is not defined on IconProps. */}
                <BrainIcon className="w-20 h-20 text-[var(--accent)] mx-auto mb-4 [filter:drop-shadow(0_0_15px_var(--accent-glow))]"/>
                <h1 className="text-5xl font-extrabold tracking-tighter text-white">Nexus Codex Engine</h1>
                <p className="text-[var(--text-secondary)] mt-2">Conecte um repositório para iniciar a engenharia de software assistida por IA.</p>
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-xl animate-fade-in-up" style={{animationDelay: '200ms'}}>
                <div className="relative group">
                    <div 
                        className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-[var(--accent)] to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-500"
                    ></div>
                    <div className="relative flex items-center bg-[var(--background)] border border-[var(--border-color)] rounded-lg p-2 shadow-lg">
                        <LinkIcon className="w-5 h-5 text-[var(--text-secondary)] mx-3" />
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://github.com/owner/repository"
                            className="w-full bg-transparent text-lg text-white placeholder-[var(--text-tertiary)] outline-none"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="bg-[var(--accent)] hover:opacity-90 text-black font-bold py-3 px-6 rounded-md transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center gap-2 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
                            disabled={isLoading || !url.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <SpinnerIcon className="w-5 h-5" />
                                    <span>Analisando...</span>
                                </>
                            ) : (
                                "Conectar"
                            )}
                        </button>
                    </div>
                </div>
            </form>
            <div className="text-center mt-6 text-xs text-[var(--text-tertiary)] animate-fade-in-up" style={{animationDelay: '400ms'}}>
                <p>Ex: <code className="bg-[var(--surface-primary)] p-1 rounded-md text-[var(--text-secondary)]">https://github.com/facebook/react</code></p>
            </div>
        </div>
    );
};
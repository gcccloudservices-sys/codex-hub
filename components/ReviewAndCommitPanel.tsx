
import React, { useState, useEffect } from 'react';
import { AgentStatusInfo, ModelType } from '../types';
import { generatePullRequestDetails } from '../services/githubService';
import { GitPullRequestIcon, MagicWandIcon, SpinnerIcon, CopyIcon, CheckIcon } from './Icons';

interface ReviewAndCommitPanelProps {
  objective: string;
  completedTasks: AgentStatusInfo[];
  model: ModelType;
  onCreatePullRequest: (details: { title: string; body: string }) => void;
  isLoading?: boolean;
}

export const ReviewAndCommitPanel: React.FC<ReviewAndCommitPanelProps> = ({
  objective,
  completedTasks,
  model,
  onCreatePullRequest,
  isLoading,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerateDetails = async () => {
    setIsGenerating(true);
    try {
      const details = await generatePullRequestDetails(objective, completedTasks, model);
      setTitle(details.title);
      setBody(details.body);
    } catch (error) {
      console.error("Failed to generate PR details:", error);
      setTitle(`feat: Implement objective: ${objective}`); // Fallback
      setBody('Automated changes based on the initial objective.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerateDetails();
  }, []);

  const handleCreatePR = () => {
    if (title.trim() && !isLoading) {
        onCreatePullRequest({ title, body });
    }
  }

  const copyToClipboard = (text: string, field: string) => {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="p-4 border-t border-[var(--border-color)] bg-[var(--surface-secondary)] animate-fade-in-up space-y-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <GitPullRequestIcon className="w-4 h-4 text-purple-400" />
                <label className="text-sm font-bold text-slate-200">Revisar e Criar Pull Request</label>
            </div>
             <button
                onClick={handleGenerateDetails}
                disabled={isGenerating || isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-sky-500/20"
            >
                {isGenerating ? <SpinnerIcon className="w-3 h-3"/> : <MagicWandIcon className="w-3 h-3" />}
                <span>{isGenerating ? 'Gerando...' : 'Regenerar Sugestão'}</span>
            </button>
        </div>

        <div className="space-y-3">
            <div className="relative group">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título do Pull Request..."
                    className="w-full bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-lg p-3 pr-10 text-sm text-white placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-medium"
                    disabled={isLoading}
                />
                <button 
                    onClick={() => copyToClipboard(title, 'title')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white rounded-md transition-colors"
                    title="Copiar Título"
                >
                    {copiedField === 'title' ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
                </button>
            </div>
            
            <div className="relative group">
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Descreva as alterações..."
                    className="w-full bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-lg p-3 pr-10 text-xs font-mono text-slate-300 placeholder-[var(--text-secondary)] resize-y outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all min-h-[100px]"
                    rows={6}
                    disabled={isLoading}
                />
                <button 
                    onClick={() => copyToClipboard(body, 'body')}
                    className="absolute right-2 top-3 p-1.5 text-slate-500 hover:text-white rounded-md transition-colors bg-black/20 hover:bg-black/40"
                    title="Copiar Descrição"
                >
                     {copiedField === 'body' ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
        
        <button
          onClick={handleCreatePR}
          disabled={isLoading || !title.trim()}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.01] active:scale-[0.99]"
        >
          {isLoading ? (
            <SpinnerIcon className="w-5 h-5" />
          ) : (
            <>
              <GitPullRequestIcon className="w-4 h-4" />
              <span>Confirmar Pull Request</span>
            </>
          )}
        </button>
    </div>
  );
};

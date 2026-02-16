
import React, { useState } from 'react';
import { SpinnerIcon, PlayIcon } from './Icons';
import { WorkflowStage } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  stage: WorkflowStage;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, stage }) => {
    const [message, setMessage] = useState('');
    const isLoading = stage === 'planning' || stage === 'executing';

    const handleSend = () => {
        if (message.trim() && !isLoading) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-start gap-2">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                    isLoading ? "Agentes em execução..." : "Descreva a tarefa de engenharia..."
                }
                className="flex-grow bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-white placeholder-[var(--text-secondary)] resize-none outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all"
                rows={2}
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
                className="h-full px-5 bg-[var(--accent)] hover:opacity-90 text-black font-bold rounded-lg transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
            >
                {isLoading ? (
                    <SpinnerIcon className="w-5 h-5" />
                ) : (
                    <PlayIcon className="w-5 h-5" />
                )}
            </button>
        </div>
    );
};

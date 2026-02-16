
import React, { useMemo } from 'react';
import { AgentStatusInfo, TaskStatus } from '../types';
import { CheckIcon, SpinnerIcon, ClockIcon, RetryIcon, StopIcon } from './Icons';

interface MissionProgressBarProps {
  statuses: AgentStatusInfo[];
}

export const MissionProgressBar: React.FC<MissionProgressBarProps> = ({ statuses }) => {
  const stats = useMemo(() => {
    const total = statuses.length;
    if (total === 0) return { percent: 0, counts: { completed: 0, working: 0, pending: 0, error: 0, blocked: 0 } };

    const counts = statuses.reduce((acc, curr) => {
      if (curr.status === TaskStatus.COMPLETED) acc.completed++;
      else if (curr.status === TaskStatus.WORKING) acc.working++;
      else if (curr.status === TaskStatus.PENDING) acc.pending++;
      else if (curr.status === TaskStatus.ERROR) acc.error++;
      else if (curr.status === TaskStatus.BLOCKED) acc.blocked++;
      return acc;
    }, { completed: 0, working: 0, pending: 0, error: 0, blocked: 0 });

    // Bloqueados e Erros contam como "processados" para a barra não travar visualmente, 
    // mas a cor indicará o problema. O foco é 'Completed'.
    const percent = Math.round((counts.completed / total) * 100);
    
    return { percent, counts, total };
  }, [statuses]);

  return (
    <div className="w-full bg-[var(--surface-secondary)] border-b border-[var(--border-color)] px-6 py-3 animate-fade-in">
      <div className="flex flex-col gap-2">
        {/* Top Row: Label and Percent */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
             <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Progresso da Missão</span>
             {stats.counts.working > 0 && (
                 <span className="flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    <SpinnerIcon className="w-3 h-3" />
                    Processando
                 </span>
             )}
          </div>
          <span className="text-sm font-mono font-bold text-white">{stats.percent}%</span>
        </div>

        {/* Progress Bar Track */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
            <div 
                className="h-full bg-[var(--accent)] transition-all duration-700 ease-out shadow-[0_0_10px_var(--accent-glow)] relative"
                style={{ width: `${stats.percent}%` }}
            >
                <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-white/50 shadow-[0_0_5px_white]"></div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="flex gap-6 mt-1">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                <CheckIcon className="w-3 h-3" />
                <span>{stats.counts.completed} Concluídas</span>
            </div>
            
            {stats.counts.working > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-sky-400">
                    <SpinnerIcon className="w-3 h-3" />
                    <span>{stats.counts.working} Em Andamento</span>
                </div>
            )}

            {(stats.counts.pending > 0) && (
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                    <ClockIcon className="w-3 h-3" />
                    <span>{stats.counts.pending} Pendentes</span>
                </div>
            )}

            {stats.counts.error > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-rose-400">
                    <RetryIcon className="w-3 h-3" />
                    <span>{stats.counts.error} Erros</span>
                </div>
            )}
             {stats.counts.blocked > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-500">
                    <StopIcon className="w-3 h-3" />
                    <span>{stats.counts.blocked} Bloqueadas</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

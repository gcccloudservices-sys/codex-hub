
import { Agent, AgentStatusInfo, LogEntry, WorkflowStage, TaskStatus, Task } from '../types';
import { BrainIcon, ConsoleIcon, ExternalLinkIcon, GitCommitIcon, PlayIcon, SpinnerIcon, CheckIcon, EyeIcon, SearchIcon, ShieldIcon } from './Icons';
import React, { useEffect, useRef, useState } from 'react';
import { getAgentColor } from '../utils/colorUtils';

const SystemTerminal: React.FC<{ logs: LogEntry[], allAgents: Agent[] }> = ({ logs, allAgents }) => {
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="w-full h-full bg-black/50 font-mono text-[11px] overflow-hidden flex flex-col relative">
            <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-1 relative z-10">
                {logs.map((log) => {
                    const agent = log.agentId ? allAgents.find(a => a.id === log.agentId) : null;
                    const agentName = agent ? agent.name : 'System';
                    
                    // Determine styles based on log type
                    let textColor = 'text-slate-300';
                    let borderColorClass = agent ? getAgentColor(agent).replace('bg-', 'border-') : 'border-slate-700';
                    let bgClass = '';
                    let IconComponent = null;

                    if (log.type === 'error') {
                        textColor = 'text-rose-400';
                    } else if (log.type === 'success') {
                        textColor = 'text-emerald-400';
                    } else if (log.type === 'security') {
                        textColor = 'text-amber-400 font-bold';
                        borderColorClass = 'border-amber-500'; // Override agent border
                        bgClass = 'bg-amber-900/10 rounded-r-sm'; // Highlight background
                        IconComponent = ShieldIcon;
                    } else if (log.type === 'api') {
                        textColor = 'text-cyan-300/80';
                    }

                    return (
                        <div key={log.id} className={`flex gap-2 items-start pl-2 border-l-2 ${borderColorClass} ${bgClass} transition-colors duration-300`}>
                            <span className="text-slate-600 shrink-0 select-none w-16 text-right opacity-70 py-0.5">{log.timestamp}</span>
                            <div className="flex-grow py-0.5">
                                <span className="font-bold text-slate-500 mr-2">[{agentName}]</span>
                                <span className={`break-words leading-relaxed ${textColor} flex items-center gap-1.5`}>
                                    {IconComponent && <IconComponent className="w-3 h-3 inline-block shrink-0" />}
                                    {log.message}
                                </span>
                                {(log.commitUrl || log.pullRequestUrl) && (
                                    <a href={log.commitUrl || log.pullRequestUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded-md text-[9px] font-bold text-slate-300 hover:text-white transition-colors">
                                        Ver no GitHub <ExternalLinkIcon className="w-2.5 h-2.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )
                })}
                <div ref={terminalEndRef} />
            </div>
        </div>
    );
};

const TaskDetailView: React.FC<{
    task: Task;
    statusInfo: AgentStatusInfo;
    agent?: Agent;
    onRetry: (taskId: string) => void;
}> = ({ task, statusInfo, agent, onRetry }) => {
    const isWorking = statusInfo.status === TaskStatus.WORKING;
    const isCompleted = statusInfo.status === TaskStatus.COMPLETED;
    const isError = statusInfo.status === TaskStatus.ERROR;
    const tokenUsage = statusInfo.executionDetails?.tokenUsage;
    const grounding = statusInfo.result?.grounding;

    return (
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getAgentColor(agent)}/20 ${getAgentColor(agent).replace('bg-', 'border-')}`}>
                    <div className={`w-5 h-5 ${getAgentColor(agent).replace('bg-', 'text-')}`}>
                        {React.createElement(BrainIcon)}
                    </div>
                </div>
                <div>
                    <p className="text-xs text-slate-400">Agente em Foco</p>
                    <p className="text-sm font-bold text-white">{agent?.name || statusInfo.agentId}</p>
                </div>
            </div>
            
            <div className="mt-4 bg-black/20 p-3 rounded-lg border border-white/5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Descrição da Tarefa</p>
                <p className="text-sm text-slate-200 mt-2">{statusInfo.description}</p>
            </div>
            
            {/* Grounding Sources Display */}
            {isCompleted && grounding && grounding.length > 0 && (
                <div className="mt-4 bg-[var(--surface-secondary)] p-3 rounded-lg border border-sky-500/20">
                     <div className="flex items-center gap-2 mb-2">
                         <SearchIcon className="w-3 h-3 text-sky-400" />
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Fontes Consultadas (Grounding)</h4>
                     </div>
                     <div className="flex flex-col gap-1.5">
                         {grounding.map((source, idx) => (
                             <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-between text-xs text-slate-300 hover:text-white bg-black/20 p-2 rounded hover:bg-white/5 transition-colors group"
                             >
                                 <span className="truncate flex-1">{source.title}</span>
                                 <ExternalLinkIcon className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                             </a>
                         ))}
                     </div>
                </div>
            )}

            {isWorking && (
                <div className="mt-4 border border-[var(--border-color)] bg-black/30 p-3 rounded-lg animate-fade-in max-h-72 overflow-y-auto custom-scrollbar">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-2">Feed de Streaming</h4>
                    <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">
                        {statusInfo.streamingContent || "Aguardando saída..."}
                        <span className="inline-block w-2 h-3 bg-white animate-pulse ml-0.5" style={{ animationDuration: '1s' }}></span>
                    </pre>
                </div>
            )}

            {isCompleted && statusInfo.result && (
                 <div className="mt-4 border border-emerald-500/20 bg-black/30 p-3 rounded-lg animate-fade-in max-h-72 overflow-y-auto custom-scrollbar">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Resultado Final</h4>
                    <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{statusInfo.result.content}</pre>
                </div>
            )}
             {isCompleted && tokenUsage && (
                <div className="mt-2 text-xs font-mono text-emerald-400/80 text-right">
                    {tokenUsage.totalTokens.toLocaleString()} tokens
                    <span className="text-slate-500"> / </span>
                    {(statusInfo.executionDetails?.durationMs || 0 / 1000).toFixed(1)}s
                </div>
             )}

            {isError && (
                 <div className="mt-4 border border-rose-500/20 bg-rose-500/10 p-4 rounded-lg animate-fade-in text-center">
                    <p className="text-sm text-rose-300 font-bold">O agente encontrou um erro.</p>
                     <button onClick={() => onRetry(statusInfo.taskId)} className="mt-3 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs font-bold">
                        Tentar Novamente
                     </button>
                </div>
            )}
        </div>
    );
}

interface MissionDetailPaneProps {
  tasks: Task[];
  statuses: AgentStatusInfo[];
  selectedTaskId: string | null;
  onRetryTask: (taskId: string) => void;
  allAgents: Agent[];
  logs: LogEntry[];
}

export const MissionDetailPane: React.FC<MissionDetailPaneProps> = ({ 
    tasks, statuses, selectedTaskId, onRetryTask, allAgents, logs
}) => {
  const selectedStatus = statuses.find(s => s.taskId === selectedTaskId);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="flex h-full flex-col glass-panel rounded-lg w-96 shrink-0 border-[var(--border-color-hover)]">
        
        {selectedStatus && selectedTask ? (
            <TaskDetailView 
                task={selectedTask}
                statusInfo={selectedStatus}
                agent={allAgents.find(a => a.id === selectedStatus.agentId)}
                onRetry={onRetryTask}
            />
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <EyeIcon className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
                <h3 className="text-base font-bold text-slate-300">Painel de Foco</h3>
                <p className="text-xs text-[var(--text-secondary)]">Selecione uma tarefa no grafo para ver os detalhes da execução.</p>
            </div>
        )}

        <div className="h-56 border-t border-[var(--border-color)] shrink-0 bg-black/30">
             <div className="flex items-center gap-2 p-2 border-b border-[var(--border-color)]">
                <ConsoleIcon className="w-4 h-4 text-cyan-400"/>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Console do Sistema</span>
             </div>
             <SystemTerminal logs={logs} allAgents={allAgents} />
        </div>
    </div>
  );
};


import { Agent, AgentStatusInfo, LogEntry, TaskStatus, Task } from '../types';
import { BrainIcon, ConsoleIcon, ExternalLinkIcon, SearchIcon, EyeIcon } from './Icons';
import React, { useEffect, useRef } from 'react';
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
                    const agentColorClass = agent ? getAgentColor(agent).replace('bg-', 'border-') : 'border-slate-700';
                    const agentName = agent ? agent.name : 'System';

                    return (
                        <div key={log.id} className={`flex gap-2 items-start pl-2 border-l-2 ${agentColorClass}`}>
                            <span className="text-slate-600 shrink-0 select-none w-16 text-right opacity-70">{log.timestamp}</span>
                            <div className="flex-grow">
                                <span className="font-bold text-slate-500 mr-2">[{agentName}]</span>
                                <span className={`break-words leading-relaxed ${log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                    {log.message}
                                </span>
                                {(log.commitUrl || log.pullRequestUrl) && (
                                    <a href={log.commitUrl || log.pullRequestUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded-md text-[9px] font-bold text-slate-300 hover:text-white transition-colors">
                                        GitHub <ExternalLinkIcon className="w-2.5 h-2.5" />
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
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {/* Header: Agent Identity */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center border ${getAgentColor(agent)}/20 ${getAgentColor(agent).replace('bg-', 'border-')}`}>
                    <div className={`w-5 h-5 ${getAgentColor(agent).replace('bg-', 'text-')}`}>
                        <BrainIcon />
                    </div>
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Agente Designado</p>
                    <p className="text-sm font-bold text-white leading-tight">{agent?.name || statusInfo.agentId}</p>
                </div>
            </div>
            
            {/* Task Description */}
            <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-1">Objetivo da Tarefa</p>
                <p className="text-xs text-slate-300 leading-relaxed">{statusInfo.description}</p>
            </div>
            
            {/* Grounding Results (Search Sources) */}
            {isCompleted && grounding && grounding.length > 0 && (
                <div className="bg-[var(--surface-secondary)] p-3 rounded-lg border border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.1)]">
                     <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                         <SearchIcon className="w-3.5 h-3.5 text-sky-400" />
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Fontes Verificadas</h4>
                     </div>
                     <div className="flex flex-col gap-2">
                         {grounding.map((source, idx) => (
                             <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-between group bg-black/40 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/30 p-2 rounded transition-all duration-200"
                             >
                                 <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">{source.title}</span>
                                    <span className="text-[9px] text-slate-500 truncate">{new URL(source.uri).hostname}</span>
                                 </div>
                                 <ExternalLinkIcon className="w-3 h-3 text-slate-500 group-hover:text-sky-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                             </a>
                         ))}
                     </div>
                </div>
            )}

            {/* Live Streaming Output */}
            {isWorking && (
                <div className="flex-1 min-h-[150px] border border-[var(--border-color)] bg-black/40 p-3 rounded-lg relative overflow-hidden">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
                        Processando
                    </h4>
                    <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all h-full overflow-y-auto custom-scrollbar">
                        {statusInfo.streamingContent || "Inicializando contexto..."}
                    </pre>
                </div>
            )}

            {/* Final Output */}
            {isCompleted && statusInfo.result && (
                 <div className="flex-1 min-h-[150px] border border-emerald-500/20 bg-emerald-900/5 p-3 rounded-lg flex flex-col">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Resultado da Execução</h4>
                    <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all flex-1 overflow-y-auto custom-scrollbar">
                        {statusInfo.result.content}
                    </pre>
                    {tokenUsage && (
                        <div className="mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-slate-500 text-right">
                            TOKENS: {tokenUsage.totalTokens} | TEMPO: {(statusInfo.executionDetails?.durationMs || 0) / 1000}s
                        </div>
                    )}
                </div>
            )}

            {isError && (
                 <div className="border border-rose-500/20 bg-rose-500/10 p-4 rounded-lg text-center animate-fade-in">
                    <p className="text-xs text-rose-300 font-bold mb-2">Falha na execução do agente</p>
                     <button onClick={() => onRetry(statusInfo.taskId)} className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 rounded text-xs font-bold transition-all">
                        Reiniciar Tarefa
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
    <div className="flex h-full flex-col glass-panel rounded-lg w-96 shrink-0 border-[var(--border-color-hover)] bg-opacity-80">
        
        {selectedStatus && selectedTask ? (
            <TaskDetailView 
                task={selectedTask}
                statusInfo={selectedStatus}
                agent={allAgents.find(a => a.id === selectedStatus.agentId)}
                onRetry={onRetryTask}
            />
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                <EyeIcon className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
                <h3 className="text-sm font-bold text-slate-300">Nenhuma tarefa selecionada</h3>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1 max-w-[200px]">Clique em um nó no grafo para inspecionar os detalhes.</p>
            </div>
        )}

        <div className="h-48 border-t border-[var(--border-color)] shrink-0 bg-black/40 flex flex-col">
             <div className="flex items-center gap-2 p-2 border-b border-[var(--border-color)] bg-white/5">
                <ConsoleIcon className="w-3.5 h-3.5 text-cyan-400"/>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">System Logs</span>
             </div>
             <SystemTerminal logs={logs} allAgents={allAgents} />
        </div>
    </div>
  );
};

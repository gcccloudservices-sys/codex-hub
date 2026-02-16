
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Agent, AgentStatusInfo, Task, TaskStatus } from '../types';
import { getAgentColor } from '../utils/colorUtils';
import { CheckIcon, CodeIcon, EyeIcon, RetryIcon, SpinnerIcon, StopIcon, WriterIcon, VercelIcon } from './Icons';

interface MissionControlViewProps {
  objective: string;
  tasks: Task[];
  statuses: AgentStatusInfo[];
  agents: Agent[];
  onTaskSelect: (taskId: string | null) => void;
  selectedTaskId: string | null;
}

const TaskNode: React.FC<{
    task: Task;
    statusInfo?: AgentStatusInfo;
    agent?: Agent;
    onClick: () => void;
    isSelected: boolean;
    nodeRef: (el: HTMLDivElement | null) => void;
}> = ({ task, statusInfo, agent, onClick, isSelected, nodeRef }) => {
    const status = statusInfo?.status || TaskStatus.PENDING;
    const [justCompleted, setJustCompleted] = useState(false);

    useEffect(() => {
        if (status === TaskStatus.COMPLETED) {
            setJustCompleted(true);
            const timer = setTimeout(() => setJustCompleted(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const statusConfig = {
        [TaskStatus.PENDING]: { icon: <div className="w-2.5 h-2.5 border-2 border-slate-500 rounded-full" />, borderColor: 'border-slate-700 hover:border-slate-500', bgColor: 'bg-slate-800/20' },
        [TaskStatus.WORKING]: { icon: <SpinnerIcon className="w-4 h-4 text-[var(--accent)]" />, borderColor: 'border-[var(--accent)] animate-breath-glow', bgColor: 'bg-sky-900/20' },
        [TaskStatus.COMPLETED]: { icon: <CheckIcon className="w-4 h-4 text-emerald-400" />, borderColor: 'border-emerald-500/50', bgColor: 'bg-emerald-900/10' },
        [TaskStatus.ERROR]: { icon: <RetryIcon className="w-4 h-4 text-rose-400" />, borderColor: 'border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.3)]', bgColor: 'bg-rose-900/20' },
        [TaskStatus.BLOCKED]: { icon: <StopIcon className="w-4 h-4 text-slate-500" />, borderColor: 'border-slate-700/50', bgColor: 'bg-slate-900/20 opacity-60' },
    };

    const getAgentIcon = (agentId: string) => {
        if (agentId.includes('reader')) return <EyeIcon className="w-3 h-3"/>;
        if (agentId.includes('writer')) return <CodeIcon className="w-3 h-3" />;
        if (agentId.includes('reviewer')) return <WriterIcon className="w-3 h-3"/>;
        if (agentId.includes('devops')) return <VercelIcon className="w-3 h-3"/>;
        return <div className="w-2 h-2 rounded-full bg-current" />;
    }

    const agentColor = agent ? getAgentColor(agent).replace('bg-', 'text-') : 'text-slate-400';
    const currentConfig = statusConfig[status];

    return (
        <div 
            ref={nodeRef} 
            id={`task-node-${task.id}`}
            onClick={onClick}
            className={`
                relative w-full h-24 p-3 rounded-lg border transition-all duration-300 cursor-pointer
                flex flex-col justify-between
                ${isSelected ? 'border-[var(--accent)] scale-105 shadow-2xl z-20' : `z-10 ${currentConfig.borderColor}`}
                ${currentConfig.bgColor}
                ${justCompleted ? 'animate-pulse-green' : ''}
                backdrop-blur-sm
            `}
        >
            <style>{`.animate-pulse-green { animation: pulse-green 1s ease-out; } @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(4, 217, 127, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(4, 217, 127, 0); } 100% { box-shadow: 0 0 0 0 rgba(4, 217, 127, 0); } }`}</style>
            <p className="text-[13px] font-semibold text-slate-200 leading-snug pr-4 line-clamp-2 select-none">{task.description}</p>
            
            <div className="flex justify-between items-center mt-2">
                <div className={`flex items-center gap-2 text-xs font-bold ${agentColor}`}>
                    {getAgentIcon(task.agentId)}
                    <span className="uppercase tracking-wider text-[10px]">{agent?.name || task.agentId}</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center border border-white/5 shrink-0 shadow-sm">
                  {currentConfig.icon}
                </div>
            </div>
            {status === TaskStatus.WORKING && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]/30 overflow-hidden rounded-b-lg">
                    <div className="h-full bg-[var(--accent)] w-full absolute animate-[shimmer_2s_infinite]" style={{
                        background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                        backgroundSize: '200% 100%'
                    }}></div>
                </div>
            )}
        </div>
    );
};

const style = document.createElement('style');
style.innerHTML = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
document.head.appendChild(style);


export const MissionControlView: React.FC<MissionControlViewProps> = ({ objective, tasks, statuses, agents, onTaskSelect, selectedTaskId }) => {
    const [positions, setPositions] = useState<Record<string, {x: number, y: number, width: number, height: number}>>({});
    const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    const taskColumns = useMemo(() => {
        const columns: Task[][] = [];
        let remainingTasks = [...tasks];
        let level = 0;

        while(remainingTasks.length > 0) {
            const currentLevelTasks: Task[] = [];
            const nextRemainingTasks: Task[] = [];

            remainingTasks.forEach(task => {
                const dependenciesMet = task.depends_on.every(depId => 
                    !remainingTasks.some(rt => rt.id === depId)
                );
                if (dependenciesMet) {
                    currentLevelTasks.push(task);
                } else {
                    nextRemainingTasks.push(task);
                }
            });

            if (currentLevelTasks.length > 0) {
                columns[level] = currentLevelTasks;
                level++;
            } else if (nextRemainingTasks.length > 0) {
                columns[level] = nextRemainingTasks; // Fallback for circular
                break;
            }
            remainingTasks = nextRemainingTasks;
        }
        return columns;
    }, [tasks]);

    useEffect(() => {
        const updatePositions = () => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            
            const newPositions: typeof positions = {};
            
            Object.keys(nodeRefs.current).forEach(taskId => {
                const el = nodeRefs.current[taskId];
                if (el) {
                    const rect = el.getBoundingClientRect();
                    newPositions[taskId] = {
                        x: rect.left - containerRect.left,
                        y: rect.top - containerRect.top,
                        width: rect.width,
                        height: rect.height,
                    };
                }
            });
            
            // Check if positions actually changed to avoid loop
            setPositions(prev => {
                const isDifferent = Object.keys(newPositions).some(k => 
                    !prev[k] || 
                    prev[k].x !== newPositions[k].x || 
                    prev[k].y !== newPositions[k].y
                );
                return isDifferent ? newPositions : prev;
            });
        };

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(updatePositions);
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
            // Also observe children to detect layout shifts
             Array.from(containerRef.current.children).forEach(child => {
                resizeObserver.observe(child);
             });
        }
        
        // Initial calculation
        setTimeout(updatePositions, 100);

        return () => resizeObserver.disconnect();
    }, [tasks, taskColumns, selectedTaskId]);

    const getPath = (fromId: string, toId: string) => {
        const fromPos = positions[fromId];
        const toPos = positions[toId];
        if (!fromPos || !toPos) return '';

        const startX = fromPos.x + fromPos.width;
        const startY = fromPos.y + fromPos.height / 2;
        const endX = toPos.x;
        const endY = toPos.y + toPos.height / 2;
        
        const c1X = startX + (endX - startX) * 0.5;
        const c1Y = startY;
        const c2X = startX + (endX - startX) * 0.5;
        const c2Y = endY;

        return `M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`;
    };

    return (
        <div ref={containerRef} className="h-full w-full p-8 overflow-auto custom-scrollbar animate-fade-in relative flex flex-col">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5 pointer-events-none"></div>
            
            <div className="mb-8 relative z-20 shrink-0">
                <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest bg-[var(--surface-primary)] inline-block px-2 py-1 rounded">Missão Ativa</p>
                <h1 className="text-xl font-bold text-white mt-2 leading-tight max-w-2xl">{objective}</h1>
            </div>

            <div className="flex gap-16 items-start relative flex-1 min-w-max pb-10">
                {taskColumns.map((column, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-6 w-64 shrink-0 relative z-20">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 border-l-2 border-slate-700">Fase {colIndex + 1}</div>
                        {column.map((task) => (
                            <TaskNode
                                key={task.id}
                                task={task}
                                statusInfo={statuses.find(s => s.taskId === task.id)}
                                agent={agents.find(a => a.id === task.agentId)}
                                onClick={() => onTaskSelect(task.id === selectedTaskId ? null : task.id)}
                                isSelected={selectedTaskId === task.id}
                                nodeRef={el => nodeRefs.current[task.id] = el}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: 'rgba(4, 217, 127, 0.2)', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: 'rgba(4, 217, 127, 0.8)', stopOpacity: 1}} />
                    </linearGradient>
                    <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="rgba(4, 217, 127, 0.8)" />
                    </marker>
                </defs>
                {tasks.map(task => 
                    task.depends_on.map(depId => {
                        const depStatus = statuses.find(s => s.taskId === depId)?.status;
                        const isCompleted = depStatus === TaskStatus.COMPLETED;
                        return (
                            <path
                                key={`${depId}-${task.id}`}
                                d={getPath(depId, task.id)}
                                fill="none"
                                stroke={isCompleted ? 'url(#line-gradient)' : 'var(--border-color)'}
                                strokeWidth={isCompleted ? "2" : "1"}
                                strokeDasharray={isCompleted ? "none" : "4 4"}
                                className="transition-all duration-700 ease-in-out"
                                markerEnd={isCompleted ? "url(#arrowhead)" : ""}
                            />
                        )
                    })
                )}
            </svg>
        </div>
    );
};

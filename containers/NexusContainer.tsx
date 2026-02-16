
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MissionDetailPane } from '../components/AgentWorkflow';
import SettingsModal from '../components/SettingsModal';
import { RepoConnector } from '../components/RepoConnector';
import { FileExplorer } from '../components/FileExplorer';
import { DiffViewer } from '../components/DiffViewer';
import { ChatInput } from '../components/ChatInput';
import { MissionControlView } from '../components/MissionControlView';
import { MissionProgressBar } from '../components/MissionProgressBar';
import { ReviewAndCommitPanel } from '../components/ReviewAndCommitPanel';
import { getGitHubToken, getRepoTree, getFileContent, createTaskPlanner, executeCodeTask, createBranch, addCommitToBranch, createPullRequest } from '../services/githubService';
import { 
  Agent, Task, AgentStatusInfo, TaskStatus, 
  LogEntry, WorkflowStage,
  MarsConfig, User, ModelType, GitTreeItem, GeneratedFile, TaskOutput
} from '../types';
import { SettingsIcon, BrainIcon, CheckIcon, PlayIcon, GitPullRequestIcon, CodeIcon, StopIcon } from '../components/Icons';
import ApiConfig from '../components/ApiConfig';

const DEFAULT_CONFIG: MarsConfig = { githubTokenOverride: '', geminiApiKey: '', useLocalOverride: false, lastUpdate: 0 };
const MAX_REVISION_ITERATIONS = 3; // Aumentado para 3 para permitir mais correções

const NexusContainer: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [isConfigured, setIsConfigured] = useState(false);
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('unconnected');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState<MarsConfig>(DEFAULT_CONFIG);
  
  const [globalModel, setGlobalModel] = useState<ModelType>('gemini-3-pro-preview');

  const [repo, setRepo] = useState<{ owner: string; name: string } | null>(null);
  const [repoTree, setRepoTree] = useState<GitTreeItem[]>([]);
  const [activeFile, setActiveFile] = useState<{ path: string; content: string } | null>(null);
  const [initialObjective, setInitialObjective] = useState('');
  
  const [missionBranchName, setMissionBranchName] = useState('');
  const [lastPullRequestUrl, setLastPullRequestUrl] = useState('');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatusInfo[]>([]);
  const [taskOutputs, setTaskOutputs] = useState<Record<string, TaskOutput>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const [modifiedFiles, setModifiedFiles] = useState<GeneratedFile[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // --- CONFIG CHECK EFFECT ---
  useEffect(() => {
    try {
      const savedConfigRaw = localStorage.getItem('nexus_bridge_config');
      if (savedConfigRaw) {
        const savedConfig = JSON.parse(savedConfigRaw);
        if (savedConfig.githubTokenOverride && savedConfig.geminiApiKey) {
          setConfig(savedConfig);
          setIsConfigured(true);
        }
      }
    } catch (e) {
      console.error("Failed to load config from localStorage", e);
      setIsConfigured(false);
    }
  }, []);

  // --- CALLBACKS & HELPERS ---
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', details: Partial<Omit<LogEntry, 'id' | 'timestamp' | 'message' | 'type'>> = {}) => {
    setLogs(prev => [{ id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), message, type, ...details }, ...prev].slice(0, 200));
  }, []);
  
  const generateBranchName = (objective: string): string => {
      const sanitized = objective.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 50);
      return `nexus/feat/${sanitized}-${Math.random().toString(36).substring(2, 8)}`;
  };

  const stopMission = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
    setAgentStatuses(prev => prev.map(s => s.status === TaskStatus.WORKING || s.status === TaskStatus.PENDING ? { ...s, status: TaskStatus.CANCELLED } : s));
    setWorkflowStage('ready');
    addLog("Missão abortada pelo usuário.", "error");
  };

  const handleConnectRepo = async (url: string) => {
      const match = url.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
      if (!match) {
          addLog("URL do repositório GitHub inválida.", "error");
          return;
      }
      const [, owner, name] = match;
      
      setWorkflowStage('connecting');
      addLog(`Conectando a ${owner}/${name}...`, 'info');
      
      try {
          const token = getGitHubToken();
          if (!token) {
              addLog("GitHub Token ausente.", "error");
              setSettingsOpen(true);
              setWorkflowStage('unconnected');
              return;
          }

          const tree = await getRepoTree(owner, name);
          setRepo({ owner, name });
          setRepoTree(tree);
          setWorkflowStage('ready');
          addLog(`Conectado com sucesso. ${tree.length} arquivos indexados.`, "success");
      } catch (e: any) {
          addLog(`Falha ao conectar: ${e.message}`, "error");
          if (e.message.includes('401')) setSettingsOpen(true);
          setWorkflowStage('unconnected');
      }
  };

  const handleFileSelect = async (path: string) => {
      if (!repo) return;
      if (activeFile?.path === path) {
        setActiveFile(null);
        return;
      }
      try {
          const fileData = await getFileContent(repo.owner, repo.name, path);
          setActiveFile({ path, content: fileData.content });
      } catch (e: any) {
          addLog(`Erro ao ler arquivo: ${e.message}`, 'error');
      }
  };
  
  const handleStartMission = async (objective: string) => {
    if (!repo) return;
    setInitialObjective(objective);
    setWorkflowStage('planning');
    handleNewMission(false);
    
    abortControllerRef.current = new AbortController();

    try {
        let contextMessage = `Objective: ${objective}\n`;
        if (activeFile) {
            contextMessage += `Focus File: ${activeFile.path}\nContent:\n${activeFile.content}`;
        } else {
            const fileList = repoTree.map(item => `- ${item.path}`).join('\n');
            contextMessage += `Repository Structure:\n${fileList}`;
        }

        const plan = await createTaskPlanner(objective, contextMessage, globalModel, addLog);
        
        if (!plan.tasks?.length) throw new Error("Planejador não gerou tarefas.");

        setTasks(plan.tasks);
        setAgents(plan.agents);
        
        const branchName = generateBranchName(objective);
        await createBranch(repo.owner, repo.name, branchName, addLog);
        setMissionBranchName(branchName);

        setAgentStatuses(plan.tasks.map(t => ({ 
            taskId: t.id, 
            agentId: t.agentId, 
            description: t.description, 
            status: TaskStatus.PENDING, 
            complexity: 'Medium', 
            depends_on: t.depends_on, 
            iteration: 0,
            feedbackHistory: [] 
        })));
        setWorkflowStage('executing');
    } catch (e: any) {
        addLog(`Erro no planejamento: ${e.message}`, "error");
        setWorkflowStage('ready');
    }
  };

  const runTask = async (taskId: string) => {
    if (!repo || !missionBranchName) return;

    setAgentStatuses(prev => prev.map(s => s.taskId === taskId ? { ...s, status: TaskStatus.WORKING, startTime: Date.now() } : s));
    
    const status = agentStatuses.find(s => s.taskId === taskId)!;
    const task = tasks.find(t => t.id === taskId)!;
    const agent = agents.find(a => a.id === status.agentId)!;
    
    const agentLog = (msg: string, type: LogEntry['type'] = 'info', details: Partial<Omit<LogEntry, 'id' | 'timestamp' | 'message' | 'type'>> = {}) => addLog(msg, type, { ...details, agentId: agent.id });

    try {
        const context: Record<string, TaskOutput> = {};
        task.depends_on.forEach(depId => {
            if (taskOutputs[depId]) context[depId] = taskOutputs[depId];
        });

        // Pass Feedback History only if agent is revisiting the task
        const feedbackHistory = status.feedbackHistory || [];

        const { result, tokenUsage } = await executeCodeTask(
            task, 
            context, 
            agent, 
            repo, 
            globalModel, 
            agentLog, 
            (chunk) => {
                setAgentStatuses(prev => prev.map(s => s.taskId === taskId ? { ...s, streamingContent: (s.streamingContent || '') + chunk } : s));
            },
            feedbackHistory // Pass failure history
        );
        
        setTaskOutputs(prev => ({ ...prev, [taskId]: result }));

        setAgentStatuses(prev => prev.map(s => s.taskId === taskId ? { 
            ...s, 
            status: TaskStatus.COMPLETED,
            result,
            executionDetails: { modelUsed: globalModel, durationMs: Date.now() - (s.startTime || 0), timestamp: new Date().toISOString(), tokenUsage: tokenUsage! }
        } : s));

        if (agent.id.includes('reviewer') && result.review) {
            const writerTaskId = task.depends_on[0];
            const writerStatus = agentStatuses.find(s => s.taskId === writerTaskId);

            if (result.review.decision === 'APPROVED' && writerStatus) {
                agentLog(`Aprovado: ${writerStatus.description}`, 'success');
                // ... commit logic ...
                const writerOutput = taskOutputs[writerTaskId];
                if (writerOutput?.generatedFiles?.length) {
                    const commitMsg = `feat(${writerStatus.agentId}): ${writerStatus.description}`;
                    const { commitUrl } = await addCommitToBranch(repo.owner, repo.name, missionBranchName, writerOutput.generatedFiles, commitMsg, addLog);
                    agentLog(`Commit criado.`, "success", { commitUrl });
                    
                    // Update Active File View
                     const newModifiedFiles = writerOutput.generatedFiles.map(gf => ({ 
                        ...gf, 
                        originalContent: activeFile?.path === gf.filename ? activeFile.content : '' 
                    }));
                    setModifiedFiles(prev => [...prev, ...newModifiedFiles]);
                    if (newModifiedFiles.length > 0) setActiveFile({ path: newModifiedFiles[0].filename, content: newModifiedFiles[0].originalContent || '' });
                }

            } else if (writerStatus) { // NEEDS_REVISION
                if ((writerStatus.iteration || 0) >= MAX_REVISION_ITERATIONS) {
                    agentLog(`Falha Crítica: Limite de ${MAX_REVISION_ITERATIONS} revisões atingido.`, "error");
                    setAgentStatuses(prev => prev.map(s => (s.taskId === taskId || s.taskId === writerTaskId) ? { ...s, status: TaskStatus.ERROR } : s));
                } else {
                    agentLog(`Rejeitado pelo Revisor: ${result.review.feedback}`, "error");
                    
                    // Reset Both Writer AND Reviewer
                    setAgentStatuses(prev => prev.map(s => {
                        if (s.taskId === writerTaskId) {
                            // Append new feedback to history
                            const newHistory = [...(s.feedbackHistory || []), result.review!.feedback];
                            return { 
                                ...s, 
                                status: TaskStatus.PENDING, 
                                iteration: (s.iteration || 0) + 1, 
                                streamingContent: '',
                                feedbackHistory: newHistory // Store critical feedback
                            };
                        }
                        if (s.taskId === taskId) {
                            return { ...s, status: TaskStatus.PENDING, streamingContent: '' }; 
                        }
                        return s;
                    }));
                }
            }
        }
    } catch (e: any) {
      agentLog(`Erro fatal: ${e.message}`, "error");
      const downstreamIds = tasks.filter(t => t.depends_on.includes(taskId)).map(t => t.id);
      setAgentStatuses(prev => prev.map(s => {
          if (s.taskId === taskId) return { ...s, status: TaskStatus.ERROR };
          if (downstreamIds.includes(s.taskId)) return { ...s, status: TaskStatus.BLOCKED };
          return s;
      }));
    }
  };

  const handleCreatePullRequest = async (details: { title: string; body: string }) => {
    if (!repo || !missionBranchName) return;
    setWorkflowStage('committing');
    try {
      const { prUrl } = await createPullRequest(repo.owner, repo.name, details.title, details.body, missionBranchName, addLog);
      setLastPullRequestUrl(prUrl);
      setWorkflowStage('finished');
    } catch (e: any) {
      addLog(`Falha no PR: ${e.message}`, "error");
      setWorkflowStage('reviewing');
    }
  };

  const handleNewMission = (log: boolean = true) => {
    if (log) setWorkflowStage('ready');
    setModifiedFiles([]);
    setTasks([]);
    setAgents([]);
    setAgentStatuses([]);
    setTaskOutputs({});
    setInitialObjective('');
    setLastPullRequestUrl('');
    setMissionBranchName('');
    setSelectedTaskId(null);
    if (log) addLog("Sistema reiniciado.", "info");
  };

  // Workflow orchestration loop
  useEffect(() => {
    if (workflowStage !== 'executing') return;

    const allFinished = agentStatuses.length > 0 && agentStatuses.every(s => 
      ['COMPLETED', 'ERROR', 'BLOCKED', 'CANCELLED'].includes(s.status)
    );

    if (allFinished) {
        if (agentStatuses.some(s => s.status === TaskStatus.CANCELLED)) {
             // Aborted
        } else if (agentStatuses.some(s => s.status === TaskStatus.ERROR)) {
             addLog("Missão falhou com erros.", "error");
             setWorkflowStage('reviewing');
        } else {
             addLog("Execução concluída com sucesso.", "success");
             setWorkflowStage('reviewing');
        }
        return;
    }

    // Find runable tasks
    const pending = agentStatuses.filter(s => s.status === TaskStatus.PENDING);
    pending.forEach(status => {
        const deps = status.depends_on;
        const allDepsCompleted = deps.every(dId => 
            agentStatuses.find(s => s.taskId === dId)?.status === TaskStatus.COMPLETED
        );
        
        if (allDepsCompleted) {
             runTask(status.taskId);
        }
    });
  }, [agentStatuses, workflowStage]);


  if (!isConfigured) return <ApiConfig onConfigured={() => setIsConfigured(true)} onSaveConfig={(newConfig) => { setConfig(newConfig); localStorage.setItem('nexus_bridge_config', JSON.stringify(newConfig)); }} />;
  if (workflowStage === 'unconnected' || workflowStage === 'connecting') return <RepoConnector onConnect={handleConnectRepo} isLoading={workflowStage === 'connecting'} />;

  const modifiedFile = modifiedFiles.find(mf => mf.filename === activeFile?.path);
  const isExecuting = workflowStage === 'planning' || workflowStage === 'executing';

  return (
    <div className="flex h-screen w-full bg-[var(--background)] text-[var(--text-primary)] font-sans p-2 gap-2">
        <aside className="w-64 flex flex-col glass-panel rounded-lg shrink-0">
            <div className="h-14 flex items-center px-4">
                 <BrainIcon className="w-6 h-6 text-[var(--accent)] mr-2" />
                <h2 className="text-sm font-bold truncate text-slate-200">{repo?.owner}/{repo?.name}</h2>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent"></div>
            <FileExplorer tree={repoTree} onFileSelect={handleFileSelect} activeFile={activeFile?.path} />
        </aside>

        <main className="flex-1 flex flex-col gap-2 relative overflow-hidden">
             <header className="h-14 flex items-center justify-between px-6 glass-panel rounded-lg shrink-0">
                <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-secondary)]">
                    <CodeIcon className="w-4 h-4 text-[var(--accent)]" />
                    <span>Foco:</span>
                    <span className="text-white font-bold">{activeFile?.path || "Workspace Root"}</span>
                </div>
                 <div className="flex items-center gap-4">
                     {isExecuting && (
                         <button onClick={stopMission} className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded hover:bg-rose-500/40 transition-all text-xs font-bold uppercase tracking-wider">
                             <StopIcon className="w-3 h-3" /> Abortar
                         </button>
                     )}
                     <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                       <SettingsIcon className="h-5 w-5" />
                     </button>
                 </div>
            </header>

            <div className="flex-1 flex gap-2 relative overflow-hidden">
              <div className="flex-1 flex flex-col relative overflow-hidden glass-panel rounded-lg">
                {isExecuting && <MissionProgressBar statuses={agentStatuses} />}

                {workflowStage === 'ready' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
                        <BrainIcon className="w-16 h-16 text-[var(--accent)] [filter:drop-shadow(0_0_15px_var(--accent-glow))]" />
                        <h2 className="text-xl font-bold text-white mt-4">Nexus Codex Engine</h2>
                        <p className="mt-2 text-sm max-w-md text-[var(--text-secondary)]">
                          Pronto para operar em {activeFile ? activeFile.path : 'modo global'}.
                          Descreva a tarefa de engenharia.
                        </p>
                    </div>
                )}
                {isExecuting && (
                    <MissionControlView 
                        objective={initialObjective} 
                        tasks={tasks} 
                        statuses={agentStatuses} 
                        agents={agents}
                        onTaskSelect={setSelectedTaskId}
                        selectedTaskId={selectedTaskId}
                    />
                )}
                 {(workflowStage === 'reviewing' || workflowStage === 'finished') && activeFile && modifiedFile && (
                    <DiffViewer oldContent={modifiedFile.originalContent || ''} newContent={modifiedFile.content} />
                 )}
              </div>
              
              {isExecuting && (
                <MissionDetailPane
                    tasks={tasks}
                    statuses={agentStatuses}
                    selectedTaskId={selectedTaskId}
                    onRetryTask={runTask}
                    allAgents={agents}
                    logs={logs}
                />
              )}
            </div>

            <div className="shrink-0">
                {workflowStage === 'ready' && <ChatInput onSendMessage={handleStartMission} stage={workflowStage}/>}
                {workflowStage === 'reviewing' && <ReviewAndCommitPanel objective={initialObjective} completedTasks={agentStatuses.filter(s => s.status === 'COMPLETED')} model={globalModel} onCreatePullRequest={handleCreatePullRequest} />}
                {workflowStage === 'committing' && <div className="p-4 text-center text-xs text-amber-400 glass-panel rounded-lg">Sincronizando com GitHub...</div>}
                {workflowStage === 'finished' && (
                    <div className="p-4 glass-panel rounded-lg bg-emerald-900/50 flex items-center justify-between">
                        <div className="text-left">
                            <div className="flex items-center gap-2 text-emerald-300">
                              <CheckIcon className="w-5 h-5" />
                              <span className="text-sm font-bold">Operação Concluída</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Branch: <code className="bg-black/30 px-1.5 py-0.5 rounded text-emerald-300 font-mono">{missionBranchName}</code></p>
                        </div>
                        <div className="flex items-center gap-3">
                             <a href={lastPullRequestUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-md transition-all shadow-lg shadow-purple-500/30">
                                <GitPullRequestIcon className="w-4 h-4" />
                                Ver Pull Request
                            </a>
                            <button onClick={() => handleNewMission(true)} className="flex items-center gap-2 px-4 py-1.5 bg-[var(--accent)] hover:opacity-90 text-black text-xs font-bold rounded-md transition-all shadow-lg shadow-[var(--accent-glow)]">
                                <PlayIcon className="w-4 h-4" />
                                Nova Operação
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
        <SettingsModal config={config} isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onSave={(c) => { setConfig(c); localStorage.setItem('nexus_bridge_config', JSON.stringify(c)); }} />
    </div>
  );
};

export default NexusContainer;

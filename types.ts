
// FIX: Added ChatSession type for Sidebar component
export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: any[];
}

// FIX: Added CacheEntry type for cacheService
export interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export type ModelType = 'gemini-3-pro-preview' | 'gemini-3-flash-preview';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface MarsConfig {
  githubTokenOverride: string;
  geminiApiKey: string;
  useLocalOverride: boolean;
  lastUpdate: number;
}

export interface FileObject {
  name:string;
  type: string;
  content: string; 
}

export type VisualTag = 'CODE' | 'ART' | 'DATA' | 'PLAN' | 'WRITER' | 'FINANCE' | 'MEDICAL' | 'SHIELD' | 'PROMPT' | 'ENGRAM' | 'ARCHITECT';

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  visualTag?: VisualTag;
  systemPrompt?: string;
  isCoder?: boolean;
  tools?: string[];
  skills?: string[];
}

export interface Task {
  id:string;
  description: string;
  agentId: string;
  depends_on: string[];
  expectedOutput: string;
  complexity: 'Low' | 'Medium' | 'High';
  recommendedModel?: string;
}

// Representa um arquivo modificado ou criado pela IA
export interface GeneratedFile {
  filename: string;
  content: string;
  originalContent?: string; // Conteúdo original para diffing
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GithubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  url: string;
}

export interface SearchResult {
  path: string;
  match: string;
  url: string;
}

export interface TaskOutput {
  type: 'text' | 'file' | 'search' | 'issue';
  content: string;
  generatedFiles?: GeneratedFile[];
  searchResults?: SearchResult[];
  issueDetails?: GithubIssue;
  review?: {
    decision: 'APPROVED' | 'NEEDS_REVISION';
    feedback: string;
    severity: 'low' | 'medium' | 'critical';
  };
  grounding?: GroundingSource[];
  // NEW: Reasoning trace from Thinking models
  reasoning?: string;
}

export interface TokenUsage {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
}

export type ExpertProfileType = 'UNIVERSAL';

export interface PlannerResponse {
  tasks: Task[];
  agents: Agent[];
}

export interface AgentCritique {
  agentId: string;
  agentName: string;
  critique: string;
  suggestion: string;
  sentiment: 'positive' | 'neutral' | 'critical';
}

export enum TaskStatus {
  PENDING = 'PENDING',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED' // NEW STATUS
}

export interface AgentStatusInfo {
  taskId: string;
  agentId: string;
  description: string;
  status: TaskStatus;
  startTime?: number;
  complexity: 'Low' | 'Medium' | 'High';
  depends_on: string[];
  streamingContent?: string;
  result?: TaskOutput;
  executionDetails?: {
    modelUsed: string;
    durationMs: number;
    timestamp: string;
    tokenUsage: TokenUsage;
    configUsed?: any;
  };
  isSwarm?: boolean;
  dueDate?: string;
  iteration?: number;
  feedbackHistory?: string[]; // NEW: Keeps track of previous failure reasons
}

export interface ModelDefinition {
  id: ModelType;
  name: string;
  series: string;
  desc: string;
  type?: string;
  inputPricePer1M?: number;
  outputPricePer1M?: number;
  contextWindow?: number;
}

export const AVAILABLE_MODELS: ModelDefinition[] = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.5 Flash', series: 'Google', desc: 'Rápido e eficiente para tarefas complexas.', contextWindow: 1048576, type: 'Proprietary' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.5 Pro', series: 'Google', desc: 'Modelo de ponta para máxima performance.', contextWindow: 1048576, type: 'Proprietary' },
];

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'security' | 'api';
  agentId?: string;
  commitUrl?: string;
  pullRequestUrl?: string;
  branchName?: string;
  details?: any;
}

export type WorkflowStage = 'unconnected' | 'connecting' | 'ready' | 'planning' | 'executing' | 'reviewing' | 'committing' | 'finished';

export interface PlanningSession {
  stage: 'drafting' | 'critiquing' | 'refining' | 'finalized';
  draftPlan: PlannerResponse;
  critiques: AgentCritique[];
  finalPlan?: PlannerResponse;
}

export interface GitTreeItem {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  url: string;
}

export interface DiffChange {
  type: 'added' | 'removed' | 'same';
  line: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

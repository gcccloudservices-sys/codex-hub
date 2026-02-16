
import { Agent, Task, TaskOutput, TokenUsage, PlannerResponse, GeneratedFile, GitTreeItem, ModelType, AgentStatusInfo, GroundingSource, SearchResult, GithubIssue } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

type LogCallback = (message: string, type?: 'info' | 'success' | 'error' | 'security' | 'api') => void;

const getConfig = () => {
    try {
        const savedConfig = localStorage.getItem('nexus_bridge_config');
        if (savedConfig) return JSON.parse(savedConfig);
    } catch (e) {}
    return null;
};

// --- KEY MANAGEMENT ---
export const getGitHubToken = (): string => {
    const config = getConfig();
    if (config?.useLocalOverride && config.githubTokenOverride) {
        return config.githubTokenOverride;
    }
    return process.env.API_KEY || ''; 
};

export const getGeminiApiKey = (): string => {
    const config = getConfig();
    if (config?.useLocalOverride && config.geminiApiKey) {
        return config.geminiApiKey;
    }
    return process.env.API_KEY || '';
};


// --- GITHUB REST API INTERACTIONS ---
const GITHUB_API_BASE = 'https://api.github.com';

const callGitHubApi = async (endpoint: string, method: 'GET' | 'POST' | 'PATCH' = 'GET', body: any = null) => {
    const token = getGitHubToken();
    if (!token) throw new Error("Token de Autenticação (PAT) do GitHub não configurado.");

    const options: RequestInit = {
        method,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "Nexus-Codex-Engine"
        }
    };

    if (body) {
        (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, options);

    if (!response.ok) {
        let errorMessage = `Erro na API do GitHub (${response.status}): ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMessage += ` - ${errorBody.message || ''}`;
        } catch(e) { /* ignore if no json body */ }
        
        if (response.status === 404) errorMessage = "Recurso não encontrado (404).";
        if (response.status === 401) errorMessage = "Acesso negado (401). Verifique seu Token.";
        if (response.status === 422) errorMessage = "Erro de validação (422). Verifique os parâmetros.";
        
        throw new Error(errorMessage);
    }

    if (response.status === 204) return null;
    return response.json();
};

export const getRepoTree = async (owner: string, repo: string): Promise<GitTreeItem[]> => {
    const mainBranch = await callGitHubApi(`/repos/${owner}/${repo}`);
    const defaultBranch = mainBranch.default_branch;
    const treeData = await callGitHubApi(`/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
    return treeData.tree.filter((item: GitTreeItem) => item.type === 'blob');
};

export const getFileContent = async (owner: string, repo: string, path: string): Promise<{ content: string, sha: string }> => {
    const data = await callGitHubApi(`/repos/${owner}/${repo}/contents/${path}`);
    if (data.encoding !== 'base64') throw new Error(`Encoding inesperado: ${data.encoding}`);
    return { content: atob(data.content), sha: data.sha };
};

// --- NEW CAPABILITIES: SEARCH & ISSUES ---

export const searchCode = async (owner: string, repo: string, query: string): Promise<SearchResult[]> => {
    // GitHub API requires 'q' parameter formatted as: 'query+repo:owner/repo'
    const q = `${query}+repo:${owner}/${repo}`;
    const data = await callGitHubApi(`/search/code?q=${encodeURIComponent(q)}&per_page=5`);
    return data.items.map((item: any) => ({
        path: item.path,
        url: item.html_url,
        match: item.name
    }));
};

export const getRepoIssues = async (owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GithubIssue[]> => {
    const data = await callGitHubApi(`/repos/${owner}/${repo}/issues?state=${state}&per_page=10`);
    return data.map((item: any) => ({
        number: item.number,
        title: item.title,
        body: item.body,
        state: item.state,
        url: item.html_url
    }));
};

export const getIssueDetails = async (owner: string, repo: string, issueNumber: number): Promise<GithubIssue> => {
    const item = await callGitHubApi(`/repos/${owner}/${repo}/issues/${issueNumber}`);
    return {
        number: item.number,
        title: item.title,
        body: item.body,
        state: item.state,
        url: item.html_url
    };
};

// --- GITHUB WRITE OPERATIONS ---

export const createBranch = async (owner: string, repo: string, branchName: string, onLog: LogCallback): Promise<string> => {
    onLog(`Preparando branch '${branchName}'...`, 'api');
    const repoData = await callGitHubApi(`/repos/${owner}/${repo}`);
    const refData = await callGitHubApi(`/repos/${owner}/${repo}/git/ref/heads/${repoData.default_branch}`);
    const parentSha = refData.object.sha;
    
    await callGitHubApi(`/repos/${owner}/${repo}/git/refs`, 'POST', { ref: `refs/heads/${branchName}`, sha: parentSha });
    onLog(`Branch '${branchName}' criada.`, 'success');
    return parentSha;
};

export const addCommitToBranch = async (
    owner: string,
    repo: string,
    branchName: string,
    files: GeneratedFile[],
    commitMessage: string,
    onLog: LogCallback
): Promise<{ commitUrl: string, newSha: string }> => {
    onLog(`Commitando ${files.length} arquivos em '${branchName}'...`, 'api');
    
    const refData = await callGitHubApi(`/repos/${owner}/${repo}/git/ref/heads/${branchName}`);
    const parentSha = refData.object.sha;

    const fileBlobs = await Promise.all(files.map(async file => {
        const blobData = await callGitHubApi(`/repos/${owner}/${repo}/git/blobs`, 'POST', { content: file.content, encoding: 'utf-8' });
        return { path: file.filename, mode: '100644', type: 'blob', sha: blobData.sha };
    }));

    const treeData = await callGitHubApi(`/repos/${owner}/${repo}/git/trees`, 'POST', { base_tree: parentSha, tree: fileBlobs });
    const commitData = await callGitHubApi(`/repos/${owner}/${repo}/git/commits`, 'POST', { message: commitMessage, parents: [parentSha], tree: treeData.sha });
    
    await callGitHubApi(`/repos/${owner}/${repo}/git/refs/heads/${branchName}`, 'PATCH', { sha: commitData.sha, force: false });
    
    return { commitUrl: commitData.html_url, newSha: commitData.sha };
};

export const createPullRequest = async (owner: string, repo: string, title: string, body: string, headBranch: string, onLog: LogCallback) => {
    onLog(`Criando PR: ${title}...`, 'api');
    const repoData = await callGitHubApi(`/repos/${owner}/${repo}`);
    const prData = await callGitHubApi(`/repos/${owner}/${repo}/pulls`, 'POST', { title, body, head: headBranch, base: repoData.default_branch });
    onLog(`PR #${prData.number} criado com sucesso.`, 'success');
    return { prUrl: prData.html_url, prNumber: prData.number };
};

// --- GEMINI CORE ---

const executeGeminiInference = async (prompt: string, model: ModelType, config: any = {}) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error("API Key do Gemini não configurada.");
    
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: config,
        });

        const tokenUsage: TokenUsage = {
            promptTokens: response.usageMetadata?.promptTokenCount || 0,
            candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata?.totalTokenCount || 0,
        };
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const groundingSources: GroundingSource[] = groundingChunks
            .filter((c: any) => c.web?.uri && c.web?.title)
            .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

        return { text: response.text, tokenUsage, groundingSources };
    } catch (error: any) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
};

// --- AGENT LOGIC ---

export const createTaskPlanner = async (objective: string, contextMessage: string, model: ModelType, onLog: LogCallback): Promise<PlannerResponse> => {
    const prompt = `
<objective>${objective}</objective>
<context>${contextMessage}</context>
<instructions>
You are the Lead System Architect using the Nexus Codex Engine.
Decompose the objective into atomic, actionable engineering tasks.

**AGENTS & CAPABILITIES:**
- 'code-reader': Fetches file contents.
- 'code-researcher': Greps the codebase or searches the web.
- 'issue-analyst': Reads GitHub Issues.
- 'code-writer': Implements code changes.
- 'code-reviewer': **MANDATORY** after every 'code-writer' task. Validates logic/security.
- 'devops-engineer': **USE VERCEL CLI**. Handles system functions, deployments, build configuration (vercel.json, package.json), and environment setup.

**VALIDATION WORKFLOW:**
1. Plan MUST include a 'code-reviewer' task for every 'code-writer' task.
2. The reviewer task must depend on the writer task.
3. If the user asks to "deploy", "build", or "configure system", use 'devops-engineer'.

**Output**: Return STRICT JSON.
</instructions>`;
    
    const plannerSchema = {
      type: Type.OBJECT,
      properties: {
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              description: { type: Type.STRING },
              agentId: { type: Type.STRING },
              depends_on: { type: Type.ARRAY, items: { type: Type.STRING } },
              expectedOutput: { type: Type.STRING },
            },
            required: ["id", "description", "agentId", "depends_on", "expectedOutput"]
          }
        },
        agents: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["id", "name", "description", "category"]
          }
        }
      },
      required: ["tasks", "agents"]
    };

    onLog(`[PLANNER] Desenhando arquitetura da solução com ${model} (Thinking Mode)...`, 'api');
    const { text } = await executeGeminiInference(prompt, 'gemini-3-pro-preview', {
        responseMimeType: "application/json",
        responseSchema: plannerSchema,
        thinkingConfig: { thinkingBudget: 2048 },
        maxOutputTokens: 8192
    });
    
    return JSON.parse(text || '{}') as PlannerResponse;
};

const extractFilesFromContent = (content: string): GeneratedFile[] => {
    const files: GeneratedFile[] = [];
    const codeBlockRegex = /```(?:\w+)?\s*(?:Path:\s*)?([^\n\r]+)[\n\r]([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        let path = match[1].trim();
        path = path.replace(/^['"]|['"]$/g, '');
        const fileContent = match[2].trim();
        files.push({ filename: path, content: fileContent });
    }
    return files;
};

// Helper for Vercel CLI Simulation
const simulateVercelCli = async (command: string, onStream: (chunk: string) => void): Promise<string> => {
    const steps = [
        `Vercel CLI 32.5.0\n`,
        `> Running ${command} in ${process.env.NODE_ENV || 'development'} mode...\n`,
        `> Linking to project...\n`,
        `> Linked to project successfully.\n`,
        `> Inspecting application...\n`,
        `> Building...\n`,
        `[1/4]  Running build command...\n`,
        `[2/4]  Generating static pages (0/15)...\n`,
        `[3/4]  Optimizing images...\n`,
        `[4/4]  Build Completed. Output: .vercel/output\n`,
        `> Deploying...\n`,
        `> Deployment complete!\n`,
        `> Production: https://nexus-codex-engine.vercel.app [900ms]\n`,
        `> Preview: https://nexus-codex-engine-git-feat.vercel.app [900ms]\n`
    ];

    let output = "";
    for (const step of steps) {
        await new Promise(r => setTimeout(r, 600)); // Simulate delay
        output += step;
        onStream(output);
    }
    return output;
}

export const executeCodeTask = async (
    task: Task, 
    context: { [key: string]: TaskOutput },
    agent: Agent,
    repo: { owner: string, name: string },
    model: ModelType,
    onLog: LogCallback,
    onStream: (chunk: string) => void,
    feedbackHistory: string[] = [] // NEW: Pass history of failures
): Promise<{ result: TaskOutput, tokenUsage?: TokenUsage }> => {
    
    // --- TOOL HANDLING (Search, Issues, Read) REMAINS SAME ---
    if (agent.id.includes('research') || task.description.toLowerCase().includes('search')) {
        const queryMatch = task.description.match(/Search(?: for)?\s*['"]?([^'"]+)['"]?/i);
        const query = queryMatch ? queryMatch[1] : task.description.split(' ').slice(-1)[0]; 
        
        onLog(`[${agent.name}] Pesquisando código por: "${query}"`, 'api');
        try {
            const searchResults = await searchCode(repo.owner, repo.name, query);
            const content = `Found ${searchResults.length} occurrences for "${query}":\n` + 
                            searchResults.map(r => `- [${r.path}](${r.url})`).join('\n');
            onStream(content);
            return { 
                result: { type: 'search', content, searchResults },
                tokenUsage: { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 } 
            };
        } catch (e: any) {
            onLog(`[${agent.name}] Falha na pesquisa: ${e.message}`, 'error');
            return { result: { type: 'text', content: `Search failed: ${e.message}` } };
        }
    }

    if (agent.id.includes('issue') || task.description.toLowerCase().includes('issue')) {
        const issueMatch = task.description.match(/Issue\s*#?(\d+)/i);
        if (issueMatch) {
            const issueNum = parseInt(issueMatch[1]);
            onLog(`[${agent.name}] Lendo Issue #${issueNum}...`, 'api');
            try {
                const issue = await getIssueDetails(repo.owner, repo.name, issueNum);
                const content = `### Issue #${issue.number}: ${issue.title}\n\n${issue.body}`;
                onStream(content);
                return { 
                    result: { type: 'issue', content, issueDetails: issue },
                    tokenUsage: { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
                };
            } catch (e: any) {
                onLog(`[${agent.name}] Issue não encontrada: ${e.message}`, 'error');
                 return { result: { type: 'text', content: `Failed to fetch Issue #${issueNum}.` } };
            }
        }
    }

    if (agent.id.includes('reader')) {
        const match = task.description.match(/Read(?: the content of)?\s*`?([\w\d./-]+)`?/i);
        if (match) {
            const path = match[1];
            onLog(`[${agent.name}] Lendo arquivo: ${path}`, 'info');
            try {
                const data = await getFileContent(repo.owner, repo.name, path);
                onStream(data.content);
                return { result: { type: 'file', content: data.content } };
            } catch (e: any) {
                onLog(`[${agent.name}] Arquivo não encontrado (404). Pode ser um novo arquivo.`, 'error');
                return { result: { type: 'text', content: "File does not exist yet (404)." } };
            }
        }
    }

    // --- DEVOPS / VERCEL CLI HANDLING ---
    if (agent.id.includes('devops')) {
        onLog(`[${agent.name}] Inicializando System Ops...`, 'api');
        
        // If it's a deployment or build task, simulate CLI output
        if (task.description.toLowerCase().includes('deploy') || task.description.toLowerCase().includes('build')) {
            const output = await simulateVercelCli('deploy --prod', onStream);
            return {
                result: { type: 'text', content: output },
                tokenUsage: { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
            };
        }
        
        // If it's configuration (vercel.json, package.json), treat as writer but specialized
        // Proceed to Writer logic below but with DevOps context
    }

    // --- ENHANCED WRITER/REVIEWER LOGIC ---

    const contextStr = Object.entries(context).map(([id, out]) => {
        let contentDisplay = out.content;
        if (contentDisplay.length > 8000) contentDisplay = contentDisplay.substring(0, 8000) + "\n...(truncated)";
        return `<task_result id="${id}" type="${out.type}">\n${contentDisplay}\n</task_result>`;
    }).join('\n');

    let systemInstruction = `You are ${agent.name}, a Principal Software Engineer at Google.
    Traits: Precision, Security-First, Modern Patterns.
    Constraint: NEVER leave placeholders. Implement FULLY.
    Constraint: Follow the task description strictly.`;

    let prompt = `
<task_description>
${task.description}
</task_description>

<expected_output>
${task.expectedOutput}
</expected_output>

<context_data>
${contextStr}
</context_data>
`;

    if (agent.id.includes('writer') || agent.id.includes('devops')) {
        prompt += `
<writer_rules>
1. Output FULL content for files in Markdown blocks:
   \`\`\`typescript
   Path: src/main.ts
   ...
   \`\`\`
2. Check imports against the Context Data provided.
3. If DevOps/System: Focus on configuration files (vercel.json, next.config.js, package.json).
</writer_rules>`;

        // INJECT HISTORY IF REVISION
        if (feedbackHistory.length > 0) {
            prompt += `
<CRITICAL_REVISION_HISTORY>
The previous attempts failed quality assurance.
BELOW IS THE FAILURE LOG. YOU MUST FIX THESE SPECIFIC ISSUES:
${feedbackHistory.map((msg, i) => `Attempt ${i+1}: ${msg}`).join('\n')}

INSTRUCTIONS FOR THIS RUN:
- Analyze WHY the previous code failed the review.
- Implement the requested fixes precisely.
- Do NOT repeat the same mistake.
</CRITICAL_REVISION_HISTORY>`;
        }
    }

    const config: any = { systemInstruction };
    
    if (agent.id.includes('reviewer')) {
        prompt += `
<reviewer_instructions>
Act as a CI/CD Pipeline and Senior Security Auditor.
Step-by-Step Verification:
1. **Compilation Check**: Do imports exist in context? Are types correct?
2. **Logic Check**: Does it fulfill the Objective?
3. **Security Check**: Are there hardcoded secrets or injection flaws?
4. **Style**: Is code complete (no placeholders)?

Output JSON: { "decision": "APPROVED"|"NEEDS_REVISION", "feedback": "Detailed tech report", "severity": "low"|"medium"|"critical" }
</reviewer_instructions>`;
        config.responseMimeType = "application/json";
        config.responseSchema = {
            type: Type.OBJECT,
            properties: {
                decision: { type: Type.STRING, enum: ["APPROVED", "NEEDS_REVISION"] },
                feedback: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["low", "medium", "critical"] }
            }
        };
        config.thinkingConfig = { thinkingBudget: 4096 }; 
    } else if (agent.id.includes('writer') || agent.id.includes('devops')) {
        config.thinkingConfig = { thinkingBudget: 4096 }; // Increased budget for writers to self-reflect
    }

    const { text, tokenUsage, groundingSources } = await executeGeminiInference(prompt, model, config);
    onStream(text || '');

    let review;
    if (agent.id.includes('reviewer')) {
        try { review = JSON.parse(text || '{}'); } catch(e) { /* ignore invalid json */ }
    }

    return {
        result: { 
            type: 'text', 
            content: text || '', 
            generatedFiles: (agent.id.includes('writer') || agent.id.includes('devops')) ? extractFilesFromContent(text || '') : [],
            review,
            grounding: groundingSources 
        },
        tokenUsage
    };
};

export const generatePullRequestDetails = async (objective: string, completedTasks: AgentStatusInfo[], model: ModelType) => {
    const summary = completedTasks.map(t => `- [${t.agentId}] ${t.description}`).join('\n');
    const prompt = `
<role>Engineering Manager</role>
<task>Generate PR Metadata for: ${objective}</task>
<execution_log>${summary}</execution_log>
<instructions>Use Conventional Commits. Title should be punchy. Body should be professional Markdown.</instructions>`;
    
    const { text } = await executeGeminiInference(prompt, model, {
        responseMimeType: "application/json",
        responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, body: { type: Type.STRING } } }
    });
    return JSON.parse(text || '{}');
};

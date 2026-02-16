
import { Agent } from '../types';

/** 
 * Mapeamento Semântico de Cores por Categoria/Função.
 * Define a identidade visual de cada perfil de especialista.
 */
const categoryColorMap: Record<string, string> = {
    // Cores para a nova arquitetura
    'File System': 'bg-sky-500',      // Leitura/Escrita de arquivos
    'Development': 'bg-emerald-500',  // Geração de código
    'Code Quality': 'bg-amber-500',   // Revisão e crítica
    'DevOps & CLI': 'bg-neutral-100', // Vercel/System Ops (White/Black)
    
    // Cores Legadas (mantidas como fallback)
    'Planejamento': 'bg-violet-500',
    'Escrita & Conteúdo': 'bg-pink-500',
    'Ciência de Dados': 'bg-teal-500',
    'Segurança da Informação': 'bg-red-600',
    'Web Tools': 'bg-cyan-500',
    'DevOps & Infra': 'bg-slate-600',
    'Swarm Intelligence': 'bg-indigo-500',
};

// Fallback colors se a categoria não for encontrada
const fallbackColors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
    'bg-yellow-500', 'bg-red-500', 'bg-cyan-500'
];

/**
 * Retorna a classe de cor baseada no perfil do agente.
 * Se passar o objeto Agent, usa a categoria para definir a cor (Semântico).
 * Se passar apenas ID (string), usa hash (Fallback).
 * 
 * @param identifier - Objeto Agent completo OU string ID.
 * @returns {string} Classe Tailwind bg-color.
 */
export const getAgentColor = (identifier: Agent | string | undefined | null): string => {
    if (!identifier) return 'bg-slate-500';

    // 1. Tenta mapear pela Categoria se for um objeto Agent
    if (typeof identifier !== 'string' && 'category' in identifier) {
        const cat = identifier.category;
        // Busca direta
        if (categoryColorMap[cat]) return categoryColorMap[cat];
        
        // Busca parcial (ex: "Engenharia de Software" -> "Engenharia")
        const partialKey = Object.keys(categoryColorMap).find(key => cat.includes(key));
        if (partialKey) return categoryColorMap[partialKey];
    }

    // 2. Fallback: Hash baseado no ID (string) ou ID do agente
    const idStr = typeof identifier === 'string' ? identifier : identifier.id;
    
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        const char = idStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    const index = Math.abs(hash) % fallbackColors.length;
    return fallbackColors[index];
};

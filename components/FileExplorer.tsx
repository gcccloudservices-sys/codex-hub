
import React, { useState } from 'react';
import { GitTreeItem } from '../types';
import { FolderIcon, FileIcon, ChevronDownIcon, CodeIcon, DatabaseIcon, ArtIcon, SettingsIcon } from './Icons';

interface FileExplorerProps {
  tree: GitTreeItem[];
  onFileSelect: (path: string) => void;
  activeFile: string | null;
}

interface TreeNode {
  name: string;
  path: string;
  children?: { [key: string]: TreeNode };
  type: 'tree' | 'blob';
}

// Utilitário para ícones inteligentes
const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch(ext) {
        case 'ts':
        case 'tsx':
        case 'js':
        case 'jsx':
        case 'py':
        case 'rs':
        case 'go':
            return <CodeIcon className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" />;
        case 'json':
        case 'yaml':
        case 'yml':
        case 'sql':
            return <DatabaseIcon className="w-3.5 h-3.5 mr-2 text-amber-400 shrink-0" />;
        case 'css':
        case 'scss':
        case 'html':
            return <ArtIcon className="w-3.5 h-3.5 mr-2 text-pink-400 shrink-0" />;
        case 'png':
        case 'jpg':
        case 'svg':
        case 'ico':
            return <ArtIcon className="w-3.5 h-3.5 mr-2 text-purple-400 shrink-0" />;
        case 'env':
        case 'gitignore':
        case 'config':
            return <SettingsIcon className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />;
        default:
            return <FileIcon className="w-3.5 h-3.5 mr-2 text-slate-500 shrink-0" />;
    }
};

const buildTree = (items: GitTreeItem[]): { [key: string]: TreeNode } => {
  const root: { [key: string]: TreeNode } = {};
  items.forEach(item => {
    let current = root;
    item.path.split('/').forEach((part, index, arr) => {
      if (!current[part]) {
        current[part] = { 
            name: part, 
            path: arr.slice(0, index + 1).join('/'),
            type: index === arr.length - 1 ? item.type : 'tree'
        };
        if (index < arr.length - 1) {
            current[part].children = {};
        }
      }
      if(current[part].children) {
        current = current[part].children!;
      }
    });
  });
  return root;
};

const Node: React.FC<{ node: TreeNode; onFileSelect: (path: string) => void; activeFile: string | null; depth: number }> = ({ node, onFileSelect, activeFile, depth }) => {
  const [isOpen, setIsOpen] = useState(depth < 1); // Expand only root initially

  if (node.type === 'tree') {
    return (
      <div>
        <div 
          className="flex items-center py-1.5 px-2 rounded-md cursor-pointer hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors select-none"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDownIcon className={`w-3 h-3 mr-1.5 transition-transform duration-200 shrink-0 opacity-60 ${isOpen ? '' : '-rotate-90'}`} />
          <FolderIcon className={`w-3.5 h-3.5 mr-2 shrink-0 ${isOpen ? 'text-sky-300' : 'text-sky-400/60'}`} />
          <span className="text-xs truncate font-medium">{node.name}</span>
        </div>
        {isOpen && (
            <div className="animate-fade-in">
                {Object.values(node.children || {}).sort((a,b) => (a.type === 'tree' ? -1 : 1)).map(child => (
                    <Node key={child.path} node={child} onFileSelect={onFileSelect} activeFile={activeFile} depth={depth + 1} />
                ))}
            </div>
        )}
      </div>
    );
  }

  const isActive = activeFile === node.path;
  return (
    <div 
      className={`relative flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-all duration-200 group
        ${isActive ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-slate-200'}
      `}
      style={{ paddingLeft: `${depth * 12 + 20}px` }} // Compensate for missing chevron
      onClick={() => onFileSelect(node.path)}
    >
      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-[var(--accent)] rounded-r"></div>}
      {getFileIcon(node.name)}
      <span className={`text-xs truncate font-medium ${isActive ? 'font-bold' : ''}`}>{node.name}</span>
    </div>
  );
};


export const FileExplorer: React.FC<FileExplorerProps> = ({ tree, onFileSelect, activeFile }) => {
  const fileTree = buildTree(tree);

  return (
    <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-0.5">
      {Object.values(fileTree).sort((a,b) => (a.type === 'tree' ? -1 : 1)).map(node => (
        <Node key={node.path} node={node} onFileSelect={onFileSelect} activeFile={activeFile} depth={0} />
      ))}
    </div>
  );
};

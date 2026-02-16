
import React, { useMemo } from 'react';
import { DiffChange } from '../types';

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
}

// Algoritmo de diff baseado no Longest Common Subsequence (LCS)
const createDiff = (oldStr: string, newStr: string): DiffChange[] => {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const N = oldLines.length;
  const M = newLines.length;
  const max = N + M;
  const v = Array(2 * max + 1).fill(0);
  const trace = [];
  
  for (let d = 0; d <= max; d++) {
    const newTrace = { ...v };
    trace.push(newTrace);
    for (let k = -d; k <= d; k += 2) {
      let x = 0;
      if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
        x = v[k + 1 + max];
      } else {
        x = v[k - 1 + max] + 1;
      }
      let y = x - k;
      while (x < N && y < M && oldLines[x] === newLines[y]) {
        x++;
        y++;
      }
      v[k + max] = x;
      if (x >= N && y >= M) {
        let result: DiffChange[] = [];
        let px = N, py = M;
        for (let i = d; i > 0; i--) {
          const pv = trace[i-1];
          const pmax = N + M;
          let pk = 0;
          if (px - 1 < 0) { 
             pk = py - px + i - 1;
          } else if (py -1 < 0) { 
             pk = py - px - i + 1;
          } else {
            if (pv[py - px + i - 1 + pmax] > pv[py - px - i + 1 + pmax]) {
              pk = py - px + i - 1;
            } else {
              pk = py - px - i + 1;
            }
          }

          const x_end = pv[pk + pmax];
          const y_end = x_end - pk;
          
          while(px > x_end || py > y_end) {
            if (px > x_end && py > y_end && oldLines[px - 1] === newLines[py - 1]) {
                result.unshift({ type: 'same', line: oldLines[px-1], oldLineNumber: px, newLineNumber: py });
                px--; py--;
            } else if (py > y_end) {
                result.unshift({ type: 'added', line: newLines[py-1], newLineNumber: py });
                py--;
            } else {
                result.unshift({ type: 'removed', line: oldLines[px-1], oldLineNumber: px });
                px--;
            }
          }
        }
        return result;
      }
    }
  }
  return []; 
};

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldContent, newContent }) => {
    const changes = useMemo(() => createDiff(oldContent, newContent), [oldContent, newContent]);

    return (
        <div className="h-full w-full flex flex-col font-mono text-xs text-slate-300 bg-[#0d1117] rounded-lg border border-[var(--border-color)] overflow-hidden">
            <div className="sticky top-0 z-10 h-8 flex items-center px-4 bg-[#161b22] border-b border-[var(--border-color)] text-xs font-bold text-slate-400">
                <span className="w-10 text-right mr-4">Original</span>
                <span className="w-10 text-right mr-4">Modificado</span>
                <span>Conteúdo</span>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full border-collapse">
                    <tbody>
                        {changes.map((change, index) => {
                            let bgClass = '';
                            let textClass = 'text-slate-300';
                            let gutterClass = 'bg-[#161b22] text-slate-600';
                            
                            if (change.type === 'added') {
                                bgClass = 'bg-[#1f3f31]'; // GitHub green tint
                                textClass = 'text-emerald-300';
                                gutterClass = 'bg-[#2a4a3b] text-emerald-500';
                            } else if (change.type === 'removed') {
                                bgClass = 'bg-[#472225]'; // GitHub red tint
                                textClass = 'text-rose-300';
                                gutterClass = 'bg-[#5c2c30] text-rose-500';
                            }

                            return (
                                <tr key={index} className={`${bgClass} hover:brightness-110 transition-colors`}>
                                    <td className={`w-10 text-right pr-3 py-0.5 select-none border-r border-[#30363d] ${gutterClass} opacity-80 font-mono`}>
                                        {change.oldLineNumber || ''}
                                    </td>
                                    <td className={`w-10 text-right pr-3 py-0.5 select-none border-r border-[#30363d] ${gutterClass} opacity-80 font-mono`}>
                                        {change.newLineNumber || ''}
                                    </td>
                                    <td className={`pl-4 py-0.5 whitespace-pre-wrap break-all leading-tight ${textClass}`}>
                                        {change.type === 'added' && <span className="select-none inline-block w-3 -ml-3 text-emerald-500">+</span>}
                                        {change.type === 'removed' && <span className="select-none inline-block w-3 -ml-3 text-rose-500">-</span>}
                                        {change.line}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

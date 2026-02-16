
import React from 'react';
import { Agent } from '../types';

/** Propriedades padrão para todos os vetores SVG do sistema */
const iconProps = {
  className: "w-5 h-5 inline-block",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round" as "round",
  strokeLinejoin: "round" as "round",
};

type IconProps = { className?: string };

/** Utilitário para concatenar classes CSS de forma limpa */
const cn = (defaultClass: string, extraClass?: string) => [defaultClass, extraClass].filter(Boolean).join(' ');

/**
 * Ícone personalizado do Robô (Logo Principal - Azul MOE).
 * Anteriormente RedBotIcon.
 */
export const MoeBotIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M35 15 L42 25" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
    <path d="M65 15 L58 25" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
    <circle cx="35" cy="15" r="3" fill="#0ea5e9" />
    <circle cx="65" cy="15" r="3" fill="#0ea5e9" />
    <rect x="38" y="80" width="8" height="15" fill="#0ea5e9" rx="2" />
    <rect x="54" y="80" width="8" height="15" fill="#0ea5e9" rx="2" />
    <circle cx="15" cy="55" r="10" fill="#0ea5e9" />
    <circle cx="85" cy="55" r="10" fill="#0ea5e9" />
    <circle cx="50" cy="52" r="38" fill="#0ea5e9" />
    <circle cx="38" cy="45" r="5" fill="#ffffff" className="animate-pulse" />
    <circle cx="62" cy="45" r="5" fill="#ffffff" className="animate-pulse" />
  </svg>
);

/**
 * Ícone do Robô Adaptativo.
 */
export const AdaptiveBotIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M35 15 L42 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M65 15 L58 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <circle cx="35" cy="15" r="3" fill="currentColor" />
    <circle cx="65" cy="15" r="3" fill="currentColor" />
    <rect x="38" y="80" width="8" height="15" fill="currentColor" rx="2" />
    <rect x="54" y="80" width="8" height="15" fill="currentColor" rx="2" />
    <circle cx="15" cy="55" r="10" fill="currentColor" />
    <circle cx="85" cy="55" r="10" fill="currentColor" />
    <circle cx="50" cy="52" r="38" fill="currentColor" />
    <circle cx="38" cy="45" r="5" fill="#fff" className="animate-pulse" />
    <circle cx="62" cy="45" r="5" fill="#fff" className="animate-pulse" />
  </svg>
);

export const BotIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>
);
export const MedicalIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5v14"/><path d="M5 12h14"/></svg>
);
export const ShieldIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1-1z"/><path d="m9 12 2 2 4-4"/></svg>
);
export const PlannerIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
);
export const ResearcherIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
export const WriterIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
);
export const CodeIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn(iconProps.className, className)}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);
export const BrainIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 3.76-2.54Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-3.76-2.54Z"/></svg>
);
export const DataAnalystIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
);
export const BriefcaseIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn(iconProps.className, className)}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);
export const FolderIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
);
export const FileIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
);
export const SettingsIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);
export const CloseIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn("w-4 h-4", className)}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
export const SunIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
);
export const MoonIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);
export const SparkleIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
export const CheckIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn(iconProps.className, className)}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
export const SpinnerIcon = ({ className }: IconProps) => (
    <svg className={cn('animate-spin w-5 h-5', className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);
export const RetryIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn("w-4 h-4", className)}><path d="M21.5 2v6h-6M2.5 22v-6h6"/><path d="M22 11.5A10 10 0 0 0 3.5 12.5"/><path d="M2 12.5a10 10 0 0 0 18.5-1"/></svg>
);
export const MapIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
);
export const ListIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);
export const GanttIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M8 6h10"/><path d="M6 12h9"/><path d="M11 18h7"/></svg>
);
export const BarChartIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
);
export const DownloadIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
export const CopyIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
export const TrashIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn("w-4 h-4 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400", className)}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
export const SearchIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
export const ChevronDownIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><polyline points="6 9 12 15 18 9"/></svg>
);
export const UploadIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
export const PlayIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
export const LinkIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
export const SaveIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);
export const HistoryIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 7 12 12 15 15"/></svg>
);
export const ExportIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);
export const ImportIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 11 12 15 8 11"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);
export const PauseIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
export const StopIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn(iconProps.className, className)}><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
);
export const CloudIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
);
export const CloudOffIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 7h5a5 5 0 0 0 1.74-2.87M2 2l20 20"/></svg>
);
export const DatabaseIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
);
export const EyeIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const ConsoleIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="m4 17 6-6-6-6"/><path d="M12 19h8"/></svg>
);
export const ExternalLinkIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);
export const ExchangeIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M17 2.1l4 4-4 4"/><path d="M3 11h16"/><path d="M7 21.9l-4-4 4-4"/><path d="M21 13H5"/></svg>
);
export const MagicWandIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
);
export const EngramIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16"/><path d="M15 4v16"/><path d="M4 9h16"/><path d="M4 15h16"/><path d="M12 9v6"/></svg>
);
export const RefreshIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M21.5 2v6h-6M21.34 5.5A10 10 0 1 0 22 12"/></svg>
);
export const VercelIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn(iconProps.className, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M24 22.525H0l12-21.05 12 21.05z" /></svg>
);

// --- Novos ícones para Notificações e Agendamento ---

export const BellIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

export const ClockIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export const CalendarIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

export const AlarmIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/></svg>
);

// --- Novos ícones para Universalidade ---

export const LegalIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
);

export const ArtIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
);

export const ScienceIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 14a2 2 0 0 1-2-2V6h22v6a2 2 0 0 1-2 2"/><path d="M12 14a4 4 0 0 1 4 4v4H8v-4a4 4 0 0 1 4-4Z"/></svg>
);

export const FinanceIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

export const GitCommitIcon = ({ className }: IconProps) => (
  <svg {...iconProps} className={cn(iconProps.className, className)}><circle cx="12" cy="12" r="3" /><line x1="12" y1="15" x2="12" y2="22" /><line x1="12" y1="2" x2="12" y2="9" /></svg>
);

export const GitPullRequestIcon = ({ className }: IconProps) => (
    <svg {...iconProps} className={cn(iconProps.className, className)}><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" /></svg>
);

/**
 * Retorna o ícone apropriado baseado em heurística semântica para agentes criados dinamicamente.
 */
export const getAgentIcon = (agent: Agent) => {
    if (agent.visualTag === 'PROMPT') return <MagicWandIcon className="w-full h-full" />;
    if (agent.visualTag === 'ENGRAM') return <EngramIcon className="w-full h-full" />;
    return <AdaptiveBotIcon className="w-full h-full" />;
};

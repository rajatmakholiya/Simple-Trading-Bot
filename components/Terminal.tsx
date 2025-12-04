import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import clsx from 'clsx';

interface TerminalProps {
  logs: LogEntry[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex flex-col h-64">
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Logs</h3>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-1">
        {logs.length === 0 && <span className="text-slate-500 opacity-50">Waiting for system events...</span>}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <span className="text-slate-500 min-w-[140px]">{log.timestamp}</span>
            <span className={clsx(
              "font-bold uppercase min-w-[60px]",
              log.level === 'INFO' && "text-blue-400",
              log.level === 'WARN' && "text-yellow-400",
              log.level === 'ERROR' && "text-red-400",
              log.level === 'SUCCESS' && "text-green-400"
            )}>
              [{log.level}]
            </span>
            <span className="text-slate-300 break-all">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
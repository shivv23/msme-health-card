import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { exportCSV, exportPDFData } from '../../api/client';

interface ExportButtonProps {
  msmeId?: number;
}

export default function ExportButton({ msmeId }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCSV = async () => {
    setLoading('csv');
    try {
      await exportCSV();
    } catch {
      // error handled by interceptor
    } finally {
      setLoading('');
      setOpen(false);
    }
  };

  const handlePDF = async () => {
    if (!msmeId) return;
    setLoading('pdf');
    try {
      const data = await exportPDFData(msmeId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `msme_${msmeId}_report.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading('');
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
      >
        <Download size={14} />
        Export
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 animate-scale-in z-50">
          <button
            onClick={handleCSV}
            disabled={loading === 'csv'}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors disabled:opacity-50"
          >
            {loading === 'csv' ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} className="text-emerald-400" />}
            Export CSV
          </button>
          {msmeId && (
            <button
              onClick={handlePDF}
              disabled={loading === 'pdf'}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors disabled:opacity-50"
            >
              {loading === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} className="text-blue-400" />}
              Export PDF Report
            </button>
          )}
        </div>
      )}
    </div>
  );
}

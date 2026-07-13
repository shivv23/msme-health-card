import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import { RiskBadge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { getMSMEs } from '../api/client';
import type { MSME } from '../types';
import { formatDate, getScoreColor } from '../lib/utils';

type SortKey = 'business_name' | 'gst_number' | 'state' | 'created_at';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

export default function MSMEList() {
  const [msmes, setMsmes] = useState<MSME[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('business_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMSMEs();
        setMsmes(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load MSMEs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = msmes
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.business_name.toLowerCase().includes(q) ||
        m.gst_number.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <PageLoader label="Loading MSME directory..." />;
  if (error) return <div className="text-center text-rose-400 py-20">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, GST, state, city..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
          <span className="text-sm text-slate-500">{filtered.length} MSMEs</span>
        </div>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {[
                  { key: 'business_name' as SortKey, label: 'Business Name' },
                  { key: 'gst_number' as SortKey, label: 'GST Number' },
                  { key: 'state' as SortKey, label: 'State' },
                  { key: 'created_at' as SortKey, label: 'Registered' },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-6 py-3 text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-300 transition-colors select-none"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.label}
                      <ArrowUpDown size={12} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((msme) => (
                <tr
                  key={msme.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-3">
                    <Link
                      to={`/msme/${msme.gst_number}`}
                      className="text-slate-200 hover:text-emerald-400 transition-colors font-medium"
                    >
                      {msme.business_name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">{msme.business_type}</p>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{msme.gst_number}</td>
                  <td className="px-6 py-3 text-slate-400">{msme.state}</td>
                  <td className="px-6 py-3 text-slate-500">{formatDate(msme.created_at)}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No MSMEs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

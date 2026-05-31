'use client';

import { useEffect, useState } from 'react';
import { BarChart2, RefreshCw, Database, Brain, Search } from 'lucide-react';

interface ModeStats {
  count: number;
  relevance: number | null;
  explainability: number | null;
  db_binding: number | null;
  controllability: number | null;
}

interface ComparisonStats {
  rag: ModeStats;
  gpt: ModeStats;
  keyword: ModeStats;
}

interface Metric {
  key: keyof Omit<ModeStats, 'count'>;
  label: string;
}

const METRICS: Metric[] = [
  { key: 'db_binding',      label: 'DB Binding'      },
  { key: 'controllability', label: 'Controllability' },
  { key: 'relevance',       label: 'Relevance'       },
  { key: 'explainability',  label: 'Explainability'  },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function toPercent(value: number | null): number {
  if (value === null) return 0;
  return Math.round((value / 5) * 100);
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
        {pct}%
      </span>
    </div>
  );
}

function NoDataHint() {
  return (
    <div className="text-center py-12 text-gray-400 dark:text-gray-500">
      <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p className="text-sm">Data will appear after the first queries.</p>
      <p className="text-xs mt-1">Make a few searches in RAG and GPT mode.</p>
    </div>
  );
}

export default function ComparisonChart() {
  const [stats, setStats] = useState<ComparisonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/recommendations/stats/`);
      if (!res.ok) throw new Error('Failed to load');
      setStats(await res.json());
    } catch {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const hasData = stats && (stats.rag.count > 0 || stats.gpt.count > 0 || stats.keyword.count > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-xl">
              RAG vs GPT — comparison
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Average quality scores across all queries
            </p>
          </div>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
      )}

      {loading && !stats && (
        <div className="space-y-3">
          {METRICS.map(m => (
            <div key={m.key} className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !hasData && <NoDataHint />}

      {hasData && (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-5">
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Search className="w-3.5 h-3.5 text-green-500" />
              Keyword
              <span className="text-gray-400">({stats!.keyword.count} queries)</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Brain className="w-3.5 h-3.5 text-purple-500" />
              GPT-only
              <span className="text-gray-400">({stats!.gpt.count} queries)</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Database className="w-3.5 h-3.5 text-blue-500" />
              RAG
              <span className="text-gray-400">({stats!.rag.count} queries)</span>
            </span>
          </div>

          <div className="space-y-5">
            {METRICS.map(({ key, label }) => {
              const ragPct     = toPercent(stats!.rag[key]     as number | null);
              const gptPct     = toPercent(stats!.gpt[key]     as number | null);
              const keywordPct = toPercent(stats!.keyword[key] as number | null);
              return (
                <div key={key}>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-xs text-green-600 dark:text-green-400 font-medium">Keyword</span>
                      <Bar pct={stats!.keyword.count > 0 ? keywordPct : 0} color="bg-green-500" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-xs text-purple-600 dark:text-purple-400 font-medium">GPT</span>
                      <Bar pct={stats!.gpt.count > 0 ? gptPct : 0} color="bg-purple-500" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-xs text-blue-600 dark:text-blue-400 font-medium">RAG</span>
                      <Bar pct={stats!.rag.count > 0 ? ragPct : 0} color="bg-blue-500" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
            Scale: 1–5 points → 20–100%. More queries = more accurate statistics.
          </p>
        </>
      )}
    </div>
  );
}

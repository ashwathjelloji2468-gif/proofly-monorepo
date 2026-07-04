'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock, Zap, Database, Globe, Activity } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  latency?: number;
  message?: string;
}

interface SystemHealth {
  status: 'ok' | 'degraded' | 'error';
  uptime?: number;
  uptimeHuman?: string;
  nodeVersion?: string;
  environment?: string;
  memory?: { rss: string; heapUsed: string; heapTotal: string };
  database?: { status: string; users?: number; sessions?: number };
  services?: Record<string, string>;
  requests?: { total: number; last5min: number; avgDurationMs: number; errorRate5minPct: number };
  timestamp?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const REFRESH_INTERVAL = 30_000;

function StatusBadge({ status }: { status: ServiceStatus['status'] }) {
  const map = {
    operational: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-900/30', label: 'Operational' },
    degraded: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-950/30 border-yellow-900/30', label: 'Degraded' },
    down: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-950/30 border-red-900/30', label: 'Down' },
    unknown: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-800/30 border-slate-700/30', label: 'Unknown' },
  };
  const { icon: Icon, color, bg, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${bg} ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function MetricCard({ label, value, sub, icon: Icon, accent = 'emerald' }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent?: string;
}) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30',
    blue: 'text-blue-400 bg-blue-950/30 border-blue-900/30',
    yellow: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/30',
    purple: 'text-purple-400 bg-purple-950/30 border-purple-900/30',
  };
  return (
    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 space-y-3">
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${colors[accent]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
      const data: SystemHealth = await res.json();
      setHealth(data);

      // Build service statuses from health data
      const svcList: ServiceStatus[] = [
        {
          name: 'API Server',
          status: data.status === 'ok' ? 'operational' : 'degraded',
        },
        {
          name: 'Database',
          status: data.database?.status === 'connected' ? 'operational' : 'down',
          message: data.database?.status !== 'connected' ? 'Cannot reach database' : undefined,
        },
        {
          name: 'Stripe Payments',
          status: data.services?.stripe === 'configured' ? 'operational' : 'unknown',
          message: data.services?.stripe !== 'configured' ? 'Not configured' : undefined,
        },
        {
          name: 'Cloudinary CDN',
          status: data.services?.cloudinary === 'configured' ? 'operational' : 'unknown',
          message: data.services?.cloudinary !== 'configured' ? 'Not configured' : undefined,
        },
        {
          name: 'Email (Resend)',
          status: data.services?.email === 'configured' ? 'operational' : 'unknown',
          message: data.services?.email !== 'configured' ? 'Not configured' : undefined,
        },
        {
          name: 'AI Suite (OpenAI)',
          status: data.services?.openai === 'configured' ? 'operational' : 'unknown',
          message: data.services?.openai !== 'configured' ? 'Not configured' : undefined,
        },
      ];
      setServices(svcList);
    } catch {
      setHealth({ status: 'error' });
      setServices([{ name: 'API Server', status: 'down', message: 'Cannot reach API' }]);
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const overallStatus = services.length === 0
    ? 'unknown'
    : services.some(s => s.status === 'down')
    ? 'down'
    : services.some(s => s.status === 'degraded')
    ? 'degraded'
    : 'operational';

  const overallBanner: Record<string, { bg: string; text: string; label: string }> = {
    operational: { bg: 'bg-emerald-950/40 border-emerald-900/30', text: 'text-emerald-400', label: '✓ All systems operational' },
    degraded: { bg: 'bg-yellow-950/40 border-yellow-900/30', text: 'text-yellow-400', label: '⚠ Some systems are degraded' },
    down: { bg: 'bg-red-950/40 border-red-900/30', text: 'text-red-400', label: '✕ Service disruption detected' },
    unknown: { bg: 'bg-slate-800/40 border-slate-700/30', text: 'text-slate-400', label: 'Checking systems...' },
  };

  const banner = overallBanner[overallStatus];

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans">
      {/* Header */}
      <div className="border-b border-[#27272A] px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-white">Proofly</span>
          <span className="text-slate-500 text-sm ml-1">/ Status</span>
        </a>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Overall status banner */}
        <div className={`rounded-xl border p-5 text-center ${banner.bg}`}>
          <p className={`text-lg font-bold ${banner.text}`}>{banner.label}</p>
          {lastChecked && (
            <p className="text-xs text-slate-500 mt-1">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* System metrics */}
        {health?.status === 'ok' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Uptime"
              value={health.uptimeHuman || '—'}
              icon={Clock}
              accent="emerald"
            />
            <MetricCard
              label="Avg Response"
              value={health.requests?.avgDurationMs ? `${health.requests.avgDurationMs}ms` : '—'}
              sub="Last 5 minutes"
              icon={Activity}
              accent="blue"
            />
            <MetricCard
              label="Requests (5m)"
              value={health.requests?.last5min ?? '—'}
              icon={Globe}
              accent="purple"
            />
            <MetricCard
              label="Memory"
              value={health.memory?.heapUsed || '—'}
              sub={`of ${health.memory?.heapTotal || '—'} heap`}
              icon={Database}
              accent="yellow"
            />
          </div>
        )}

        {/* Services */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#27272A]">
            <h2 className="text-sm font-bold text-white">System Components</h2>
          </div>
          <div className="divide-y divide-[#27272A]">
            {services.map((svc) => (
              <div key={svc.name} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{svc.name}</p>
                  {svc.message && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{svc.message}</p>
                  )}
                </div>
                <StatusBadge status={svc.status} />
              </div>
            ))}
            {loading && services.length === 0 && (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">
                Checking systems...
              </div>
            )}
          </div>
        </div>

        {/* Server info */}
        {health?.status === 'ok' && (
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-white">Server Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Node.js', value: health.nodeVersion || '—' },
                { label: 'Environment', value: health.environment || '—' },
                { label: 'DB Users', value: health.database?.users?.toString() || '—' },
                { label: 'DB Sessions', value: health.database?.sessions?.toString() || '—' },
                { label: 'Error Rate (5m)', value: `${health.requests?.errorRate5minPct ?? 0}%` },
                { label: 'Total Requests', value: health.requests?.total?.toString() || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#09090B] rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold text-white mt-0.5 font-mono">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-600">
          Auto-refreshes every 30 seconds · {new Date().getFullYear()} Proofly
        </p>
      </div>
    </div>
  );
}

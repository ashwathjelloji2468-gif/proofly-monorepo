'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity, AlertTriangle, BarChart3, CheckCircle, Clock, Database,
  Globe, RefreshCw, Server, Shield, XCircle, Zap, TrendingUp, Bug, Lock,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface MetricsData {
  server: {
    uptime: number;
    uptimeHuman: string;
    nodeVersion: string;
    environment: string;
    memory: { rssBytes: number; heapUsedBytes: number; heapTotalBytes: number };
  };
  requests: {
    total: number;
    last5min: number;
    last1hr: number;
    avgDurationMs: number;
    errorRate5minPct: number;
  };
  slowestEndpoints: Array<{ route: string; p95: number; avg: number; count: number }>;
  errors: Array<{
    route: string; message: string; statusCode: number;
    count: number; firstSeen: number; lastSeen: number;
  }>;
  securityEvents: Array<{ type: string; ip: string; route: string; timestamp: number }>;
  jobs: {
    total: number; completed: number; failed: number; running: number;
    recent: Array<{ queue: string; jobId: string; status: string; duration?: number; error?: string }>;
  };
  timestamp: string;
}

interface HealthData {
  status: string;
  uptimeHuman: string;
  memory: { rss: string; heapUsed: string; heapTotal: string };
  database: { status: string; users: number; sessions: number };
  services: Record<string, string>;
  requests: { total: number; last5min: number; avgDurationMs: number; errorRate5minPct: number };
}

function mb(bytes: number) { return `${Math.round(bytes / 1024 / 1024)}MB`; }
function pct(n: number, total: number) { return total > 0 ? `${Math.round((n / total) * 100)}%` : '0%'; }

function SectionHeader({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: string | number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <h2 className="text-sm font-bold text-white">{title}</h2>
      {badge !== undefined && (
        <span className="ml-auto text-xs bg-[#27272A] text-slate-400 rounded-full px-2 py-0.5">{badge}</span>
      )}
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
  );
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, hRes] = await Promise.all([
        fetch(`${API_URL}/metrics`, { cache: 'no-store' }),
        fetch(`${API_URL}/health`, { cache: 'no-store' }),
      ]);
      if (!mRes.ok || !hRes.ok) throw new Error('Failed to fetch monitoring data');
      const [m, h] = await Promise.all([mRes.json(), hRes.json()]);
      setMetrics(m);
      setHealth(h);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message || 'Cannot reach backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 30_000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const serverOk = health?.status === 'ok';
  const dbOk = health?.database?.status === 'connected';

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            System Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live backend metrics · {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#18181B] border border-[#27272A] text-xs text-slate-400 hover:text-white rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{error} — Is the backend running at {API_URL}?</p>
        </div>
      )}

      {/* Top Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'API Server', ok: serverOk, icon: Server, value: serverOk ? 'Online' : 'Offline' },
          { label: 'Database', ok: dbOk, icon: Database, value: dbOk ? 'Connected' : 'Error' },
          { label: 'Uptime', ok: serverOk, icon: Clock, value: health?.requests ? metrics?.server?.uptimeHuman || '—' : '—' },
          { label: 'Error Rate', ok: (health?.requests?.errorRate5minPct ?? 0) < 5, icon: AlertTriangle, value: `${health?.requests?.errorRate5minPct ?? 0}%` },
        ].map(({ label, ok, icon: Icon, value }) => (
          <div key={label} className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ok ? 'bg-emerald-950/40 border border-emerald-900/30' : 'bg-red-950/40 border border-red-900/30'}`}>
              <Icon className={`w-5 h-5 ${ok ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
              <p className={`text-sm font-bold ${ok ? 'text-emerald-400' : 'text-red-400'}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Request Stats */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', value: metrics.requests.total.toLocaleString(), icon: Globe, accent: 'blue' },
            { label: 'Requests (5m)', value: metrics.requests.last5min, icon: TrendingUp, accent: 'purple' },
            { label: 'Avg Response', value: `${metrics.requests.avgDurationMs}ms`, icon: Zap, accent: 'emerald' },
            { label: 'Heap Used', value: mb(metrics.server.memory.heapUsedBytes), icon: BarChart3, accent: 'yellow' },
          ].map(({ label, value, icon: Icon, accent }) => {
            const c = { blue: 'text-blue-400 bg-blue-950/30 border-blue-900/30', purple: 'text-purple-400 bg-purple-950/30 border-purple-900/30', emerald: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30', yellow: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/30' }[accent]!;
            return (
              <div key={label} className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 space-y-2">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${c}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-white">{value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Service Status + Memory */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Services */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5">
          <SectionHeader icon={CheckCircle} title="Services" />
          <div className="space-y-2">
            {health?.services && Object.entries(health.services).map(([name, status]) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-[#27272A] last:border-0">
                <span className="text-xs text-slate-300 font-medium capitalize">{name}</span>
                <div className="flex items-center gap-1.5">
                  <StatusDot ok={status === 'configured'} />
                  <span className={`text-[11px] font-semibold ${status === 'configured' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {status === 'configured' ? 'Configured' : 'Not Set'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memory */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5">
          <SectionHeader icon={Server} title="Memory Usage" />
          {metrics ? (
            <div className="space-y-3">
              {[
                { label: 'RSS', bytes: metrics.server.memory.rssBytes },
                { label: 'Heap Used', bytes: metrics.server.memory.heapUsedBytes },
                { label: 'Heap Total', bytes: metrics.server.memory.heapTotalBytes },
              ].map(({ label, bytes }) => {
                const usedPct = Math.round((bytes / metrics.server.memory.rssBytes) * 100);
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-white font-mono font-semibold">{mb(bytes)}</span>
                    </div>
                    <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(usedPct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-slate-500 pt-1">
                Node {metrics.server.nodeVersion} · {metrics.server.environment}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading...</p>
          )}
        </div>
      </div>

      {/* Slowest Endpoints */}
      {metrics?.slowestEndpoints && metrics.slowestEndpoints.length > 0 && (
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5">
          <SectionHeader icon={TrendingUp} title="Slowest Endpoints (P95)" badge={metrics.slowestEndpoints.length} />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-[#27272A]">
                  <th className="pb-2 pr-4 font-medium">Route</th>
                  <th className="pb-2 pr-4 font-medium">P95</th>
                  <th className="pb-2 pr-4 font-medium">Avg</th>
                  <th className="pb-2 font-medium">Calls (1h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {metrics.slowestEndpoints.map((ep, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 font-mono text-slate-300 truncate max-w-[200px]">{ep.route}</td>
                    <td className="py-2 pr-4">
                      <span className={`font-bold ${ep.p95 > 2000 ? 'text-red-400' : ep.p95 > 500 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {ep.p95}ms
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-400">{ep.avg}ms</td>
                    <td className="py-2 text-slate-400">{ep.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Errors */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5">
        <SectionHeader icon={Bug} title="Recent Errors" badge={metrics?.errors.length ?? 0} />
        {metrics?.errors && metrics.errors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-[#27272A]">
                  <th className="pb-2 pr-4 font-medium">Route</th>
                  <th className="pb-2 pr-4 font-medium">Message</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Count</th>
                  <th className="pb-2 font-medium">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {metrics.errors.map((err, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 font-mono text-slate-300 max-w-[120px] truncate">{err.route}</td>
                    <td className="py-2 pr-4 text-red-300 max-w-[200px] truncate">{err.message}</td>
                    <td className="py-2 pr-4">
                      <span className={`font-bold ${err.statusCode >= 500 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {err.statusCode}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-white font-bold">{err.count}</td>
                    <td className="py-2 text-slate-500">{new Date(err.lastSeen).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-600 text-sm">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-900" />
            No errors recorded
          </div>
        )}
      </div>

      {/* Security Events */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5">
        <SectionHeader icon={Shield} title="Security Events" badge={metrics?.securityEvents.length ?? 0} />
        {metrics?.securityEvents && metrics.securityEvents.length > 0 ? (
          <div className="space-y-2">
            {metrics.securityEvents.slice(-10).reverse().map((ev, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#27272A] last:border-0">
                <Lock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span className="text-xs text-yellow-300 font-semibold">{ev.type}</span>
                <span className="text-xs text-slate-500 font-mono">{ev.ip}</span>
                <span className="text-xs text-slate-500 ml-auto">{new Date(ev.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600 py-4 text-center">No security events detected</p>
        )}
      </div>

      {/* Jobs */}
      {metrics?.jobs && (
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5">
          <SectionHeader icon={Zap} title="Background Jobs" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Total', value: metrics.jobs.total, color: 'text-white' },
              { label: 'Completed', value: metrics.jobs.completed, color: 'text-emerald-400' },
              { label: 'Failed', value: metrics.jobs.failed, color: 'text-red-400' },
              { label: 'Running', value: metrics.jobs.running, color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#09090B] rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase">{label}</p>
                <p className={`text-xl font-black mt-0.5 ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

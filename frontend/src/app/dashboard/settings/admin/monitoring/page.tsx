'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity, AlertTriangle, BarChart3, CheckCircle, Clock, Database,
  Globe, RefreshCw, Server, Shield, XCircle, Zap, TrendingUp, Bug,
  Lock, Eye, Download, Search, Filter, ChevronDown,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface HealthData {
  status: string; uptimeHuman: string;
  memory: { rss: string; heapUsed: string; heapTotal: string };
  database: { status: string; users: number; sessions: number; queryHealth?: { score: number; avgMs: number; p95Ms: number; slowQueries: number } };
  redis: { status: string; latencyMs?: number; memoryUsedMB?: number; connectedClients?: number; hitRate?: string };
  services: Record<string, string>;
  requests: { total: number; last5min: number; avgDurationMs: number; errorRate5minPct: number };
}

interface MetricsData {
  server: { uptime: number; uptimeHuman: string; nodeVersion: string; environment: string; memory: { rssBytes: number; heapUsedBytes: number; heapTotalBytes: number } };
  requests: { total: number; last5min: number; last1hr: number; avgDurationMs: number; errorRate5minPct: number };
  slowestEndpoints: Array<{ route: string; p95: number; avg: number; count: number }>;
  errors: Array<{ route: string; message: string; statusCode: number; count: number; firstSeen: number; lastSeen: number }>;
  securityEvents: Array<{ type: string; ip: string; route: string; timestamp: number }>;
  jobs: { total: number; completed: number; failed: number; running: number };
  database: { totalTracked: number; avgDurationMs: number; p95Ms: number; p99Ms: number; byCategory: Record<string, number>; worstQueries: Array<{ query: string; avgMs: number; maxMs: number; count: number }>; healthScore: number };
  redis: { health: { status: string; latencyMs?: number; memoryUsedMB?: number }; topRoutes: Array<{ route: string; calls: number }>; topWorkspaces: Array<{ workspaceId: string; requests: number }> };
}

interface AuditLog {
  id: string; userId: string; action: string; ipAddress?: string; createdAt: string;
  user?: { email: string; name: string };
  parsedInfo?: Record<string, string>;
}

function mb(bytes: number) { return `${Math.round(bytes / 1024 / 1024)}MB`; }

function StatusDot({ ok, size = 'sm' }: { ok: boolean; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-3 h-3' : 'w-2 h-2';
  return <span className={`inline-block ${sz} rounded-full ${ok ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#18181B] border border-[#27272A] rounded-xl ${className}`}>{children}</div>;
}

function SectionHeader({ icon: Icon, title, badge, action }: { icon: React.ElementType; title: string; badge?: string | number; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#27272A]">
      <Icon className="w-4 h-4 text-slate-400" />
      <h2 className="text-sm font-bold text-white flex-1">{title}</h2>
      {badge !== undefined && <span className="text-xs bg-[#27272A] text-slate-400 rounded-full px-2 py-0.5">{badge}</span>}
      {action}
    </div>
  );
}

// ─── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab({ health, metrics, loading }: { health: HealthData | null; metrics: MetricsData | null; loading: boolean }) {
  const dbOk = health?.database?.status === 'connected';
  const redisOk = health?.redis?.status === 'connected';
  const serverOk = health?.status === 'ok';

  return (
    <div className="space-y-6">
      {/* Status row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'API Server', ok: serverOk, icon: Server, value: serverOk ? 'Online' : 'Offline', sub: health?.uptimeHuman },
          { label: 'Database', ok: dbOk, icon: Database, value: dbOk ? 'Connected' : 'Error', sub: `Health: ${health?.database?.queryHealth?.score ?? '—'}/100` },
          { label: 'Redis', ok: redisOk, icon: Zap, value: redisOk ? `${health?.redis?.latencyMs ?? '—'}ms` : health?.redis?.status, sub: redisOk ? `${health?.redis?.memoryUsedMB ?? '—'}MB used` : 'Fallback: in-memory' },
          { label: 'Error Rate', ok: (health?.requests?.errorRate5minPct ?? 0) < 5, icon: AlertTriangle, value: `${health?.requests?.errorRate5minPct ?? 0}%`, sub: 'Last 5 minutes' },
        ].map(({ label, ok, icon: Icon, value, sub }) => (
          <Card key={label} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ok ? 'bg-emerald-950/40 border border-emerald-900/30' : 'bg-red-950/40 border border-red-900/30'}`}>
              <Icon className={`w-5 h-5 ${ok ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
              <p className={`text-sm font-bold truncate ${ok ? 'text-emerald-400' : 'text-red-400'}`}>{value}</p>
              {sub && <p className="text-[10px] text-slate-600 truncate">{sub}</p>}
            </div>
          </Card>
        ))}
      </div>

      {/* Request stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: metrics?.requests.total.toLocaleString() ?? '—', icon: Globe },
          { label: 'Req/5min', value: metrics?.requests.last5min ?? '—', icon: TrendingUp },
          { label: 'Avg Response', value: metrics ? `${metrics.requests.avgDurationMs}ms` : '—', icon: Activity },
          { label: 'DB Query P95', value: metrics ? `${metrics.database?.p95Ms ?? 0}ms` : '—', icon: Database },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 space-y-2">
            <Icon className="w-4 h-4 text-slate-500" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-black text-white">{value}</p>
          </Card>
        ))}
      </div>

      {/* Services + Memory */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <SectionHeader icon={CheckCircle} title="Service Status" />
          <div className="divide-y divide-[#27272A]">
            {health?.services && Object.entries(health.services).map(([name, status]) => (
              <div key={name} className="flex items-center justify-between px-5 py-3">
                <span className="text-xs text-slate-300 font-medium capitalize">{name}</span>
                <div className="flex items-center gap-2">
                  <StatusDot ok={status === 'configured' || status === 'connected'} />
                  <span className={`text-[11px] font-semibold ${status === 'configured' || status === 'connected' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {status === 'configured' ? 'Configured' : status === 'connected' ? 'Connected' : status === 'not_configured' ? 'Not Set' : status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeader icon={Server} title="Memory" />
          <div className="p-5 space-y-3">
            {metrics && [
              { label: 'RSS', bytes: metrics.server.memory.rssBytes, total: metrics.server.memory.rssBytes },
              { label: 'Heap Used', bytes: metrics.server.memory.heapUsedBytes, total: metrics.server.memory.heapTotalBytes },
            ].map(({ label, bytes, total }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-mono text-white">{mb(bytes)} / {mb(total)}</span>
                </div>
                <div className="h-1.5 bg-[#27272A] rounded-full">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${Math.min((bytes/total)*100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Database ─────────────────────────────────────────────────────────────

function DatabaseTab({ metrics }: { metrics: MetricsData | null }) {
  const db = metrics?.database;
  const score = db?.healthScore ?? 100;
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Health Score', value: `${score}/100`, color: scoreColor },
          { label: 'Avg Query', value: `${db?.avgDurationMs ?? 0}ms` },
          { label: 'P95', value: `${db?.p95Ms ?? 0}ms` },
          { label: 'P99', value: `${db?.p99Ms ?? 0}ms` },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4">
            <p className="text-[10px] text-slate-500 uppercase">{label}</p>
            <p className={`text-2xl font-black mt-1 ${color ?? 'text-white'}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Query categories */}
      <Card>
        <SectionHeader icon={BarChart3} title="Query Categories" />
        <div className="p-5 grid grid-cols-4 gap-4">
          {[
            { key: 'fast', label: 'Fast (<100ms)', color: 'text-emerald-400' },
            { key: 'medium', label: 'Medium (100-300ms)', color: 'text-blue-400' },
            { key: 'slow', label: 'Slow (300-1s)', color: 'text-yellow-400' },
            { key: 'critical', label: 'Critical (>1s)', color: 'text-red-400' },
          ].map(({ key, label, color }) => (
            <div key={key} className="text-center">
              <p className={`text-2xl font-black ${color}`}>{db?.byCategory[key] ?? 0}</p>
              <p className="text-[10px] text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Worst queries */}
      <Card>
        <SectionHeader icon={TrendingUp} title="Worst Queries (by avg latency)" badge={db?.worstQueries.length ?? 0} />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-slate-500 border-b border-[#27272A] px-5">
              {['Query', 'Avg', 'P95/Max', 'Calls'].map(h => <th key={h} className="px-5 py-2 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-[#27272A]">
              {db?.worstQueries.map((q, i) => (
                <tr key={i}>
                  <td className="px-5 py-2.5 font-mono text-slate-300">{q.query}</td>
                  <td className={`px-5 py-2.5 font-bold ${q.avgMs > 500 ? 'text-red-400' : q.avgMs > 100 ? 'text-yellow-400' : 'text-emerald-400'}`}>{q.avgMs}ms</td>
                  <td className="px-5 py-2.5 text-slate-400">{q.maxMs}ms</td>
                  <td className="px-5 py-2.5 text-slate-400">{q.count}</td>
                </tr>
              ))}
              {(!db?.worstQueries.length) && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-600">No queries tracked yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Redis ────────────────────────────────────────────────────────────────

function RedisTab({ metrics }: { metrics: MetricsData | null }) {
  const redis = metrics?.redis;
  const health = redis?.health;
  const isConnected = health?.status === 'connected';

  return (
    <div className="space-y-6">
      {!isConnected && (
        <div className="bg-yellow-950/30 border border-yellow-900/30 rounded-xl p-4 text-xs text-yellow-300">
          Redis is {health?.status ?? 'not configured'} — metrics are using the in-memory fallback (MetricsStore). Set REDIS_URL to enable Redis.
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Status', value: health?.status ?? 'N/A', ok: isConnected },
          { label: 'Latency', value: isConnected ? `${health?.latencyMs}ms` : 'N/A' },
          { label: 'Memory', value: isConnected ? `${health?.memoryUsedMB}MB` : 'N/A' },
          { label: 'Hit Rate', value: isConnected ? (health as any)?.hitRate ?? 'N/A' : 'N/A' },
        ].map(({ label, value, ok }) => (
          <Card key={label} className="p-4">
            <p className="text-[10px] text-slate-500 uppercase">{label}</p>
            <p className={`text-xl font-black mt-1 ${ok === false ? 'text-red-400' : ok === true ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <SectionHeader icon={TrendingUp} title="Top Routes (Redis)" badge={redis?.topRoutes.length ?? 0} />
          <div className="divide-y divide-[#27272A]">
            {redis?.topRoutes.slice(0, 8).map((r, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-2.5">
                <span className="font-mono text-xs text-slate-300 truncate max-w-[200px]">{r.route}</span>
                <span className="text-xs font-bold text-blue-400">{r.calls.toLocaleString()}</span>
              </div>
            ))}
            {(!redis?.topRoutes.length) && <p className="px-5 py-6 text-xs text-slate-600 text-center">No route data in Redis</p>}
          </div>
        </Card>
        <Card>
          <SectionHeader icon={Globe} title="Most Active Workspaces" badge={redis?.topWorkspaces.length ?? 0} />
          <div className="divide-y divide-[#27272A]">
            {redis?.topWorkspaces.slice(0, 8).map((w, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-2.5">
                <span className="font-mono text-xs text-slate-300 truncate max-w-[180px]">{w.workspaceId}</span>
                <span className="text-xs font-bold text-purple-400">{w.requests.toLocaleString()}</span>
              </div>
            ))}
            {(!redis?.topWorkspaces.length) && <p className="px-5 py-6 text-xs text-slate-600 text-center">No workspace data in Redis</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Audit Logs ───────────────────────────────────────────────────────────

function AuditTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: '', userId: '', page: 0 });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: '30',
      offset: String(filter.page * 30),
      ...(filter.action ? { action: filter.action } : {}),
      ...(filter.userId ? { userId: filter.userId } : {}),
    });
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/audit-logs?${params}`, { cache: 'no-store' });
      const d = await res.json();
      setLogs(d.logs || []);
      setTotal(d.total || 0);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const exportLogs = async (fmt: 'csv' | 'json') => {
    const params = new URLSearchParams({ format: fmt, limit: '5000', ...(filter.action ? { action: filter.action } : {}) });
    window.open(`${API_URL}/api/v1/admin/audit-logs/export?${params}`);
  };

  const ACTION_COLORS: Record<string, string> = {
    AUTH_LOGIN: 'text-emerald-400 bg-emerald-950/30', AUTH_LOGOUT: 'text-slate-400 bg-slate-800/30',
    AUTH_SIGNUP: 'text-blue-400 bg-blue-950/30', AUTH_FAILED_LOGIN: 'text-red-400 bg-red-950/30',
    WIDGET_DELETE: 'text-red-400 bg-red-950/30', WIDGET_CREATE: 'text-blue-400 bg-blue-950/30',
    BILLING_UPGRADE: 'text-yellow-400 bg-yellow-950/30', SECURITY_BRUTE_FORCE: 'text-red-400 bg-red-950/30',
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Filter by action…"
          className="bg-[#18181B] border border-[#27272A] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 w-48"
          value={filter.action}
          onChange={e => setFilter(f => ({ ...f, action: e.target.value.toUpperCase(), page: 0 }))}
        />
        <input
          type="text"
          placeholder="Filter by user ID…"
          className="bg-[#18181B] border border-[#27272A] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 w-52"
          value={filter.userId}
          onChange={e => setFilter(f => ({ ...f, userId: e.target.value, page: 0 }))}
        />
        <button onClick={fetch_} className="text-xs px-3 py-2 bg-[#27272A] rounded-lg text-slate-300 hover:text-white flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
        <button onClick={() => exportLogs('csv')} className="text-xs px-3 py-2 bg-[#27272A] rounded-lg text-slate-300 hover:text-white flex items-center gap-1.5 ml-auto">
          <Download className="w-3 h-3" /> Export CSV
        </button>
        <button onClick={() => exportLogs('json')} className="text-xs px-3 py-2 bg-[#27272A] rounded-lg text-slate-300 hover:text-white flex items-center gap-1.5">
          <Download className="w-3 h-3" /> Export JSON
        </button>
      </div>

      <Card>
        <SectionHeader icon={Eye} title="Audit Log" badge={total} />
        {loading ? (
          <p className="text-center py-10 text-slate-600 text-sm">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-slate-500 border-b border-[#27272A]">
                {['Time', 'User', 'Action', 'IP', 'Details'].map(h => <th key={h} className="px-5 py-2 font-medium">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-[#27272A]">
                {logs.map(log => {
                  const colorClass = ACTION_COLORS[log.action] || 'text-slate-400 bg-slate-800/30';
                  return (
                    <tr key={log.id} className="hover:bg-[#1c1c1f]">
                      <td className="px-5 py-2.5 text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleTimeString()}</td>
                      <td className="px-5 py-2.5 text-slate-300 max-w-[120px] truncate">{log.user?.email || log.userId.slice(0, 8)}</td>
                      <td className="px-5 py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>{log.action}</span></td>
                      <td className="px-5 py-2.5 font-mono text-slate-400">{log.ipAddress || '—'}</td>
                      <td className="px-5 py-2.5 text-slate-500 max-w-[200px] truncate">{log.parsedInfo?.sev ? `sev:${log.parsedInfo.sev}` : ''}</td>
                    </tr>
                  );
                })}
                {!logs.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-600">No audit logs found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#27272A]">
          <p className="text-[11px] text-slate-500">{total} total records</p>
          <div className="flex gap-2">
            <button disabled={filter.page === 0} onClick={() => setFilter(f => ({ ...f, page: f.page - 1 }))} className="text-xs px-3 py-1.5 bg-[#27272A] rounded disabled:opacity-40 text-slate-300">← Prev</button>
            <span className="text-xs text-slate-500 px-2 py-1.5">Page {filter.page + 1}</span>
            <button disabled={logs.length < 30} onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))} className="text-xs px-3 py-1.5 bg-[#27272A] rounded disabled:opacity-40 text-slate-300">Next →</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Security ─────────────────────────────────────────────────────────────

function SecurityTab({ metrics }: { metrics: MetricsData | null }) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader icon={Shield} title="Security Events" badge={metrics?.securityEvents.length ?? 0} />
        {metrics?.securityEvents.length ? (
          <div className="divide-y divide-[#27272A]">
            {[...metrics.securityEvents].reverse().slice(0, 30).map((ev, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Lock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span className="text-xs font-semibold text-yellow-300 w-36 shrink-0">{ev.type}</span>
                <span className="text-xs font-mono text-slate-400">{ev.ip}</span>
                <span className="text-xs text-slate-500 truncate">{ev.route}</span>
                <span className="text-xs text-slate-600 ml-auto whitespace-nowrap">{new Date(ev.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-900 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No security events detected</p>
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader icon={Bug} title="Error Log" badge={metrics?.errors.length ?? 0} />
        {metrics?.errors.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-slate-500 border-b border-[#27272A]">
                {['Route', 'Message', 'Status', 'Count', 'Last Seen'].map(h => <th key={h} className="px-5 py-2 font-medium">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-[#27272A]">
                {metrics.errors.map((err, i) => (
                  <tr key={i}><td className="px-5 py-2.5 font-mono text-slate-300 max-w-[120px] truncate">{err.route}</td>
                    <td className="px-5 py-2.5 text-red-300 max-w-[200px] truncate">{err.message}</td>
                    <td className="px-5 py-2.5"><span className={`font-bold ${err.statusCode >= 500 ? 'text-red-400' : 'text-yellow-400'}`}>{err.statusCode}</span></td>
                    <td className="px-5 py-2.5 font-bold text-white">{err.count}</td>
                    <td className="px-5 py-2.5 text-slate-500">{new Date(err.lastSeen).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-900 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No errors recorded</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [tab, setTab] = useState<'overview' | 'database' | 'redis' | 'audit' | 'security'>('overview');

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [mRes, hRes] = await Promise.all([
        fetch(`${API_URL}/metrics`, { cache: 'no-store' }),
        fetch(`${API_URL}/health`, { cache: 'no-store' }),
      ]);
      const [m, h] = await Promise.all([mRes.json(), hRes.json()]);
      setMetrics(m); setHealth(h); setLastRefresh(new Date());
    } catch (e: any) { setError(e.message || 'Cannot reach backend'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); const iv = setInterval(fetchAll, 30_000); return () => clearInterval(iv); }, [fetchAll]);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'redis', label: 'Redis', icon: Zap },
    { id: 'audit', label: 'Audit Log', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" /> System Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'} · Auto-refreshes every 30s
          </p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#18181B] border border-[#27272A] text-xs text-slate-400 hover:text-white rounded-lg transition disabled:opacity-50">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{error} — Ensure backend is running at {API_URL}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#18181B] border border-[#27272A] rounded-xl p-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${tab === id ? 'bg-[#27272A] text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab health={health} metrics={metrics} loading={loading} />}
      {tab === 'database' && <DatabaseTab metrics={metrics} />}
      {tab === 'redis' && <RedisTab metrics={metrics} />}
      {tab === 'audit' && <AuditTab />}
      {tab === 'security' && <SecurityTab metrics={metrics} />}
    </div>
  );
}

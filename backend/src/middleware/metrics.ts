/**
 * Proofly In-Memory Metrics Store
 * Tracks API latency, error rates, slow queries, security events.
 * In production, replace backing store with Redis or Prometheus.
 */

interface RequestRecord {
  route: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
}

interface ErrorRecord {
  route: string;
  message: string;
  statusCode: number;
  count: number;
  firstSeen: number;
  lastSeen: number;
}

interface SecurityEvent {
  type: string;
  ip: string;
  route: string;
  timestamp: number;
}

interface JobRecord {
  queue: string;
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  retries: number;
  createdAt: number;
  completedAt?: number;
  error?: string;
}

class MetricsStore {
  private requests: RequestRecord[] = [];
  private errors: Map<string, ErrorRecord> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private jobs: Map<string, JobRecord> = new Map();
  private readonly MAX_RECORDS = 5000;
  private readonly MAX_SECURITY_EVENTS = 500;
  private serverStartTime = Date.now();

  // ─── Request Tracking ──────────────────────────────────────────────────────

  recordRequest(route: string, method: string, statusCode: number, duration: number): void {
    this.requests.push({ route, method, statusCode, duration, timestamp: Date.now() });
    if (this.requests.length > this.MAX_RECORDS) {
      this.requests.shift();
    }
  }

  recordError(route: string, message: string, statusCode: number): void {
    const key = `${statusCode}:${route}`;
    const existing = this.errors.get(key);
    if (existing) {
      existing.count++;
      existing.lastSeen = Date.now();
    } else {
      this.errors.set(key, {
        route,
        message,
        statusCode,
        count: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
      });
    }
    // Keep top 200 errors by count
    if (this.errors.size > 200) {
      const oldest = [...this.errors.entries()].sort((a, b) => a[1].lastSeen - b[1].lastSeen)[0];
      if (oldest) this.errors.delete(oldest[0]);
    }
  }

  recordSecurityEvent(type: string, ip: string, route: string): void {
    this.securityEvents.push({ type, ip, route, timestamp: Date.now() });
    if (this.securityEvents.length > this.MAX_SECURITY_EVENTS) {
      this.securityEvents.shift();
    }
  }

  // ─── Job Tracking ──────────────────────────────────────────────────────────

  jobStart(queue: string, jobId: string): void {
    this.jobs.set(jobId, {
      queue,
      jobId,
      status: 'running',
      retries: 0,
      createdAt: Date.now(),
    });
  }

  jobComplete(jobId: string, duration: number): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.duration = duration;
      job.completedAt = Date.now();
    }
  }

  jobFail(jobId: string, error: string, retries = 0): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error;
      job.retries = retries;
      job.completedAt = Date.now();
    }
  }

  // ─── Aggregated Stats ──────────────────────────────────────────────────────

  getStats() {
    const now = Date.now();
    const last5min = this.requests.filter(r => now - r.timestamp < 5 * 60 * 1000);
    const last1hr = this.requests.filter(r => now - r.timestamp < 60 * 60 * 1000);

    const avgDuration = last5min.length
      ? Math.round(last5min.reduce((s, r) => s + r.duration, 0) / last5min.length)
      : 0;

    const errorRate5min = last5min.length
      ? Math.round((last5min.filter(r => r.statusCode >= 500).length / last5min.length) * 100)
      : 0;

    // Slowest endpoints (last hour, 95th percentile)
    const routeMap: Record<string, number[]> = {};
    for (const r of last1hr) {
      if (!routeMap[r.route]) routeMap[r.route] = [];
      routeMap[r.route].push(r.duration);
    }
    const slowest = Object.entries(routeMap)
      .map(([route, durations]) => ({
        route,
        p95: durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)] ?? 0,
        avg: Math.round(durations.reduce((s, d) => s + d, 0) / durations.length),
        count: durations.length,
      }))
      .sort((a, b) => b.p95 - a.p95)
      .slice(0, 10);

    return {
      uptime: Math.floor((now - this.serverStartTime) / 1000),
      uptimeHuman: formatUptime(now - this.serverStartTime),
      requests: {
        total: this.requests.length,
        last5min: last5min.length,
        last1hr: last1hr.length,
        avgDurationMs: avgDuration,
        errorRate5minPct: errorRate5min,
      },
      slowestEndpoints: slowest,
      errors: [...this.errors.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 50),
      securityEvents: this.securityEvents.slice(-50),
      jobs: {
        total: this.jobs.size,
        completed: [...this.jobs.values()].filter(j => j.status === 'completed').length,
        failed: [...this.jobs.values()].filter(j => j.status === 'failed').length,
        running: [...this.jobs.values()].filter(j => j.status === 'running').length,
        recent: [...this.jobs.values()].slice(-20),
      },
    };
  }
}

function formatUptime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

export const metricsStore = new MetricsStore();

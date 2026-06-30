'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Sparkles,
  Link2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Settings,
  Code,
  ShieldCheck,
  Layers,
  Database,
  Terminal,
  Activity,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function IntegrationsDashboardPage() {
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections); // spaces

  const apiKeys = useStore(state => state.apiKeys);
  const webhooks = useStore(state => state.webhooks);
  const connections = useStore(state => state.connections);
  const apiLogs = useStore(state => state.apiLogs);

  const fetchApiKeys = useStore(state => state.fetchApiKeys);
  const createApiKey = useStore(state => state.createApiKey);
  const revokeApiKey = useStore(state => state.revokeApiKey);

  const fetchWebhooks = useStore(state => state.fetchWebhooks);
  const createWebhook = useStore(state => state.createWebhook);
  const deleteWebhook = useStore(state => state.deleteWebhook);

  const fetchConnections = useStore(state => state.fetchConnections);
  const connectApp = useStore(state => state.connectApp);
  const disconnectApp = useStore(state => state.disconnectApp);

  const fetchApiLogs = useStore(state => state.fetchApiLogs);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'marketplace' | 'apikeys' | 'webhooks' | 'logs'>('marketplace');

  // Form states
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['READ_TESTIMONIALS']);
  const [generatedKeyVisible, setGeneratedKeyVisible] = useState<string | null>(null);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['testimonial.created']);

  // Native app modal configurations
  const [activeConfigApp, setActiveConfigApp] = useState<string | null>(null);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [notionDatabaseId, setNotionDatabaseId] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (collections.length > 0) {
      const defaultSpace = collections[0].id;
      setSelectedSpaceId(defaultSpace);
      loadIntegrationsData(defaultSpace);
    }
  }, [collections]);

  const loadIntegrationsData = (spaceId: string) => {
    fetchApiKeys(spaceId);
    fetchWebhooks(spaceId);
    fetchConnections(spaceId);
    fetchApiLogs(spaceId);
  };

  const handleSpaceChange = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    loadIntegrationsData(spaceId);
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    if (user?.tier === 'FREE' && apiKeys.length >= 2) {
      setErrorToast('Free tier users are limited to 2 active API keys. Please upgrade to Pro.');
      setTimeout(() => setErrorToast(null), 4000);
      return;
    }

    const scopeStr = selectedScopes.join(',');
    const newKey = await createApiKey(selectedSpaceId, newKeyName, scopeStr);
    if (newKey) {
      setGeneratedKeyVisible(newKey.plainKey || null);
      setNewKeyName('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    const eventStr = webhookEvents.join(',');
    const newWh = await createWebhook(selectedSpaceId, webhookUrl, eventStr);
    if (newWh) {
      setWebhookUrl('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleConfigureSlack = async () => {
    if (!slackWebhookUrl.trim()) return;
    const config = JSON.stringify({ webhookUrl: slackWebhookUrl });
    const success = await connectApp(selectedSpaceId, 'SLACK', config);
    if (success) {
      setActiveConfigApp(null);
      setSlackWebhookUrl('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleDisconnect = async (appId: string) => {
    const success = await disconnectApp(selectedSpaceId, appId);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const toggleWebhookEvent = (event: string) => {
    if (webhookEvents.includes(event)) {
      setWebhookEvents(webhookEvents.filter(e => e !== event));
    } else {
      setWebhookEvents([...webhookEvents, event]);
    }
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 text-slate-100 font-sans">
      
      {/* Toast alerts */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-brand-emerald text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Integrations updated successfully!</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 bg-red-650 text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <Link2 className="w-5 h-5 text-brand-emerald" />
            <span>Developer Integrations Settings</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Sync Slack feeds, create scoped API credentials, and review webhook deliveries.</p>
        </div>
      </header>

      <main className="p-8 space-y-6 max-w-6xl w-full text-left">
        
        {/* Workspace selector Dropdown */}
        <div className="flex items-center space-x-3 bg-[#18181B] border border-border-primary p-4 rounded-xl shadow-md w-full max-w-md">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Select Space:</label>
          <select
            value={selectedSpaceId}
            onChange={(e) => handleSpaceChange(e.target.value)}
            className="flex-1 bg-[#09090B] border border-border-primary rounded-lg text-xs font-semibold py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
          >
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Tab Filters */}
        <div className="flex space-x-2 border-b border-border-primary/50 pb-2 select-none overflow-x-auto scrollbar-none">
          {[
            { id: 'marketplace', label: 'Connected Apps', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'apikeys', label: 'API Access Keys', icon: <Code className="w-3.5 h-3.5" /> },
            { id: 'webhooks', label: 'Webhooks target', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'logs', label: 'Developer Logs', icon: <Terminal className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 text-xs font-black uppercase px-4 py-2 border rounded-lg transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                  : 'bg-[#18181B] text-slate-400 border-border-primary hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: CONNECTED APPS */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* SLACK CARD */}
              <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 flex flex-col justify-between h-56 shadow-xl hover:border-zinc-800 transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">Slack Channel Feed</span>
                    {connections.find(c => c.appId === 'SLACK') ? (
                      <span className="text-[9px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/25 px-2 py-0.5 rounded-full font-bold uppercase">Connected</span>
                    ) : (
                      <span className="text-[9px] bg-zinc-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">Not Configured</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Post real-time messages directly into your Slack channel when new reviews are approved.</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveConfigApp('SLACK')}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-bold py-2 rounded-lg text-slate-200 transition cursor-pointer"
                  >
                    Configure
                  </button>
                  {connections.find(c => c.appId === 'SLACK') && (
                    <button
                      onClick={() => handleDisconnect('SLACK')}
                      className="bg-red-950/30 hover:bg-red-950/60 border border-red-900/30 p-2 rounded-lg text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* NOTION CARD */}
              <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 flex flex-col justify-between h-56 shadow-xl hover:border-zinc-800 transition opacity-85">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">Notion Database Logs</span>
                    <span className="text-[9px] bg-zinc-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">Pro</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Automatically log submitted customer details and star ratings directly into your Notion table.</p>
                </div>
                <button
                  disabled
                  className="w-full bg-zinc-800 opacity-50 text-xs font-bold py-2 rounded-lg text-slate-400 border border-zinc-750 cursor-not-allowed"
                >
                  Connect Notion
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: API KEYS */}
        {activeTab === 'apikeys' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* API Keys grid */}
            <div className="lg:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Active API Keys</h3>
              
              {generatedKeyVisible && (
                <div className="p-4 bg-brand-emerald/5 border border-brand-emerald/20 rounded-xl space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-brand-emerald flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Copy generated key token (Visible Once)</span>
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedKeyVisible}
                      className="flex-1 bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-brand-teal outline-none font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedKeyVisible, 'visible_key')}
                      className="bg-brand-emerald text-white p-2 rounded-lg hover:opacity-90"
                    >
                      {copiedId === 'visible_key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <button 
                    onClick={() => setGeneratedKeyVisible(null)}
                    className="text-[10px] text-slate-400 hover:text-white underline"
                  >
                    Done, Close Panel
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-bold border border-dashed border-border-primary rounded-xl">
                    No active credentials configured yet. Register one on the side panel.
                  </div>
                ) : (
                  apiKeys.map(key => (
                    <div key={key.id} className="bg-[#09090B] border border-border-primary rounded-xl p-4 flex items-center justify-between hover:border-zinc-800 transition">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white leading-none">{key.name}</span>
                        <div className="flex gap-2 pt-1 font-mono text-[9px] text-slate-450">
                          <span>Prefix: {key.prefix}...</span>
                          <span>•</span>
                          <span className="bg-zinc-900 border border-zinc-850 px-1 py-0.5 rounded text-brand-teal font-black">{key.scopes}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => revokeApiKey(key.id)}
                        className="bg-red-950/20 hover:bg-red-950/50 border border-red-900/20 p-2 rounded-lg text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* API Keys form creator */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl text-left">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Generate API Key</h3>
              <form onSubmit={handleCreateApiKey} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Key Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production server read hook"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Key Scopes (Permissions)</label>
                  <div className="space-y-2">
                    {[
                      { id: 'READ_TESTIMONIALS', label: 'Read testimonial reviews' },
                      { id: 'WRITE_TESTIMONIALS', label: 'Write testimonial reviews' },
                      { id: 'READ_WIDGETS', label: 'Read widget configs' },
                      { id: 'READ_SPACES', label: 'Read space details' }
                    ].map(scope => (
                      <label key={scope.id} className="flex items-center space-x-2.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope.id)}
                          onChange={() => toggleScope(scope.id)}
                          className="accent-brand-emerald"
                        />
                        <span className="text-slate-350">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition shadow-md shadow-brand-emerald/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Key</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 3: WEBHOOK SUBSCRIPTIONS */}
        {activeTab === 'webhooks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Active webhooks list */}
            <div className="lg:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Outgoing Webhooks Target</h3>
              <div className="space-y-4">
                {webhooks.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-bold border border-dashed border-border-primary rounded-xl">
                    No active webhook listeners. Create one on the side creator.
                  </div>
                ) : (
                  webhooks.map(wh => (
                    <div key={wh.id} className="bg-[#09090B] border border-border-primary rounded-xl p-4 space-y-3 hover:border-zinc-800 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{wh.targetUrl}</span>
                        <button
                          onClick={() => deleteWebhook(wh.id)}
                          className="bg-red-950/20 hover:bg-red-950/50 border border-red-900/20 p-1.5 rounded-lg text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                        <div className="flex gap-2">
                          <span className="text-[9px] bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-slate-450 font-mono">Secret: {wh.secret}</span>
                          <span className="text-[9px] bg-brand-emerald/10 px-2 py-0.5 rounded text-brand-emerald font-bold uppercase">{wh.events}</span>
                        </div>
                      </div>

                      {/* Log lists */}
                      {wh.logs && wh.logs.length > 0 && (
                        <div className="pt-3 border-t border-zinc-900 space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-500">Recent Deliveries:</span>
                          <div className="space-y-1">
                            {wh.logs.map(log => (
                              <div key={log.id} className="flex justify-between text-[10px] bg-zinc-900/40 p-1 rounded font-mono">
                                <span className="text-slate-350">{log.event}</span>
                                <div className="space-x-3 text-slate-400">
                                  <span>{log.duration}ms</span>
                                  <span className={log.statusCode < 300 ? 'text-brand-emerald font-bold' : 'text-red-400 font-bold'}>
                                    Status {log.statusCode}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Create Webhook subscription */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl text-left">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Add Webhook Listener</h3>
              <form onSubmit={handleCreateWebhook} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Endpoint URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.yourdomain.com/hooks"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Event Topics</label>
                  <div className="space-y-2">
                    {[
                      { id: 'testimonial.created', label: 'Testimonial Created' },
                      { id: 'testimonial.approved', label: 'Testimonial Approved' },
                      { id: 'widget.created', label: 'Widget Created' }
                    ].map(ev => (
                      <label key={ev.id} className="flex items-center space-x-2.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={webhookEvents.includes(ev.id)}
                          onChange={() => toggleWebhookEvent(ev.id)}
                          className="accent-brand-emerald"
                        />
                        <span className="text-slate-350">{ev.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Subscribe Endpoint</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 4: DEVELOPER REQUEST LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl text-left">
            <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Developer Requests Audit Trail</h3>
            
            <div className="overflow-x-auto select-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-primary text-[10px] text-slate-400 font-black uppercase tracking-wider">
                    <th className="py-3 px-2">Method</th>
                    <th className="py-3 px-2">Endpoint</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Duration</th>
                    <th className="py-3 px-2">IP Address</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {apiLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 font-bold">No API request logs recorded yet.</td>
                    </tr>
                  ) : (
                    apiLogs.map(log => (
                      <tr key={log.id} className="border-b border-border-primary/40 hover:bg-[#202024] transition font-mono">
                        <td className="py-3 px-2">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            log.method === 'POST' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-teal/10 text-brand-teal'
                          }`}>{log.method}</span>
                        </td>
                        <td className="py-3 px-2 text-white font-bold">{log.endpoint}</td>
                        <td className={`py-3 px-2 font-black ${log.statusCode < 300 ? 'text-brand-emerald' : 'text-red-400'}`}>{log.statusCode}</td>
                        <td className="py-3 px-2 text-slate-400">{log.duration}ms</td>
                        <td className="py-3 px-2 text-slate-400">{log.ipAddress || 'unknown'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ─── SLACK CONFIGURATION DIALOG MODAL ────────────────────────────────────── */}
      {activeConfigApp === 'SLACK' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm select-none">
          <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl w-full max-w-md shadow-2xl relative text-left">
            <button
              onClick={() => setActiveConfigApp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-white text-sm font-black uppercase">Configure Slack Webhook</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Paste your Slack incoming webhook URL to post approved testimonials directly.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Webhook URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhookUrl}
                  onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2.5 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                />
              </div>

              <button
                onClick={handleConfigureSlack}
                className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
              >
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

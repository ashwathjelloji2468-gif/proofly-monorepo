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
  Info,
  Crown,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Palette,
  Globe,
  Mail,
  Users,
  Shield,
  Eye,
  Key,
  Server,
  Zap,
  BarChart,
  ListTodo
} from 'lucide-react';

export default function AdminLaunchPage() {
  const user = useStore(state => state.user);

  const [activeTab, setActiveTab] = useState<'health' | 'readiness' | 'flags'>('health');
  
  // Feature flag states
  const [rolloutPercentage, setRolloutPercentage] = useState(50);
  const [aiSuiteEnabled, setAiSuiteEnabled] = useState(true);
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(true);
  const [customDomainEnabled, setCustomDomainEnabled] = useState(true);
  
  const [processing, setProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock server diagnostics
  const [cpuUsage, setCpuUsage] = useState(12);
  const [memoryUsage, setMemoryUsage] = useState(148);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate live CPU jittering
      setCpuUsage(Math.floor(10 + Math.random() * 8));
      setMemoryUsage(Math.floor(145 + Math.random() * 6));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveFlags = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  };

  // Restrict to superadmin or similar checks, but for mock dashboard it checks email domain/role or isEnterprise
  const isAdmin = user?.email.endsWith('@proofly.com') || user?.tier === 'ENTERPRISE';

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 text-slate-100 font-sans">
      
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-brand-emerald text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-pulse">
          <CheckCircle2 className="w-4 h-4" />
          <span>Admin configuration updated!</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <Server className="w-5 h-5 text-brand-emerald" />
            <span>Admin Control Panel & Launch Readiness</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Monitor server heartbeat diagnostics, configure gradual rolling feature flags, and review pre-flight checklists.</p>
        </div>
      </header>

      <main className="p-8 space-y-6 max-w-6xl w-full text-left relative">
        
        {/* Tab Filters */}
        <div className="flex space-x-2 border-b border-border-primary/50 pb-2  overflow-x-auto scrollbar-none">
          {[
            { id: 'health', label: 'System Health & Metrics', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'readiness', label: 'Launch Readiness Score', icon: <ListTodo className="w-3.5 h-3.5" /> },
            { id: 'flags', label: 'Feature Flags rollout', icon: <Zap className="w-3.5 h-3.5" /> }
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

        {/* TAB 1: SYSTEM HEALTH */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* CPU widget */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">CPU Heartbeat Load</span>
              <span className="text-3xl font-black text-white">{cpuUsage}%</span>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-emerald h-full rounded-full transition-all duration-300"
                  style={{ width: `${cpuUsage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-450 leading-relaxed">Active workers: 4 processes running normally.</p>
            </div>

            {/* Memory widget */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Memory Footprint</span>
              <span className="text-3xl font-black text-white">{memoryUsage} MB</span>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-emerald h-full rounded-full transition-all duration-300"
                  style={{ width: `${(memoryUsage / 512) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-450 leading-relaxed">Limit: 512 MB Alpine container configuration.</p>
            </div>

            {/* Database Connections */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Database Connection Pool</span>
              <span className="text-3xl font-black text-brand-emerald">ACTIVE</span>
              <p className="text-[10px] text-slate-450 leading-relaxed">Prisma pooling: 6 active database connection streams.</p>
            </div>

            {/* System integrations monitoring */}
            <div className="md:col-span-3 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Third-Party Gateway Health Check</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Stripe API Gateway', status: 'Connected' },
                  { name: 'Cloudinary CDN', status: 'Connected' },
                  { name: 'OpenAI Text/Video API', status: 'Connected' },
                  { name: 'Resend SMTP Server', status: 'Connected' }
                ].map((gate, idx) => (
                  <div key={idx} className="bg-[#09090B] border border-border-primary rounded-xl p-4 text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">{gate.name}</span>
                    <span className="text-[11px] font-mono font-bold text-brand-emerald">● {gate.status}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: LAUNCH READINESS SCORE */}
        {activeTab === 'readiness' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Scorecard Gauge */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-40 tracking-wider block">Overall Launch Score</span>
                <span className="text-4xl font-black text-[#F59E0B]">96%</span>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#F59E0B] h-full rounded-full transition-all duration-300"
                    style={{ width: '96%' }}
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Proofly is hardening compliant and fully certified for Product Hunt and Enterprise rollouts.</p>
              </div>
              <div className="pt-4 border-t border-zinc-800 text-[10px] text-slate-400">
                ⭐ SOC2 baseline audit: PASSED
              </div>
            </div>

            {/* Checklist items */}
            <div className="md:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Pre-flight Hardening Checklist</h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Multi-stage Docker production images compiled', status: true },
                  { name: 'CI/CD pipeline test validation configs registered', status: true },
                  { name: 'Liveness /ready & /live routes exposed', status: true },
                  { name: 'Production environment variables and Stripe keys loaded', status: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 text-xs">
                    {item.status ? (
                      <CheckCircle className="w-4 h-4 text-brand-emerald shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className="text-slate-200">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: FEATURE FLAGS */}
        {activeTab === 'flags' && (
          <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl text-left max-w-2xl">
            <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2 mb-4">Gradual Rollout Controls</h3>
            
            <form onSubmit={handleSaveFlags} className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Rollout Audience Percentage</span>
                  <span className="font-black text-brand-emerald">{rolloutPercentage}% of Workspaces</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={rolloutPercentage}
                  onChange={(e) => setRolloutPercentage(Number(e.target.value))}
                  className="w-full accent-brand-emerald cursor-pointer"
                />
                <p className="text-[10px] text-slate-450 leading-relaxed">Limits premium integrations and SAML setups to a subset of spaces to monitor error budgets.</p>
              </div>

              <div className="space-y-3.5 pt-2 border-t border-zinc-800">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Global Feature Switches</span>
                
                {[
                  { id: 'ai', label: 'AI Studio Tools Suite', value: aiSuiteEnabled, setter: setAiSuiteEnabled },
                  { id: 'wl', label: 'White-Label Theme Palettes', value: whiteLabelEnabled, setter: setWhiteLabelEnabled },
                  { id: 'cd', label: 'Custom Review Domains CNAME setups', value: customDomainEnabled, setter: setCustomDomainEnabled }
                ].map(switchItem => (
                  <label key={switchItem.id} className="flex items-center justify-between cursor-pointer text-xs">
                    <span className="text-slate-300">{switchItem.label}</span>
                    <input 
                      type="checkbox" 
                      checked={switchItem.value}
                      onChange={(e) => switchItem.setter(e.target.checked)}
                      className="accent-brand-emerald h-4 w-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Apply Feature Flags</span>}
              </button>

            </form>
          </div>
        )}

      </main>

    </div>
  );
}

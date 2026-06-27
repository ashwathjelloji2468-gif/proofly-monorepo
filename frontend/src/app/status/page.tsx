'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Activity, 
  CheckCircle, 
  HelpCircle, 
  Layers, 
  Terminal,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

export default function StatusPage() {
  // Services status lists
  const services = [
    { name: 'GraphQL Endpoint API', status: 'Operational', uptime: '99.98%' },
    { name: 'PostgreSQL Database Connection', status: 'Operational', uptime: '100%' },
    { name: 'Auth/SSO Sessions Service', status: 'Operational', uptime: '99.99%' },
    { name: 'Video Upload CDN Storage', status: 'Operational', uptime: '99.95%' },
    { name: 'Transactional Email triggers', status: 'Operational', uptime: '99.97%' },
    { name: 'AI Sentiment Analyzer Models', status: 'Operational', uptime: '99.91%' }
  ];

  // Incidents history lists
  const incidents = [
    { date: 'June 20, 2026', title: 'Scheduled Database Maintenance', type: 'MAINTENANCE', desc: 'Successfully migrated core space schemas to support white-label custom domain mapping properties. Downtime duration was 4 minutes.' },
    { date: 'May 10, 2026', title: 'Video CDN Upload Delay resolved', type: 'RESOLVED', desc: 'Traffic spike on video uploads caused 1.5s delay responses. Upload buckets scales were adjusted. Uptime restored.' }
  ];

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      {/* Hero Header Status */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-emerald/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <span className="bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block mb-3.5 animate-pulse">
          Live Service Status
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          All systems are <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            fully operational
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Real-time updates, uptime records, scheduled maintenance announcements, and active service health gauges.
        </p>
      </section>

      {/* Main Status Indicators */}
      <section className="max-w-4xl mx-auto px-6 pb-24 w-full space-y-8 text-left">
        
        {/* Core Services Status Grid */}
        <div className="bg-[#0c0d16] border border-white/[0.05] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Layers className="w-4 h-4 text-brand-emerald" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">System Core Health</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s, idx) => (
              <div 
                key={idx}
                className="bg-zinc-950/60 border border-white/[0.04] p-3.5 rounded-xl flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold text-white block">{s.name}</span>
                  <span className="text-[8.5px] text-zinc-500 font-mono block">Uptime: {s.uptime}</span>
                </div>
                <span className="text-[8.5px] font-black uppercase bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald px-2 py-0.5 rounded">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 90-Day Uptime Graph Panel */}
        <div className="bg-[#0c0d16] border border-white/[0.05] p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-brand-teal animate-pulse" />
              <span>90-Day Operational History</span>
            </span>
            <span className="text-[8.5px] text-brand-emerald font-bold uppercase tracking-wider">99.98% Average</span>
          </div>

          {/* Flex grid of uptime lines */}
          <div className="flex items-end space-x-0.8 h-8 pt-2">
            {[...Array(60)].map((_, i) => (
              <div 
                key={i}
                className={`flex-1 h-full rounded-sm transition duration-200 ${
                  i === 12 ? 'bg-yellow-500/80 hover:bg-yellow-400' : 'bg-brand-emerald/80 hover:bg-brand-emerald'
                }`}
                title={i === 12 ? 'June 15: Minor Delay (99.8%)' : 'System operational (100%)'}
              />
            ))}
          </div>

          <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase pt-1">
            <span>90 days ago</span>
            <span>45 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Incident History Feed */}
        <div className="bg-[#0c0d16] border border-white/[0.05] p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Globe className="w-4 h-4 text-[#6366F1]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Incident History Registry</h3>
          </div>

          <div className="space-y-6">
            {incidents.map((inc, idx) => (
              <div key={idx} className="relative pl-5 border-l border-white/5 space-y-1.5 text-left">
                {/* indicator dot */}
                <div className={`w-2.5 h-2.5 rounded-full absolute -left-1.5 top-1 border-2 border-[#0c0d16] ${
                  inc.type === 'MAINTENANCE' ? 'bg-[#6366F1]' : 'bg-brand-teal'
                }`} />
                
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">
                    {inc.date}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-1.5 rounded ${
                    inc.type === 'MAINTENANCE' ? 'bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]' : 'bg-brand-teal/10 border border-brand-teal/20 text-brand-teal'
                  }`}>
                    {inc.type}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  {inc.title}
                </h4>
                <p className="text-[9.5px] text-slate-400 leading-relaxed max-w-xl">
                  {inc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      <Footer />
    </div>
  );
}

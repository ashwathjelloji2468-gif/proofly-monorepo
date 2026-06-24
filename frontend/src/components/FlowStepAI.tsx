'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Activity, 
  Settings, 
  Code, 
  Check, 
  Database, 
  Video, 
  Cpu, 
  Layout, 
  ChevronRight, 
  RefreshCw, 
  HelpCircle,
  Copy,
  MessageSquare,
  Globe
} from 'lucide-react';

interface NodeSettings {
  trigger: {
    slackAlerts: boolean;
    autoTag: boolean;
  };
  collector: {
    rewardCoupon: number;
    webcamRequired: boolean;
  };
  ai: {
    language: 'en' | 'es' | 'fr' | 'de';
    minSentiment: number;
  };
  showcase: {
    theme: 'dark' | 'light';
    layout: 'grid' | 'carousel' | 'masonry';
  };
}

const initialSettings: NodeSettings = {
  trigger: {
    slackAlerts: true,
    autoTag: true
  },
  collector: {
    rewardCoupon: 15,
    webcamRequired: true
  },
  ai: {
    language: 'en',
    minSentiment: 75
  },
  showcase: {
    theme: 'dark',
    layout: 'masonry'
  }
};

const presets = [
  {
    id: 'saas',
    prompt: 'Stripe payments ➔ Reward coupon page ➔ AI Transcriber ➔ Wall of Love grid',
    title: 'SaaS Onboarding Feedback Loop',
    trigger: 'Stripe Payment Succeeded',
    collector: 'Webcam Collector (15% Off)',
    ai: 'AI Transcribe (English) + Sentiment Match',
    showcase: 'Wall of Love (Dark Grid)'
  },
  {
    id: 'ecommerce',
    prompt: 'Shopify checkout ➔ Email review prompt ➔ Sentiment filter ➔ Shopify Carousel',
    title: 'E-commerce Purchase Collection',
    trigger: 'Shopify Order Completed',
    collector: 'Email Rating Scale Collector',
    ai: 'Sentiment Filter (>80%) + Tagging',
    showcase: 'Shopify Carousel Widget'
  },
  {
    id: 'github',
    prompt: 'GitHub stars ➔ Floating feedback prompt ➔ AI quote summarizer ➔ Twitter bot post',
    title: 'Open Source Community Growth',
    trigger: 'GitHub star webhook',
    collector: 'Interactive Floating Prompt',
    ai: 'Highlight Summarizer (140-char)',
    showcase: 'Twitter Automated Share Widget'
  }
];

export function FlowStepAI() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState<'saas' | 'ecommerce' | 'github' | null>('saas');
  const [selectedNodeId, setSelectedNodeId] = useState<'trigger' | 'collector' | 'ai' | 'showcase' | null>('trigger');
  const [nodeSettings, setNodeSettings] = useState<NodeSettings>(initialSettings);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'System initialized. Waiting for user prompt.'
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const handleTriggerFlow = (flowId: 'saas' | 'ecommerce' | 'github', promptText: string) => {
    setIsGenerating(true);
    setPrompt(promptText);
    addLog(`AI parsing flow query: "${promptText}"`);
    
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setActiveFlowId(flowId);
      setSelectedNodeId('trigger');
      addLog(`Generated Flow: ${presets.find(p => p.id === flowId)?.title}`);
    }, 1500);
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    addLog(`AI analyzing custom flow prompt: "${prompt}"`);

    setTimeout(() => {
      setIsGenerating(false);
      // Map to SaaS or random preset for mockup completeness
      const randomPreset = presets[Math.floor(Math.random() * presets.length)].id as any;
      setActiveFlowId(randomPreset);
      setSelectedNodeId('trigger');
      addLog(`Created Custom Journey: "${prompt}"`);
    }, 1800);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get active flow data
  const currentFlow = presets.find(p => p.id === activeFlowId) || presets[0];

  // Dynamic code generator based on settings state
  const getCodeSnippet = () => {
    switch (selectedNodeId) {
      case 'trigger':
        return `// Stripe Webhook Event Trigger
app.post('/api/webhook', async (req, res) => {
  const event = req.body;
  if (event.type === 'payment_intent.succeeded') {
    await Proofly.triggerJourney({
      email: event.data.customer_email,
      spaceId: 'acme-saas-suite',
      slackNotify: ${nodeSettings.trigger.slackAlerts},
      autoTag: ${nodeSettings.trigger.autoTag}
    });
  }
  res.json({ received: true });
});`;
      case 'collector':
        return `// React Review Collector Widget
import { TestimonialCollector } from '@proofly/react';

export default function ReviewPage() {
  return (
    <TestimonialCollector 
      spaceSlug="acme-saas" 
      webcamEnabled={${nodeSettings.collector.webcamRequired}}
      incentiveCoupon="${nodeSettings.collector.rewardCoupon}% OFF"
    />
  );
}`;
      case 'ai':
        return `// AI Processing Engine API
const review = await Proofly.process(reviewId, {
  transcribe: true,
  transcribeLang: "${nodeSettings.ai.language}",
  minConfidence: ${nodeSettings.ai.minSentiment}
});`;
      case 'showcase':
        return `<!-- Responsive Wall of Love iFrame Embed -->
<iframe 
  src="https://proofly.com/embed/acme-saas?theme=${nodeSettings.showcase.theme}&layout=${nodeSettings.showcase.layout}" 
  width="100%" 
  height="600px" 
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #20223f;"
></iframe>`;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-12 relative font-sans">
      
      {/* Inline Flow CSS styles for animated dash Bezier curves */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .flow-line-animated {
          stroke-dasharray: 8, 6;
          animation: flowDash 0.8s linear infinite;
        }
      `}} />

      {/* Title Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-400 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FlowStep AI Engine</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
          Prompt to Journeys Builder
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          FlowStep AI visually generates app review funnels in seconds. Tweak nodes, adjust thresholds, and grab generated React/HTML components for your startup.
        </p>
      </div>

      {/* Main visual panel layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-gradient-to-br from-[#0c0d1b] to-[#07080f] border border-[#2b2c4e] p-5 md:p-8 rounded-3xl backdrop-blur-md shadow-[0_15px_50px_rgba(99,102,241,0.06)] relative overflow-hidden text-left">
        
        {/* Prompts Input Panel (Left column) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase text-[#818cf8] tracking-widest block">AI Flow Generator</span>
            
            {/* Custom Input Form */}
            <form onSubmit={handleCustomPromptSubmit} className="relative">
              <input
                type="text"
                placeholder="Describe your review flow query..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-[#080911]/90 border border-[#1f213a] p-3 text-xs text-white rounded-xl outline-none focus:border-[#4f46e5] pr-10 placeholder-zinc-650 transition"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1.5 w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center text-white cursor-pointer hover:bg-indigo-600 transition"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Template Presets */}
            <div className="space-y-2.5">
              <span className="text-[8px] font-bold text-zinc-550 uppercase tracking-widest block">Startup Flow Presets</span>
              {presets.map((p) => {
                const isActive = activeFlowId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleTriggerFlow(p.id as any, p.prompt)}
                    className={`w-full p-4 rounded-xl border text-left cursor-pointer transition ${
                      isActive 
                        ? 'bg-[#181635]/40 border-[#4f46e5]/60 shadow-[0_0_15px_rgba(99,102,241,0.1)] ring-1 ring-[#6366f1]/20'
                        : 'bg-transparent border-[#1f213a]/30 hover:bg-[#15162a]/30 hover:border-[#383a69]/40'
                    }`}
                  >
                    <span className="text-xs font-black text-white block">{p.title}</span>
                    <span className="text-[9px] text-slate-450 leading-relaxed block mt-1 line-clamp-1">{p.prompt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time telemetry console */}
          <div className="bg-[#05060b] border border-[#1f213a] rounded-xl p-3.5 font-mono text-[9px] text-slate-400 space-y-2 select-none">
            <span className="text-indigo-400 font-extrabold uppercase text-[8px] tracking-widest block mb-1">Telemetry Console</span>
            <div className="space-y-1 max-h-[85px] overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-1">
                  <span className="text-zinc-650 shrink-0">&gt;</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Canvas Viewport (Right column) */}
        <div className="lg:col-span-8 bg-[#090912]/80 border border-[#1f213a] rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl relative min-h-[460px]">
          
          {/* Canvas Header bar */}
          <div className="flex items-center justify-between border-b border-[#1f213a] px-4 py-3 bg-[#0d0e1b]">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/80" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
              <div className="w-2 h-2 rounded-full bg-green-500/80" />
            </div>
            <span className="text-[8px] font-mono text-[#818cf8] uppercase tracking-widest flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>Interactive flow steps canvas</span>
            </span>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-6 flex flex-col justify-between relative min-h-[300px]">
            
            {/* Loader animation overlay */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#090912]/90 z-40 flex flex-col items-center justify-center space-y-4"
                >
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <span className="text-xs font-mono text-indigo-300 animate-pulse uppercase tracking-wider">FlowStep AI rendering nodes...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas Nodes Grid */}
            <div className="grid grid-cols-4 gap-4 relative z-10 py-6 items-center">
              
              {/* Connecting SVGs Container Overlay */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Neon Indigo to Teal Gradients */}
                  <defs>
                    <linearGradient id="neonLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6C5CFF" />
                      <stop offset="50%" stopColor="#8677FF" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                  
                  {/* Path 1: Trigger to Collector */}
                  <path 
                    d="M 120 100 C 180 100, 180 100, 210 100" 
                    fill="none" 
                    stroke="url(#neonLineGrad)" 
                    strokeWidth="2.5"
                    className="flow-line-animated"
                  />
                  
                  {/* Path 2: Collector to AI */}
                  <path 
                    d="M 270 100 C 330 100, 330 100, 360 100" 
                    fill="none" 
                    stroke="url(#neonLineGrad)" 
                    strokeWidth="2.5"
                    className="flow-line-animated"
                  />
                  
                  {/* Path 3: AI to Showcase */}
                  <path 
                    d="M 420 100 C 480 100, 480 100, 510 100" 
                    fill="none" 
                    stroke="url(#neonLineGrad)" 
                    strokeWidth="2.5"
                    className="flow-line-animated"
                  />
                </svg>
              </div>

              {/* Node 1: Trigger */}
              <div className="z-10 flex justify-center">
                <button
                  onClick={() => { setSelectedNodeId('trigger'); addLog('Inspecting Trigger webhook settings'); }}
                  className={`p-3.5 rounded-xl border text-center flex flex-col items-center space-y-2 cursor-pointer w-24 h-24 justify-center shadow-lg transition duration-300 ${
                    selectedNodeId === 'trigger'
                      ? 'bg-[#181635] border-[#4f46e5]/60 ring-2 ring-[#6366f1]/20 scale-105'
                      : 'bg-[#0c0d1b] border-[#1f213a] hover:border-indigo-500/30'
                  }`}
                >
                  <Database className="w-5 h-5 text-indigo-400" />
                  <span className="text-[8px] font-black text-white uppercase tracking-wider block leading-tight">{currentFlow.trigger}</span>
                  <span className="text-[6px] text-zinc-550 block font-bold">TRIGGER</span>
                </button>
              </div>

              {/* Node 2: Collector */}
              <div className="z-10 flex justify-center">
                <button
                  onClick={() => { setSelectedNodeId('collector'); addLog('Inspecting Review Collector parameters'); }}
                  className={`p-3.5 rounded-xl border text-center flex flex-col items-center space-y-2 cursor-pointer w-24 h-24 justify-center shadow-lg transition duration-300 ${
                    selectedNodeId === 'collector'
                      ? 'bg-brand-teal/10 border-[#8677FF]/60 ring-2 ring-[#8677FF]/20 scale-105'
                      : 'bg-[#0c0d1b] border-[#1f213a] hover:border-brand-teal/30'
                  }`}
                >
                  <Video className="w-5 h-5 text-brand-teal" />
                  <span className="text-[8px] font-black text-white uppercase tracking-wider block leading-tight">{currentFlow.collector}</span>
                  <span className="text-[6px] text-zinc-550 block font-bold">COLLECTION</span>
                </button>
              </div>

              {/* Node 3: AI Pipeline */}
              <div className="z-10 flex justify-center">
                <button
                  onClick={() => { setSelectedNodeId('ai'); addLog('Inspecting AI analysis settings'); }}
                  className={`p-3.5 rounded-xl border text-center flex flex-col items-center space-y-2 cursor-pointer w-24 h-24 justify-center shadow-lg transition duration-300 ${
                    selectedNodeId === 'ai'
                      ? 'bg-brand-emerald/10 border-[#6C5CFF]/60 ring-2 ring-[#6C5CFF]/20 scale-105'
                      : 'bg-[#0c0d1b] border-[#1f213a] hover:border-brand-emerald/30'
                  }`}
                >
                  <Cpu className="w-5 h-5 text-brand-emerald" />
                  <span className="text-[8px] font-black text-white uppercase tracking-wider block leading-tight">{currentFlow.ai}</span>
                  <span className="text-[6px] text-zinc-550 block font-bold">AI PIPELINE</span>
                </button>
              </div>

              {/* Node 4: Showcase Display */}
              <div className="z-10 flex justify-center">
                <button
                  onClick={() => { setSelectedNodeId('showcase'); addLog('Inspecting Showcase Widget theme'); }}
                  className={`p-3.5 rounded-xl border text-center flex flex-col items-center space-y-2 cursor-pointer w-24 h-24 justify-center shadow-lg transition duration-300 ${
                    selectedNodeId === 'showcase'
                      ? 'bg-[#352515] border-[#f59e0b]/60 ring-2 ring-[#f59e0b]/20 scale-105'
                      : 'bg-[#0c0d1b] border-[#1f213a] hover:border-amber-500/30'
                  }`}
                >
                  <Layout className="w-5 h-5 text-amber-400" />
                  <span className="text-[8px] font-black text-white uppercase tracking-wider block leading-tight">{currentFlow.showcase}</span>
                  <span className="text-[6px] text-zinc-550 block font-bold">SHOWCASE</span>
                </button>
              </div>

            </div>

            {/* Config details & developer code section at bottom */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-[#1f213a] pt-4 items-stretch select-none z-10 bg-[#090912]/95 rounded-b-xl">
              
              {/* Form settings controls (col 5) */}
              <div className="md:col-span-5 space-y-3 pr-2 border-r border-[#1f213a]/50">
                <div className="flex items-center space-x-1.5">
                  <Settings className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">Node parameters</span>
                </div>

                <div className="space-y-2.5">
                  {selectedNodeId === 'trigger' && (
                    <>
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span>Send Slack Alerts</span>
                        <input
                          type="checkbox"
                          checked={nodeSettings.trigger.slackAlerts}
                          onChange={(e) => {
                            setNodeSettings(prev => ({ ...prev, trigger: { ...prev.trigger, slackAlerts: e.target.checked } }));
                            addLog(`Slack Notify toggled: ${e.target.checked}`);
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span>Auto-Tag Customers</span>
                        <input
                          type="checkbox"
                          checked={nodeSettings.trigger.autoTag}
                          onChange={(e) => {
                            setNodeSettings(prev => ({ ...prev, trigger: { ...prev.trigger, autoTag: e.target.checked } }));
                            addLog(`Auto-Tagging toggled: ${e.target.checked}`);
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {selectedNodeId === 'collector' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Incentive Reward Coupon</span>
                          <span className="font-mono text-white">{nodeSettings.collector.rewardCoupon}% OFF</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="40"
                          step="5"
                          value={nodeSettings.collector.rewardCoupon}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNodeSettings(prev => ({ ...prev, collector: { ...prev.collector, rewardCoupon: val } }));
                            addLog(`Collector Incentive Coupon changed: ${val}%`);
                          }}
                          className="w-full cursor-pointer h-1.5 bg-zinc-800 rounded-lg accent-brand-teal"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span>Require Webcam Capture</span>
                        <input
                          type="checkbox"
                          checked={nodeSettings.collector.webcamRequired}
                          onChange={(e) => {
                            setNodeSettings(prev => ({ ...prev, collector: { ...prev.collector, webcamRequired: e.target.checked } }));
                            addLog(`Require Webcam changed: ${e.target.checked}`);
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {selectedNodeId === 'ai' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold block uppercase">Transcription Language</label>
                        <select
                          value={nodeSettings.ai.language}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setNodeSettings(prev => ({ ...prev, ai: { ...prev.ai, language: val } }));
                            addLog(`AI language filter set: ${val}`);
                          }}
                          className="w-full bg-[#080911] border border-[#1f213a] text-xs text-white p-1 rounded outline-none"
                        >
                          <option value="en">English (default)</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Min Sentiment Threshold</span>
                          <span className="font-mono text-white">{nodeSettings.ai.minSentiment}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="95"
                          step="5"
                          value={nodeSettings.ai.minSentiment}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNodeSettings(prev => ({ ...prev, ai: { ...prev.ai, minSentiment: val } }));
                            addLog(`AI Minimum Sentiment Threshold set: ${val}%`);
                          }}
                          className="w-full cursor-pointer h-1.5 bg-zinc-800 rounded-lg accent-brand-emerald"
                        />
                      </div>
                    </>
                  )}

                  {selectedNodeId === 'showcase' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold block uppercase">Widget Layout</label>
                        <select
                          value={nodeSettings.showcase.layout}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setNodeSettings(prev => ({ ...prev, showcase: { ...prev.showcase, layout: val } }));
                            addLog(`Showcase layout set: ${val}`);
                          }}
                          className="w-full bg-[#080911] border border-[#1f213a] text-xs text-white p-1 rounded outline-none"
                        >
                          <option value="masonry">Masonry Grid</option>
                          <option value="grid">Aligned Grid</option>
                          <option value="carousel">Interactive Carousel</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1">
                        <span>Showcase Dark Mode Theme</span>
                        <input
                          type="checkbox"
                          checked={nodeSettings.showcase.theme === 'dark'}
                          onChange={(e) => {
                            const val = e.target.checked ? 'dark' : 'light';
                            setNodeSettings(prev => ({ ...prev, showcase: { ...prev.showcase, theme: val } }));
                            addLog(`Showcase theme changed: ${val}`);
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Developer Code Snip panel (col 7) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-2 select-text">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Code className="w-3.5 h-3.5 text-brand-teal" />
                    <span className="text-[9px] font-black uppercase text-brand-teal tracking-wider">Generated React/API integration code</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(getCodeSnippet())}
                    className="p-1 rounded bg-[#0d0e1b] hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition flex items-center space-x-1 text-[8px] border border-zinc-800"
                  >
                    {copied ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-brand-emerald" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#05060b] border border-[#1f213a] rounded-lg p-2.5 font-mono text-[8px] text-zinc-300 overflow-x-auto whitespace-pre h-[90px] relative">
                  {getCodeSnippet()}
                </div>
              </div>

            </div>

          </div>

          {/* Deploy Action Bar */}
          <div className="border-t border-[#1f213a] px-4 py-3 bg-[#0d0e1b] flex items-center justify-between">
            <span className="text-[9.5px] text-slate-450 font-bold block">
              Customize nodes, then deploy to active environment
            </span>
            
            <Link href="/signup">
              <button className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-black text-[9.5px] py-1.5 px-3 rounded-lg flex items-center space-x-1.5 shadow-md shadow-brand-emerald/10 cursor-pointer uppercase tracking-wider transition hover:scale-103 active:scale-97">
                <span>Deploy Journey</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

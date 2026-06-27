'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Terminal, 
  Play, 
  Lock, 
  HelpCircle, 
  Layers, 
  Key,
  Copy,
  Check,
  Code
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ApiDeveloperPage() {
  // API endpoints catalog
  const endpoints = [
    {
      method: 'POST',
      path: '/v1/spaces',
      desc: 'Create a new testimonial collection space.',
      requestHeaders: {
        'Authorization': 'Bearer pr_live_51N...89j',
        'Content-Type': 'application/json'
      },
      requestBody: {
        name: 'Acme Product Launch',
        slug: 'acme-launch',
        customMessage: 'Share your onboarding experience!',
        theme: '#10B981'
      },
      mockResponse: {
        status: 201,
        statusText: 'Created',
        body: {
          id: 'space_9j8d7s6a',
          name: 'Acme Product Launch',
          slug: 'acme-launch',
          customMessage: 'Share your onboarding experience!',
          theme: '#10B981',
          collectVideo: true,
          collectText: true,
          createdAt: '2026-06-27T15:17:00Z'
        }
      }
    },
    {
      method: 'GET',
      path: '/v1/spaces/acme-saas/testimonials',
      desc: 'Fetch approved testimonials for a specific space.',
      requestHeaders: {
        'Authorization': 'Bearer pr_live_51N...89j',
        'Accept': 'application/json'
      },
      requestBody: null,
      mockResponse: {
        status: 200,
        statusText: 'OK',
        body: {
          spaceId: 'acme-saas',
          total: 2,
          testimonials: [
            {
              id: 'test_1a2b3c4d',
              type: 'TEXT',
              rating: 5,
              textContent: 'Proofly integrated in less than 30 minutes! Onboarding pipeline speed doubled immediately.',
              reviewerName: 'Sarah Jenkins',
              reviewerTitle: 'SaaS Founder',
              createdAt: '2026-06-25T10:00:00Z'
            },
            {
              id: 'test_5e6f7g8h',
              type: 'VIDEO',
              rating: 5,
              videoUrl: 'https://cdn.proofly.co/videos/james-grid.mp4',
              reviewerName: 'James Cole',
              reviewerTitle: 'Product Lead',
              createdAt: '2026-06-26T04:00:00Z'
            }
          ]
        }
      }
    },
    {
      method: 'POST',
      path: '/v1/testimonials',
      desc: 'Submit a new text review to a collection space.',
      requestHeaders: {
        'Authorization': 'Bearer pr_live_51N...89j',
        'Content-Type': 'application/json'
      },
      requestBody: {
        spaceId: 'acme-saas',
        rating: 5,
        textContent: 'The analytics reports are visual, comprehensive, and load instantly.',
        reviewerName: 'Marcus Brody',
        reviewerEmail: 'marcus@launchpad.io',
        reviewerTitle: 'Growth Hacker'
      },
      mockResponse: {
        status: 201,
        statusText: 'Created',
        body: {
          id: 'test_9z8y7x6w',
          spaceId: 'acme-saas',
          rating: 5,
          textContent: 'The analytics reports are visual, comprehensive, and load instantly.',
          reviewerName: 'Marcus Brody',
          reviewerTitle: 'Growth Hacker',
          isApproved: false,
          sentiment: 'POSITIVE',
          createdAt: '2026-06-27T15:17:30Z'
        }
      }
    }
  ];

  // States
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [apiKey, setApiKey] = useState('pr_live_51N392kd849j292');
  const [isSending, setIsSending] = useState(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const activeEndpoint = endpoints[selectedIdx];

  const handleSendRequest = () => {
    setIsSending(true);
    setResponseOutput(null);
    
    // Simulate network delay
    setTimeout(() => {
      setIsSending(false);
      
      // If API key is empty, mock unauthorized error
      if (!apiKey.trim()) {
        setResponseOutput({
          status: 401,
          statusText: 'Unauthorized',
          body: {
            error: 'Missing API key. Please check your Authorization header value.'
          }
        });
      } else {
        setResponseOutput(activeEndpoint.mockResponse);
      }
    }, 850);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(JSON.stringify(activeEndpoint.requestBody || {}, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#8677FF]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <span className="bg-[#8677FF]/15 text-[#8677FF] border border-[#8677FF]/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          REST API Developer reference
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          Programmatic access to <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#8677FF] bg-clip-text text-transparent">
            your social proof
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Create spaces, fetch review streams, parse AI tags, and sync analytics metrics directly with your core backends using clean REST endpoints.
        </p>
      </section>

      {/* Main Developer Workspace Area */}
      <section className="max-w-7xl mx-auto px-6 pb-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Endpoint Directory & Interactive Request body (6 Columns) */}
        <div className="lg:col-span-6 bg-[#0c0d16] border border-white/[0.05] rounded-2xl p-6 space-y-6 shadow-xl text-left">
          
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Layers className="w-4 h-4 text-[#8677FF]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">API Endpoint Catalog</h2>
          </div>

          {/* Endpoints Selection List */}
          <div className="space-y-2">
            {endpoints.map((e, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedIdx(idx);
                  setResponseOutput(null);
                  setCopied(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedIdx === idx 
                    ? 'bg-zinc-950 border-[#8677FF]/40 shadow-lg shadow-[#8677FF]/5' 
                    : 'bg-zinc-950 border-white/[0.04] hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                    e.method === 'POST' ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {e.method}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-white">{e.path}</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                  {e.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Headers & API Key controls */}
          <div className="space-y-3.5 pt-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Authorization Headers</span>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bearer API Key</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl pl-8 pr-4 py-2 text-xs text-slate-200 transition duration-200"
                  placeholder="Insert pr_live_key..."
                />
                <Key className="w-3.5 h-3.5 text-zinc-650 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Request Body JSON payload viewer */}
            {activeEndpoint.requestBody && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Request Payload (JSON)</label>
                  <button 
                    onClick={handleCopyCode}
                    className="text-zinc-500 hover:text-white transition flex items-center space-x-1 text-[9px] cursor-pointer"
                  >
                    {copied ? (
                      <span className="text-brand-emerald">Copied!</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="w-full bg-[#030303] border border-white/[0.05] p-3.5 rounded-xl text-[9.5px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(activeEndpoint.requestBody, null, 2)}
                </pre>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Interactive Response API Explorer Console (6 Columns) */}
        <div className="lg:col-span-6 bg-[#0c0d16] border border-white/[0.05] rounded-2xl p-6 shadow-xl text-left space-y-6">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-brand-teal" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">Interactive Console</h2>
            </div>
            
            {/* Execute trigger */}
            <button
              onClick={handleSendRequest}
              disabled={isSending}
              className="bg-brand-teal hover:bg-[#12a191] disabled:bg-zinc-800 text-zinc-950 font-bold text-[10.5px] px-4 py-2 rounded-xl flex items-center space-x-1.5 transition duration-200 cursor-pointer disabled:cursor-not-allowed focus:outline-none"
            >
              <Play className="w-3.5 h-3.5 shrink-0 fill-zinc-950" />
              <span>{isSending ? 'Sending Request...' : 'Send Request'}</span>
            </button>
          </div>

          {/* Response Terminal */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Response Terminal Output</span>

            <div className="bg-[#030303] border border-white/[0.05] rounded-2xl p-5 min-h-[220px] flex flex-col justify-start font-mono text-[10px] leading-relaxed relative">
              
              {isSending && (
                <div className="absolute inset-0 bg-[#030303]/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-20">
                  <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {responseOutput ? (
                <div className="space-y-4 text-left w-full">
                  
                  {/* Status header */}
                  <div className="flex items-center space-x-2 border-b border-white/5 pb-2.5">
                    <span className="text-[9.5px] text-zinc-500 font-bold">Status:</span>
                    <span className={`text-[10.5px] font-black uppercase px-2 py-0.2 rounded ${
                      responseOutput.status < 300 
                        ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {responseOutput.status} {responseOutput.statusText}
                    </span>
                  </div>

                  {/* Body response */}
                  <pre className="text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(responseOutput.body, null, 2)}
                  </pre>

                </div>
              ) : (
                <div className="m-auto text-center flex flex-col items-center justify-center space-y-2 text-zinc-650">
                  <Code className="w-6 h-6 text-zinc-700 animate-pulse" />
                  <span className="text-[10px]">Execute a trigger to receive server headers and body streams.</span>
                </div>
              )}

            </div>
          </div>

          {/* Rate limits / HTTP Status Codes metadata block */}
          <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 text-[9.5px] text-zinc-400">
            <div className="space-y-1">
              <span className="text-[8.5px] font-black uppercase text-zinc-500 tracking-wider block">rate limit constraints</span>
              <p className="leading-normal">
                Standard tokens support up to **60 requests/minute**. Rate limit metrics are returned inside headers (<code className="text-slate-200">X-RateLimit-Remaining</code>).
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[8.5px] font-black uppercase text-zinc-500 tracking-wider block">api versioning</span>
              <p className="leading-normal">
                Active core version is <code className="text-slate-250 font-bold">v1</code>. Updates are rolled out via release changelogs.
              </p>
            </div>
          </div>

        </div>

      </section>

      <Footer />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, Play, Check, Code, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function SampleEmbedPlayground() {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [copied, setCopied] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  // Preloaded code states
  const [htmlCode, setHtmlCode] = useState(`<div class="testimonial-card">
  <div class="glow"></div>
  <div class="header">
    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="avatar" />
    <div>
      <h4>Emma Stone</h4>
      <p>Founder, StyleCo Ecom</p>
    </div>
  </div>
  <p class="review">"Proofly is absolute magic. We doubled our checkout conversions in 3 days!"</p>
  <div class="rating">⭐⭐⭐⭐⭐</div>
</div>`);

  const [cssCode, setCssCode] = useState(`.testimonial-card {
  background: rgba(24, 24, 27, 0.95);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 24px;
  max-width: 380px;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.05);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.testimonial-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(20, 184, 166, 0.4);
  box-shadow: 0 20px 40px rgba(20, 184, 166, 0.15);
}

.glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%);
  pointer-events: none;
  transition: background 0.15s ease;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.header img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #6C5CFF;
  object-fit: cover;
}

.header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.header p {
  margin: 0;
  font-size: 11px;
  color: #94a3b8;
}

.review {
  font-size: 13px;
  line-height: 1.6;
  color: #cbd5e1;
  margin-bottom: 16px;
  font-style: italic;
}

.rating {
  font-size: 14px;
  color: #f59e0b;
}`);

  const [jsCode, setJsCode] = useState(`// Interactive tracking glow
const card = document.querySelector('.testimonial-card');
const glow = document.querySelector('.glow');

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  glow.style.background = \`radial-gradient(circle at \${x}px \${y}px, rgba(20, 184, 166, 0.25) 0%, transparent 60%)\`;
});

card.addEventListener('mouseleave', () => {
  glow.style.background = 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)';
});`);

  const embedSnippet = `<script src="https://proofly.com/embed.js" data-id="demo-space" defer></script>\n<div id="proofly-widget"></div>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compile iframe document
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            background-color: #09090b;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
          }
          ${cssCode}
        </style>
      </head>
      <body>
        ${htmlCode}
        <script>
          try {
            ${jsCode}
          } catch (err) {
            console.error(err);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="bg-[#18181B]/40 border border-border-primary rounded-2xl p-6 md:p-8 relative overflow-hidden max-w-5xl mx-auto backdrop-blur">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border-primary/50">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center space-x-2 bg-brand-emerald/10 border border-brand-emerald/20 text-[#8677FF] text-xs font-semibold px-3 py-1 rounded-full">
            <Code className="w-3.5 h-3.5" />
            <span>Try Our Sample Embed Code</span>
          </div>
          <h3 className="text-white text-xl sm:text-2xl font-black tracking-tight">
            Test widgets instantly with zero installation
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
            Copy the simple snippet to embed on Webflow/HTML, or spin up the interactive play sandbox below to live-test code modifications in real time.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsPlaygroundOpen(!isPlaygroundOpen)}
            className="bg-brand-emerald text-white px-5 py-3 rounded-lg text-xs font-black uppercase tracking-widest flex items-center space-x-2 cursor-pointer transition hover:scale-103 duration-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPlaygroundOpen ? 'Hide Sandbox' : 'Run Playground'}</span>
          </button>
          <Link href="/live-demo">
            <button className="bg-zinc-900 border border-border-primary text-slate-300 hover:text-white px-5 py-3 rounded-lg text-xs font-black uppercase tracking-widest flex items-center space-x-2 cursor-pointer transition hover:scale-103 duration-200">
              <span>Live Demo Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Embed Code Snippet Copy Container */}
      <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-[#09090B] border border-border-primary/80 p-3 rounded-xl">
        <div className="flex-1 font-mono text-[10px] sm:text-xs text-brand-teal text-left overflow-x-auto whitespace-nowrap py-2 px-1 select-all">
          {embedSnippet.split('\n').map((line, i) => (
            <div key={i} className="line-clamp-1">{line}</div>
          ))}
        </div>
        <button
          onClick={() => copyToClipboard(embedSnippet)}
          className="bg-zinc-900 hover:bg-zinc-850 text-white px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 border border-border-primary cursor-pointer transition active:scale-95 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-brand-emerald" />
              <span className="text-brand-emerald">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Snippet</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Code Editor (Toggles visible when isPlaygroundOpen is true) */}
      {isPlaygroundOpen && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 border border-border-primary rounded-xl overflow-hidden shadow-2xl h-[460px]">
          {/* Editor Left Tab Pane */}
          <div className="lg:col-span-6 flex flex-col bg-[#0c0c0e] border-r border-border-primary/80">
            {/* Editor Tabs Header */}
            <div className="flex bg-[#111115] border-b border-border-primary/60">
              {(['html', 'css', 'js'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-bold border-r border-border-primary/60 uppercase tracking-wider transition ${
                    activeTab === tab 
                      ? 'bg-[#0c0c0e] text-brand-emerald border-t-2 border-t-brand-emerald' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab === 'js' ? 'JavaScript' : tab}
                </button>
              ))}
            </div>

            {/* Code Inputs */}
            <div className="flex-1 relative">
              {activeTab === 'html' && (
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="absolute inset-0 w-full h-full p-4 bg-transparent font-mono text-xs text-slate-300 outline-none resize-none leading-relaxed border-none focus:ring-0"
                  spellCheck="false"
                />
              )}
              {activeTab === 'css' && (
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="absolute inset-0 w-full h-full p-4 bg-transparent font-mono text-xs text-slate-300 outline-none resize-none leading-relaxed border-none focus:ring-0"
                  spellCheck="false"
                />
              )}
              {activeTab === 'js' && (
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="absolute inset-0 w-full h-full p-4 bg-transparent font-mono text-xs text-slate-300 outline-none resize-none leading-relaxed border-none focus:ring-0"
                  spellCheck="false"
                />
              )}
            </div>
          </div>

          {/* Iframe Live Preview Right Pane */}
          <div className="lg:col-span-6 bg-[#09090b] flex flex-col">
            <div className="bg-[#111115] border-b border-border-primary/60 px-4 py-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Live Preview Output</span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse" />
            </div>
            <div className="flex-1 bg-[#09090b] relative">
              <iframe
                title="widget-preview"
                srcDoc={srcDoc}
                className="w-full h-full border-none bg-[#09090b]"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  Code2
} from 'lucide-react';

export default function EmbedsProductPage() {
  // Target Frameworks list
  const frameworks = [
    { name: 'HTML/Web components', id: 'html', icon: '🌐' },
    { name: 'React component', id: 'react', icon: '⚛️' },
    { name: 'Next.js App', id: 'nextjs', icon: '▲' },
    { name: 'Vue.js', id: 'vue', icon: '🟢' },
    { name: 'Webflow', id: 'webflow', icon: 'W' },
    { name: 'Framer', id: 'framer', icon: 'F' },
    { name: 'Shopify', id: 'shopify', icon: '🛍️' },
    { name: 'WordPress', id: 'wordpress', icon: '🅆' }
  ];

  // States
  const [selectedFramework, setSelectedFramework] = useState('html');
  const [embedTheme, setEmbedTheme] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColor] = useState('#6366F1'); // violet
  const [copied, setCopied] = useState(false);

  // Styling maps
  const colorSwatches = [
    { name: 'Violet', value: '#6366F1' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Teal', value: '#4338CA' },
    { name: 'Indigo', value: '#4338CA' },
    { name: 'Orange', value: '#F97316' }
  ];

  // Code generator helper
  const getEmbedCode = () => {
    const spaceId = 'acme-saas';
    const cleanColor = accentColor.replace('#', '');
    
    switch (selectedFramework) {
      case 'react':
        return `import { ProoflyWidget } from '@proofly/react';\n\nexport default function App() {\n  return (\n    <ProoflyWidget \n      spaceId="${spaceId}" \n      theme="${embedTheme}" \n      accentColor="#${cleanColor}"\n    />\n  );\n}`;
      case 'nextjs':
        return `'use client';\n\nimport { ProoflyWidget } from '@proofly/react';\n\nexport default function Page() {\n  return (\n    <div className="max-w-4xl mx-auto py-8">\n      <ProoflyWidget \n        spaceId="${spaceId}" \n        theme="${embedTheme}" \n        accentColor="#${cleanColor}"\n      />\n    </div>\n  );\n}`;
      case 'vue':
        return `<template>\n  <ProoflyWidget \n    spaceId="${spaceId}" \n    theme="${embedTheme}" \n    accentColor="#${cleanColor}"\n  />\n</template>\n\n<script>\nimport { ProoflyWidget } from '@proofly/vue';\nexport default {\n  components: { ProoflyWidget }\n}\n</script>`;
      case 'webflow':
      case 'framer':
      case 'shopify':
      case 'wordpress':
      case 'html':
      default:
        return `<div \n  id="proofly-root" \n  data-space-id="${spaceId}" \n  data-theme="${embedTheme}" \n  data-accent-color="#${cleanColor}"\n></div>\n<script src="https://cdn.proofly.co/widget.js" async></script>`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans ">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#4338CA]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <span className="bg-[#4338CA]/10 text-brand-teal border border-brand-teal/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          Embed Integrations
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          One line of code. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            Embed anywhere.
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Natively compatible with all major frameworks and site builders. No complicated npm packages required—just paste your snippet and launch.
        </p>
      </section>

      {/* Builder Workspace Area */}
      <section className="max-w-7xl mx-auto px-6 pb-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Integration Framework Grid Selector (5 Columns) */}
        <div className="lg:col-span-5 bg-[#0c0d16] border border-white/[0.06] rounded-2xl p-5 space-y-5 shadow-2xl text-left">
          
          <div className="flex items-center space-x-2 border-b border-white/5 pb-2.5">
            <Code2 className="w-4 h-4 text-brand-teal" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">Select Platform</h2>
          </div>

          {/* Grid selector buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {frameworks.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFramework(f.id);
                  setCopied(false);
                }}
                className={`flex items-center space-x-3 p-3.5 rounded-xl border text-left transition duration-200 cursor-pointer ${
                  selectedFramework === f.id 
                    ? 'bg-brand-teal/5 border-brand-teal/30 text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.08)]' 
                    : 'bg-zinc-950 border-white/[0.04] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-sm  shrink-0">{f.icon}</span>
                <span className="text-[10px] truncate">{f.name}</span>
              </button>
            ))}
          </div>

          {/* Theme toggler */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Widget Theme Mode</label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-white/[0.05]">
              <button
                onClick={() => setEmbedTheme('dark')}
                className={`py-2 text-[10px] font-bold rounded-lg transition duration-200 cursor-pointer ${
                  embedTheme === 'dark' ? 'bg-[#6366F1] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                DARK THEME
              </button>
              <button
                onClick={() => setEmbedTheme('light')}
                className={`py-2 text-[10px] font-bold rounded-lg transition duration-200 cursor-pointer ${
                  embedTheme === 'light' ? 'bg-white text-zinc-950 shadow-lg font-black' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                LIGHT THEME
              </button>
            </div>
          </div>

          {/* Swatch picker */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Accent Highlight</label>
            <div className="flex items-center space-x-3.5">
              {colorSwatches.map((swatch, idx) => (
                <button
                  key={idx}
                  onClick={() => setAccentColor(swatch.value)}
                  className={`w-6 h-6 rounded-full border-2 transition duration-200 relative ${
                    accentColor === swatch.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.value }}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Generated Snippet & Live simulator (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Live Simulator View Box */}
          <div className={`border rounded-3xl p-6 min-h-[220px] flex flex-col justify-center items-center relative overflow-hidden transition-all duration-300 ${
            embedTheme === 'dark' 
              ? 'bg-zinc-950 border-white/[0.06] shadow-2xl' 
              : 'bg-white border-zinc-200 shadow-xl'
          }`}>
            
            {/* Embedded Mini Review Badge Preview Card */}
            <div 
              className={`p-4 rounded-xl border max-w-xs text-left transition duration-300 relative ${
                embedTheme === 'dark' 
                  ? 'bg-[#0c0d16] border-white/5 shadow-2xl' 
                  : 'bg-zinc-50 border-zinc-200 shadow-md'
              }`}
            >
              <div className="flex items-center space-x-2.5 mb-2.5">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] text-white shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  S
                </div>
                <div className="leading-none text-left">
                  <span className={`text-[10px] font-bold block ${embedTheme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>J. Ashwath</span>
                  <span className="text-[7.5px] text-zinc-500 block mt-0.5">SaaS Founder</span>
                </div>
              </div>
              <p className={`text-[8.5px] leading-relaxed italic ${embedTheme === 'dark' ? 'text-slate-300' : 'text-zinc-650'}`}>
                "Proofly integrated in less than 30 minutes! Onboarding pipeline speed doubled immediately."
              </p>
              
              <div className="flex items-center justify-between border-t border-white/5 mt-3 pt-2">
                <span className="text-[7px] text-zinc-500 uppercase tracking-widest flex items-center space-x-0.5">
                  <span>Verified by Proofly</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[11px]" style={{ color: accentColor }}>★</span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Snippet box */}
          <div className="bg-[#0c0d16] border border-white/[0.06] rounded-2xl p-5 shadow-2xl text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Embed Code Snippet</span>
              <button
                onClick={handleCopyCode}
                className="bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg border border-white/10 transition flex items-center space-x-1.5 cursor-pointer focus:outline-none"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-emerald" />
                    <span className="text-brand-emerald">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>
            
            <pre className="w-full bg-[#030303] border border-white/[0.05] p-4 rounded-xl text-[11px] sm:text-[10px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {getEmbedCode()}
            </pre>
          </div>

        </div>

      </section>

      <Footer />
    </div>
  );
}

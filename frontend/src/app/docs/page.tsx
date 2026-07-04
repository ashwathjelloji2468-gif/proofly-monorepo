'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Search, 
  BookOpen, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Settings, 
  Sparkles, 
  Code, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocsPage() {
  // Documentation articles database
  const docArticles = [
    {
      category: 'Getting Started',
      id: 'quickstart',
      title: 'Quickstart Guide',
      desc: 'Learn how to get started with Proofly in under 5 minutes.',
      content: `Welcome to Proofly! This guide will help you set up your first testimonial collection space and display customer reviews on your landing page.

### 1. Create a Space
Sign in to your dashboard and click "Create Space". Give your space a name, a description, and select the collection methods you wish to allow (Video or Text).

### 2. Share your Collection Link
Proofly automatically generates a hosted landing page for your space:
\`https://proofly.co/collect/acme-saas\`

Copy this link and send it directly to your users via email, Twitter, Slack, or post-checkout flows.

### 3. Display the Wall of Love
Once your users submit reviews, they appear in your testimonial inbox. Approve the best ones and embed them using our single-line iframe tag.`,
      code: `<div id="proofly-widget" data-space-id="acme-saas"></div>\n<script src="https://cdn.proofly.co/widget.js" async></script>`
    },
    {
      category: 'Getting Started',
      id: 'installation',
      title: 'Installation & Packages',
      desc: 'Install the native framework packages for React, Vue, and Next.js.',
      content: `For teams using custom UI frameworks, we provide lightweight, tree-shakeable packages that render natively on the client or server.

### Installing React / Next.js wrapper:
\`\`\`bash
npm install @proofly/react
\`\`\`

### Installing Vue wrapper:
\`\`\`bash
npm install @proofly/vue
\`\`\`

All wrapper components support built-in fallback skeleton loaders while review records fetch asynchronously from the GraphQL endpoint.`,
      code: `// React Component Initialization\nimport { ProoflyWidget } from '@proofly/react';\n\nexport default function Home() {\n  return <ProoflyWidget spaceId="acme-saas" theme="dark" />;\n}`
    },
    {
      category: 'Core Features',
      id: 'collections',
      title: 'Collection Spaces',
      desc: 'Set up custom questions and branding rules for review collectors.',
      content: `Proofly collection pages can be fully customized to match your branding guides:

- **Accent Styling**: Select accent theme colors to align button states and checkboxes.
- **Custom Prompts**: Provide guiding questions (e.g. "What did you think of the REST API onboarding?") to help reviewers write high-quality testimonials.
- **Reward System**: Set up post-submission incentives, such as dynamic coupon codes or reward discounts, to increase collection rates.`,
      code: `// API Space configuration schema\n{\n  "name": "Acme Tech Labs",\n  "headerTitle": "Love our product?",\n  "customMessage": "It takes less than 60 seconds!",\n  "theme": "#6366F1",\n  "collectVideo": true\n}`
    },
    {
      category: 'Core Features',
      id: 'ai-curation',
      title: 'AI Insights & Curation',
      desc: 'Automate sentiment scoring and keyword tags parsing.',
      content: `Proofly uses semantic analysis models to filter and tag incoming reviews:

- **Sentiment Flagging**: Incoming text or transcribed video testimonials are analyzed and assigned a sentiment score (0-100%). Neutral or negative scores are flagged for internal review.
- **Smart Keyword Tags**: Key themes (e.g., "fast onboarding", "slow API") are extracted as hashtag metadata to allow easy filtering.
- **Social Composer**: Converts long reviews into formatted Twitter threads or LinkedIn posts with one click.`,
      code: `// AI Analysis Schema Payload\n{\n  "sentiment": "POSITIVE",\n  "score": 99.4,\n  "extractedKeywords": ["onboarding", "rest-api", "speed"],\n  "socialDraft": "Setup took less than 15 minutes! Onboarding pipeline speed doubled."\n}`
    },
    {
      category: 'Core Features',
      id: 'embeds',
      title: 'Widget Embeds & Styling',
      desc: 'Configure Masonry, Grid, or Carousel displays.',
      content: `Customize how testimonials load on your site. We support:

- **Grid Layout**: Classic multi-column cards ideal for homepage features.
- **Masonry Layout**: Dynamic heights aligned side-by-side, perfect for large Walls of Love.
- **Carousel Layout**: Swipeable horizontal sliders that fit neatly in minimal footer layouts.

All layouts are fully responsive, aligning to mobile grids automatically.`,
      code: `<div \n  id="proofly-wall" \n  data-space-id="acme-saas" \n  data-layout="masonry" \n  data-theme="glass"\n></div>`
    }
  ];

  // States
  const [selectedDocId, setSelectedDocId] = useState('quickstart');
  const [searchQuery, setSearchQuery] = useState('');

  const activeDoc = docArticles.find(d => d.id === selectedDocId) || docArticles[0];

  // Filter list
  const filteredDocs = docArticles.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans ">
      <Navbar />

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        
        {/* Left Side: Search & Documentation Tree Sidebar (3 Columns) */}
        <div className="lg:col-span-3 space-y-5 bg-[#0c0d16] border border-white/[0.05] p-4 rounded-2xl shadow-xl text-left">
          
          {/* Search box */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Search Documentation</span>
            <div className="relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quickstart, installation..."
                className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl pl-8 pr-3.5 py-1.5 text-[11px] text-white transition duration-200"
              />
              <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Navigation categories */}
          <div className="space-y-4 pt-2">
            
            {/* Category Groups */}
            {['Getting Started', 'Core Features'].map((catName) => {
              const groupItems = filteredDocs.filter(d => d.category === catName);
              if (groupItems.length === 0) return null;
              
              return (
                <div key={catName} className="space-y-1.5">
                  <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest block px-1.5">
                    {catName === 'Getting Started' ? '📚 Getting Started' : '⚙️ Core Features'}
                  </span>
                  <div className="space-y-1">
                    {groupItems.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[10.5px] font-semibold transition duration-250 flex items-center justify-between cursor-pointer ${
                          selectedDocId === doc.id 
                            ? 'bg-[#6366F1]/10 text-white font-bold border-l-2 border-[#6366F1]' 
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        <span>{doc.title}</span>
                        <ChevronRight className={`w-3 h-3 transition-transform ${selectedDocId === doc.id ? 'translate-x-0.5 text-[#6366F1]' : 'text-zinc-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

          </div>

        </div>

        {/* Right Side: Active Document Viewer (9 Columns) */}
        <div className="lg:col-span-9 bg-[#0c0d16] border border-white/[0.05] rounded-2xl p-6 sm:p-8 shadow-xl text-left space-y-6">
          
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1.5 text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
            <span>Docs</span>
            <span>/</span>
            <span>{activeDoc.category}</span>
            <span>/</span>
            <span className="text-[#6366F1]">{activeDoc.title}</span>
          </div>

          {/* Title & description */}
          <div className="space-y-2 border-b border-white/5 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
              {activeDoc.title}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeDoc.desc}
            </p>
          </div>

          {/* Markdown Content */}
          <div className="text-xs text-slate-300 leading-relaxed space-y-4 whitespace-pre-wrap max-w-none">
            {activeDoc.content}
          </div>

          {/* Code example codeblock */}
          {activeDoc.code && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#6366F1]" />
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Example Configuration Code</span>
              </div>
              <pre className="w-full bg-[#030303] border border-white/[0.05] p-4 rounded-xl text-[9.5px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {activeDoc.code}
              </pre>
            </div>
          )}

        </div>

      </div>

      <Footer />
    </div>
  );
}

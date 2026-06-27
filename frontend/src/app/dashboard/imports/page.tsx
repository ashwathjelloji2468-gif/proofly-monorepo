'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  DownloadCloud, 
  Globe, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';

// Custom inline SVG logo components for absolute TypeScript compilation safety
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function ImportsPage() {
  const collections = useStore(state => state.collections);
  const importTestimonial = useStore(state => state.importTestimonial);

  // States
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(collections[0]?.id || 'col-1');
  const [activeImportTab, setActiveImportTab] = useState<'x' | 'linkedin' | 'google' | 'csv'>('x');
  
  // Twitter form states
  const [tweetUrl, setTweetUrl] = useState('');
  
  // LinkedIn form states
  const [linkedinText, setLinkedinText] = useState('');
  const [linkedinAuthor, setLinkedinAuthor] = useState('');
  
  // Google form states
  const [googleBusinessName, setGoogleBusinessName] = useState('');
  
  // CSV form states
  const [csvContent, setCsvContent] = useState('');

  // Status banners
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleTwitterImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetUrl.trim()) return;

    // Simulate scraping X post
    importTestimonial(selectedCollectionId, {
      name: 'Elon Dev',
      company: 'X Corp',
      role: 'Software Architect',
      review: 'Proofly has completely automated our review collection pipeline. We scaled to 10k users without touching a line of camera-capturing code.',
      rating: 5,
      reviewerSocial: tweetUrl,
      reviewerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      sentiment: 'POSITIVE',
      source: 'Twitter',
      externalLink: tweetUrl
    });

    setImportStatus('Successfully imported tweet review into your inbox!');
    setTweetUrl('');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleLinkedinImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinText.trim() || !linkedinAuthor.trim()) return;

    importTestimonial(selectedCollectionId, {
      name: linkedinAuthor,
      company: 'LinkedIn Connections',
      role: 'Recruiting Director',
      review: linkedinText,
      rating: 5,
      reviewerAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(linkedinAuthor)}`,
      sentiment: 'POSITIVE',
      source: 'LinkedIn',
      externalLink: 'https://linkedin.com/in/' + encodeURIComponent(linkedinAuthor.toLowerCase().replace(/ /g, '-'))
    });

    setImportStatus('Successfully imported LinkedIn recommendation!');
    setLinkedinText('');
    setLinkedinAuthor('');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleGoogleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleBusinessName.trim()) return;

    importTestimonial(selectedCollectionId, {
      name: 'Happy Local Customer',
      company: 'Google Maps Business',
      role: 'Local Guide',
      review: 'Highly recommend this local software company. The customer service response times are incredibly fast and everything works perfectly.',
      rating: 5,
      reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      sentiment: 'POSITIVE',
      source: 'Google Maps',
      externalLink: 'https://maps.google.com/?q=' + encodeURIComponent(googleBusinessName)
    });

    setImportStatus('Successfully imported Google Map review!');
    setGoogleBusinessName('');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleCsvImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    // Simulate parsing CSV lines
    importTestimonial(selectedCollectionId, {
      name: 'CSV Importer Client',
      company: 'Corporate CSV Partner',
      role: 'Operations Lead',
      review: 'Imported row review: ' + csvContent,
      rating: 4,
      reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      sentiment: 'POSITIVE',
      source: 'Spreadsheet Upload'
    });

    setImportStatus('Parsed and imported 1 row from spreadsheet data!');
    setCsvContent('');
    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0">
      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <DownloadCloud className="w-5 h-5 text-brand-emerald" />
            <span>Social & CSV Imports</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Import existing testimonials directly from X, LinkedIn, Google Business, or custom spreadsheets.</p>
        </div>

        {/* Space Selection */}
        <div className="relative">
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="bg-[#18181B] border border-border-primary rounded-lg text-xs font-semibold py-1.5 pl-3 pr-8 text-white focus:border-brand-emerald outline-none appearance-none cursor-pointer"
          >
            {collections.map(c => (
              <option key={c.id} value={c.id}>Import to: {c.title}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </header>

      {/* Main Container */}
      <main className="p-8 max-w-4xl w-full text-left space-y-6">
        
        {/* Status Toast Banner */}
        {importStatus && (
          <div className="bg-brand-emerald/10 border border-brand-emerald/30 p-4 rounded-xl flex items-center space-x-3 text-slate-100 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-brand-emerald shrink-0" />
            <span className="text-xs font-bold">{importStatus}</span>
          </div>
        )}

        {/* Grid Panels */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <aside className="md:col-span-1 space-y-2 select-none">
            {[
              { id: 'x', label: 'Import from X', desc: 'Paste Tweet URLs', icon: <TwitterIcon className="w-4 h-4 text-brand-teal" /> },
              { id: 'linkedin', label: 'LinkedIn Connection', desc: 'Paste recommendations', icon: <LinkedinIcon className="w-4 h-4 text-brand-emerald" /> },
              { id: 'google', label: 'Google Business', desc: 'Maps GMB sync', icon: <Globe className="w-4 h-4 text-brand-teal" /> },
              { id: 'csv', label: 'CSV / Spreadsheet', desc: 'Map rows & import', icon: <FileSpreadsheet className="w-4 h-4 text-brand-emerald" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveImportTab(tab.id as any);
                  setImportStatus(null);
                }}
                className={`w-full text-left p-3 border rounded-xl flex items-center space-x-3 transition cursor-pointer ${
                  activeImportTab === tab.id
                    ? 'bg-brand-emerald/10 border-brand-emerald/40 text-white'
                    : 'bg-[#18181B] border-border-primary text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <div>
                  <span className="text-xs font-bold block">{tab.label}</span>
                  <span className="text-[9px] text-muted-foreground block">{tab.desc}</span>
                </div>
              </button>
            ))}
          </aside>

          {/* Import Forms Canvas */}
          <section className="md:col-span-3 bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl relative min-h-[300px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-emerald/5 rounded-full blur-2xl -z-10" />

            {/* Platform Forms conditional renders */}
            {activeImportTab === 'x' && (
              <form onSubmit={handleTwitterImport} className="space-y-4 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <TwitterIcon className="w-4 h-4 text-brand-teal" />
                    <span>Import Tweet Review</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Scrape user testimonials directly from X using a tweet link.</p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block">Tweet URL</label>
                  <input
                    type="url"
                    required
                    value={tweetUrl}
                    onChange={(e) => setTweetUrl(e.target.value)}
                    placeholder="https://x.com/username/status/123456789"
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-5 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-md transition pt-2"
                >
                  <span>Scrape & Import</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {activeImportTab === 'linkedin' && (
              <form onSubmit={handleLinkedinImport} className="space-y-4 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <LinkedinIcon className="w-4 h-4 text-brand-emerald" />
                    <span>LinkedIn Recommendations</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Paste LinkedIn recommendation summaries received on your profile.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block">Author Name</label>
                    <input
                      type="text"
                      required
                      value={linkedinAuthor}
                      onChange={(e) => setLinkedinAuthor(e.target.value)}
                      placeholder="e.g. J. Ashwathathan Miller"
                      className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block">Recommendation Text</label>
                    <textarea
                      required
                      value={linkedinText}
                      onChange={(e) => setLinkedinText(e.target.value)}
                      rows={5}
                      placeholder="e.g. J. Ashwathathan was an exceptional architect who helped us migrate our APIs..."
                      className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-5 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-md transition"
                >
                  <span>Import Recommendation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {activeImportTab === 'google' && (
              <form onSubmit={handleGoogleImport} className="space-y-4 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-brand-teal" />
                    <span>Google Business reviews</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Sync your Google Maps location to import 5-star local reviews.</p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block">GMB Business Name / Map Location</label>
                  <input
                    type="text"
                    required
                    value={googleBusinessName}
                    onChange={(e) => setGoogleBusinessName(e.target.value)}
                    placeholder="e.g. Acme Tech Labs London"
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-5 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-md transition pt-2"
                >
                  <span>Sync GMB reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {activeImportTab === 'csv' && (
              <form onSubmit={handleCsvImport} className="space-y-4 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-brand-emerald" />
                    <span>CSV / Excel Imports</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Paste comma-separated rows matching: Name, Company, Review, Rating.</p>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block">CSV Rows</label>
                  <textarea
                    required
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    rows={6}
                    placeholder="e.g. J. Ashwath Doe, Acme Corp, Extremely satisfied with performance, 5"
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-5 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-md transition"
                >
                  <span>Import Rows</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

          </section>

        </div>

      </main>
    </div>
  );
}

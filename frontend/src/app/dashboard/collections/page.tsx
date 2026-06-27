'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Collection } from '@/store/useStore';
import { 
  Plus, 
  FolderHeart, 
  Trash2, 
  Link as LinkIcon, 
  QrCode, 
  Sparkles, 
  Video, 
  MessageSquare, 
  Layers,
  ChevronRight,
  ExternalLink,
  X,
  Palette,
  CheckCircle2,
  Settings,
  Gift
} from 'lucide-react';
import Link from 'next/link';

export default function CollectionsPage() {
  const collections = useStore(state => state.collections);
  const createCollection = useStore(state => state.createCollection);
  const deleteCollection = useStore(state => state.deleteCollection);
  const updateCollection = useStore(state => state.updateCollection);
  const updateCollectionReward = useStore(state => state.updateCollectionReward);
  const testimonials = useStore(state => state.testimonials);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeShareCollection, setActiveShareCollection] = useState<Collection | null>(null);
  const [selectedSettingsCollection, setSelectedSettingsCollection] = useState<Collection | null>(null);

  // Edit Space Form States
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editTheme, setEditTheme] = useState('#4338CA');
  const [editCollectVideo, setEditCollectVideo] = useState(true);
  const [editCollectText, setEditCollectText] = useState(true);

  // Edit Reward Form States
  const [rewardEnabled, setRewardEnabled] = useState(false);
  const [rewardDiscountCode, setRewardDiscountCode] = useState('');
  const [rewardMessage, setRewardMessage] = useState('');
  const [settingsTab, setSettingsTab] = useState<'details' | 'reward'>('details');

  useEffect(() => {
    if (selectedSettingsCollection) {
      setEditTitle(selectedSettingsCollection.title);
      setEditDescription(selectedSettingsCollection.description);
      setEditLogoUrl(selectedSettingsCollection.logoUrl || '');
      setEditTheme(selectedSettingsCollection.theme);
      setEditCollectVideo(selectedSettingsCollection.collectVideo);
      setEditCollectText(selectedSettingsCollection.collectText);

      const r = selectedSettingsCollection.reward;
      if (r) {
        setRewardEnabled(r.isActive);
        setRewardDiscountCode(r.discountCode);
        setRewardMessage(r.message);
      } else {
        setRewardEnabled(false);
        setRewardDiscountCode('');
        setRewardMessage('');
      }
      setSettingsTab('details');
    }
  }, [selectedSettingsCollection]);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [theme, setTheme] = useState('#4338CA'); // Purple default
  const [collectType, setCollectType] = useState<'both' | 'video' | 'text'>('both');
  const [questions, setQuestions] = useState<string[]>(['']);

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleQuestionChange = (index: number, val: string) => {
    const updated = [...questions];
    updated[index] = val;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleDownloadQR = async (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    const shareUrl = `${origin}/collect/${slug}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download QR failed:', err);
      window.open(qrImageUrl, '_blank');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const filteredQuestions = questions.filter(q => q.trim() !== '');

    await createCollection({
      title,
      description,
      logoUrl: logoUrl.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}`,
      theme,
      collectVideo: collectType === 'both' || collectType === 'video',
      collectText: collectType === 'both' || collectType === 'text',
      customQuestions: filteredQuestions.length > 0 ? filteredQuestions : ['How did this save you time?']
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setLogoUrl('');
    setTheme('#4338CA');
    setCollectType('both');
    setQuestions(['']);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 font-sans">
      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <h1 className="font-extrabold text-lg text-white">Space Collections</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-md shadow-brand-emerald/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </header>

      {/* Main Grid */}
      <main className="p-8 space-y-8 max-w-6xl w-full text-left">
        {collections.length === 0 ? (
          <div className="bg-[#18181B]/45 border border-dashed border-border-primary rounded-2xl py-24 flex flex-col items-center justify-center space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#09090B] border border-border-primary flex items-center justify-center text-slate-500">
              <FolderHeart className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-lg">No collections created</h3>
              <p className="text-slate-400 text-xs max-w-sm">Create a feedback collection widget space to gather user testimonials.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white font-bold text-xs py-3 px-6 rounded-lg cursor-pointer transition shadow-lg shadow-brand-emerald/10"
            >
              Start collecting now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map(col => {
              const colTestimonials = testimonials.filter(t => t.collection_id === col.id);
              const approvedCount = colTestimonials.filter(t => t.status === 'approved').length;
              const pendingCount = colTestimonials.filter(t => t.status === 'pending').length;

              return (
                <div 
                  key={col.id} 
                  className="bg-[#18181B] border border-border-primary rounded-2xl p-6 hover:border-brand-emerald/30 transition flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3.5">
                        <img 
                          src={col.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${col.title}`} 
                          alt="logo" 
                          className="w-12 h-12 rounded-xl bg-[#09090B] border border-border-primary p-0.5 object-cover"
                        />
                        <div className="space-y-0.5">
                          <h3 className="font-extrabold text-white text-base leading-tight">{col.title}</h3>
                          <span className="text-[10px] text-muted-foreground block font-mono">slug: {col.slug}</span>
                        </div>
                      </div>

                      {/* Active theme color indicator */}
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-[#09090B] shadow-sm shrink-0" 
                        style={{ backgroundColor: col.theme }} 
                      />
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                      {col.description}
                    </p>

                    {/* Stats summary boxes */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#09090B] border border-border-primary/60 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">Collected</span>
                        <span className="text-sm font-black text-slate-200">{colTestimonials.length}</span>
                      </div>
                      <div className="bg-[#09090B] border border-border-primary/60 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">Approved</span>
                        <span className="text-sm font-black text-brand-emerald">{approvedCount}</span>
                      </div>
                      <div className="bg-[#09090B] border border-border-primary/60 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">Pending</span>
                        <span className="text-sm font-black text-brand-teal">{pendingCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="border-t border-border-primary/50 pt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveShareCollection(col)}
                        className="p-2 bg-[#09090B] hover:bg-[#18181B] border border-border-primary text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                        title="Share Links & QR"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                      <Link href={`/collect/${col.slug}`} target="_blank">
                        <button
                          className="p-2 bg-[#09090B] hover:bg-[#18181B] border border-border-primary text-slate-400 hover:text-brand-emerald rounded-lg transition cursor-pointer"
                          title="View Public Collection Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setSelectedSettingsCollection(col)}
                        className="p-2 bg-[#09090B] hover:bg-[#18181B] border border-border-primary text-slate-400 hover:text-brand-teal rounded-lg transition cursor-pointer"
                        title="Edit Space Settings & Incentives"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete collection "${col.title}"?`)) {
                          deleteCollection(col.id);
                        }
                      }}
                      className="p-2 bg-[#09090B] hover:bg-red-950/20 text-muted-foreground hover:text-red-400 border border-border-primary rounded-lg transition cursor-pointer"
                      title="Delete Space"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE NEW COLLECTION MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-border-primary rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-border-primary flex items-center justify-between">
              <h2 className="font-extrabold text-white text-base">Create New Collection Space</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded bg-[#09090B] text-slate-400 hover:text-white border border-border-primary cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto text-left flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Collection Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Acme SaaS Inc"
                  className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Description</label>
                <textarea 
                  required
                  placeholder="Brief message displayed to reviewers when they land on your collection page."
                  className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald h-20 resize-none transition"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Logo URL (optional)</label>
                <input 
                  type="url" 
                  placeholder="https://api.dicebear.com/7.x/identicon/svg?seed=acme"
                  className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center space-x-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Brand Color</span>
                  </label>
                  <select 
                    className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="#4338CA">Sleek Purple</option>
                    <option value="#6366F1">Hover Purple</option>
                    <option value="#3B82F6">Royal Blue</option>
                    <option value="#EC4899">Hot Pink</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Collect Types</label>
                  <select 
                    className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                    value={collectType}
                    onChange={(e: any) => setCollectType(e.target.value)}
                  >
                    <option value="both">Video & Text Reviews</option>
                    <option value="video">Video Testimonials Only</option>
                    <option value="text">Text Reviews Only</option>
                  </select>
                </div>
              </div>

              {/* Custom Questions list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Custom Questions</label>
                  <button 
                    type="button" 
                    onClick={handleAddQuestion}
                    className="text-[10px] text-brand-emerald font-bold hover:underline cursor-pointer"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        placeholder={`Question #${idx + 1} e.g. What is your favorite feature?`}
                        className="flex-1 bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                        value={q}
                        onChange={(e) => handleQuestionChange(idx, e.target.value)}
                      />
                      {questions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveQuestion(idx)}
                          className="p-2 text-slate-500 hover:text-red-400 bg-[#09090B] border border-border-primary rounded-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center shadow-lg shadow-brand-emerald/10 cursor-pointer transition"
                >
                  Publish Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE LINKS / QR MODAL OVERLAY */}
      {activeShareCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-border-primary rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-6">
            <div className="flex items-center justify-between border-b border-border-primary/50 pb-3 text-left">
              <h3 className="font-extrabold text-white text-base">Share collection space</h3>
              <button 
                onClick={() => setActiveShareCollection(null)}
                className="p-1 rounded bg-[#09090B] text-slate-400 hover:text-white border border-border-primary cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

              {(() => {
                const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
                const shareUrl = `${origin}/collect/${activeShareCollection.slug}`;
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

                return (
                  <div className="space-y-4">
                    <div className="text-xs text-left space-y-1.5">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Hosted Link URL</span>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          readOnly
                          value={shareUrl}
                          className="flex-1 bg-[#09090B] border border-border-primary text-slate-200 text-xs px-3.5 py-3 rounded-lg focus:outline-none select-all"
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            alert('Share link copied to clipboard!');
                          }}
                          className="bg-brand-emerald text-white hover:bg-brand-emerald-hover font-bold text-xs py-3 px-4 rounded-lg cursor-pointer transition"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Real QR Code block */}
                    <div className="bg-[#09090B] border border-border-primary rounded-xl p-6 space-y-3 flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Download QR Code</span>
                      <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center relative group">
                        <img 
                          src={qrImageUrl} 
                          alt="QR Code" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <button 
                        onClick={() => handleDownloadQR(activeShareCollection.slug)}
                        className="bg-zinc-800 hover:bg-zinc-755 text-xs font-bold py-2 px-4 rounded-lg flex items-center space-x-1.5 border border-border-primary cursor-pointer transition text-white"
                      >
                        <QrCode className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Download PNG</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      )}

      {/* SPACE SETTINGS MODAL */}
      {selectedSettingsCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-border-primary rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6 text-left relative overflow-hidden">
            {/* Glow design background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-emerald/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-teal/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center justify-between border-b border-border-primary/50 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-brand-teal" />
                <h3 className="font-extrabold text-white text-base">Space Settings</h3>
              </div>
              <button 
                onClick={() => setSelectedSettingsCollection(null)}
                className="p-1 rounded bg-[#09090B] text-slate-400 hover:text-white border border-border-primary cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-border-primary/50 gap-2 pb-1">
              <button
                onClick={() => setSettingsTab('details')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  settingsTab === 'details'
                    ? 'bg-brand-emerald/10 text-white border border-brand-emerald/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Space Details
              </button>
              <button
                onClick={() => setSettingsTab('reward')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center space-x-1 ${
                  settingsTab === 'reward'
                    ? 'bg-brand-teal/10 text-white border border-brand-teal/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-brand-teal" />
                <span>Incentives & Coupons</span>
              </button>
            </div>

            {/* TAB CONTENT: SPACE DETAILS */}
            {settingsTab === 'details' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Space Name *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Description / Welcome message *</label>
                  <textarea
                    required
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Logo Image URL</label>
                    <input
                      type="url"
                      value={editLogoUrl}
                      onChange={(e) => setEditLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Theme Color</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="color" 
                        value={editTheme}
                        onChange={(e) => setEditTheme(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-[#09090B] border border-border-primary cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={editTheme}
                        onChange={(e) => setEditTheme(e.target.value)}
                        className="flex-1 bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-1.5 text-xs text-slate-100 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Collection options check boxes */}
                <div className="flex items-center space-x-6 pt-2 border-t border-border-primary/50">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editCollectVideo}
                      onChange={(e) => setEditCollectVideo(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-800 bg-[#09090B] text-brand-emerald focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-300">Collect Video reviews</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editCollectText}
                      onChange={(e) => setEditCollectText(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-800 bg-[#09090B] text-brand-emerald focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-300">Collect Text reviews</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB CONTENT: INCENTIVES & COUPONS */}
            {settingsTab === 'reward' && (
              <div className="space-y-4">
                <div className="bg-[#09090B] border border-border-primary rounded-xl p-4 space-y-3">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rewardEnabled}
                      onChange={(e) => setRewardEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-800 bg-[#09090B] text-brand-teal focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs font-bold text-white">Enable Completion Reward</span>
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Give reviewers a coupon code directly on the success screen after they submit a testimonial. This significantly boosts completion rates!
                  </p>
                </div>

                {rewardEnabled && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Discount / Promo Code *</label>
                      <input
                        type="text"
                        required
                        value={rewardDiscountCode}
                        onChange={(e) => setRewardDiscountCode(e.target.value.toUpperCase())}
                        placeholder="e.g. GET20OFF"
                        className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition tracking-widest font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Reward Message / Description *</label>
                      <input
                        type="text"
                        required
                        value={rewardMessage}
                        onChange={(e) => setRewardMessage(e.target.value)}
                        placeholder="e.g. Get 20% off your next checkout purchase!"
                        className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-border-primary/50">
              <button
                type="button"
                onClick={() => setSelectedSettingsCollection(null)}
                className="bg-[#09090B] hover:bg-[#18181B] text-slate-300 hover:text-white font-bold text-xs py-2.5 px-4 border border-border-primary rounded-lg cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editTitle.trim() || !editDescription.trim()) return;
                  try {
                    // Update space configuration details
                    await updateCollection(selectedSettingsCollection.id, {
                      title: editTitle,
                      description: editDescription,
                      logoUrl: editLogoUrl.trim() || null,
                      theme: editTheme,
                      collectVideo: editCollectVideo,
                      collectText: editCollectText
                    });

                    // Update or delete reward depending on toggle
                    if (rewardEnabled) {
                      if (rewardDiscountCode.trim() && rewardMessage.trim()) {
                        await updateCollectionReward(selectedSettingsCollection.id, {
                          discountCode: rewardDiscountCode,
                          message: rewardMessage
                        });
                      }
                    } else {
                      await updateCollectionReward(selectedSettingsCollection.id, null);
                    }

                    setSelectedSettingsCollection(null);
                  } catch (err) {
                    console.error('Failed to save settings:', err);
                  }
                }}
                className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-5 rounded-lg cursor-pointer transition shadow-md"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

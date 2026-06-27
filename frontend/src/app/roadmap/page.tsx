'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useStore, RoadmapItem } from '@/store/useStore';
import { 
  Search, 
  Plus, 
  Map, 
  Clock, 
  ChevronRight, 
  X,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoadmapPage() {
  const { roadmapItems, createRoadmapItem } = useStore();

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  // New Roadmap Item Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'AI' | 'Core' | 'Integrations'>('Core');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newRelease, setNewRelease] = useState('');

  // Selected Item Modal State
  const [activeItem, setActiveItem] = useState<RoadmapItem | null>(null);

  // Filter roadmap items
  const filteredItems = roadmapItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || item.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Group by status
  const statuses = [
    { key: 'planned', title: 'Planned', desc: 'Upcoming release items.' },
    { key: 'in_progress', title: 'In Progress', desc: 'Active developer focus.' },
    { key: 'under_review', title: 'Under Review', desc: 'Testing & QA verification.' },
    { key: 'completed', title: 'Completed', desc: 'Shipped to production.' }
  ];

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newDesc) {
      createRoadmapItem({
        title: newTitle,
        desc: newDesc,
        status: 'planned',
        category: newCategory,
        priority: newPriority,
        estimatedRelease: newRelease || 'Q4 2026',
        progress: 0,
        tags: [newCategory.toLowerCase()]
      });
      // reset
      setNewTitle('');
      setNewDesc('');
      setNewRelease('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#6366F1]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <span className="bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/20 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block mb-3.5">
          Product Roadmap
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          Shape the future of <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            social validation
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed font-medium">
          Check out our developer pipeline, track upcoming features release, suggest ideas, and follow our progress.
        </p>

        {/* Action Suggest */}
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-3 px-6 rounded-full flex items-center space-x-1.5 transition cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Suggest Feature</span>
          </button>
        </div>
      </section>

      {/* Main Roadmap Workspace */}
      <section className="max-w-7xl mx-auto px-6 pb-24 w-full space-y-6 flex-1 flex flex-col text-left">
        
        {/* Search & Filter bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category selection */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/[0.05]">
              {['All', 'Core', 'AI', 'Integrations'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black transition duration-250 cursor-pointer ${
                    selectedCategory === cat ? 'bg-[#6366F1] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Priority selection */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/[0.05]">
              {['All', 'HIGH', 'MEDIUM', 'LOW'].map((prio) => (
                <button
                  key={prio}
                  onClick={() => setSelectedPriority(prio)}
                  className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black transition duration-250 cursor-pointer ${
                    selectedPriority === prio ? 'bg-[#6366F1] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features..."
              className="w-full bg-[#0c0d16] border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl pl-8 pr-4 py-2 text-xs text-white transition duration-200"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Kanban Board columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {statuses.map((status) => {
            const itemsInStatus = filteredItems.filter(item => item.status === status.key);

            return (
              <div 
                key={status.key} 
                className="bg-[#0c0d16]/30 border border-white/[0.03] rounded-2xl p-4 flex flex-col space-y-3 min-h-[380px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider block">{status.title}</span>
                    <span className="text-[8.5px] text-zinc-500 block leading-none">{status.desc}</span>
                  </div>
                  <span className="text-[9.5px] font-mono font-black text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md">
                    {itemsInStatus.length}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3 overflow-y-auto max-h-[480px] scrollbar-thin">
                  {itemsInStatus.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setActiveItem(item)}
                      className="bg-[#0c0d16] border border-white/[0.05] p-3.5 rounded-xl hover:border-[#6366F1]/20 cursor-pointer transition duration-200 text-left space-y-3 relative group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                            item.category === 'AI' ? 'bg-[#6366F1]/10 text-[#6366F1]' : item.category === 'Core' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {item.category}
                          </span>
                          <span className={`text-[8px] font-bold ${
                            item.priority === 'HIGH' ? 'text-rose-400' : item.priority === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#6366F1] transition leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-[9.5px] text-slate-450 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      {/* Progress estimation info */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[8.5px] text-zinc-500 font-bold">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>{item.estimatedRelease}</span>
                          </span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-brand-emerald h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {itemsInStatus.length === 0 && (
                    <div className="py-12 text-center text-zinc-650 text-[9.5px] border border-dashed border-white/5 rounded-xl">
                      No items listed.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* Suggest Feature modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020205]/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="bg-[#0c0d16] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-sm font-black text-white flex items-center space-x-2">
                <Map className="w-4 h-4 text-[#6366F1]" />
                <span>Suggest Product Feature</span>
              </h3>

              <form onSubmit={handleCreateItem} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Feature Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white"
                    placeholder="e.g. Single Sign-On integrations"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full h-20 bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white resize-none"
                    placeholder="Explain what value this feature creates for developers..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e: any) => setNewCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                    >
                      <option value="Core">Core features</option>
                      <option value="AI">AI Analysis</option>
                      <option value="Integrations">Integrations</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e: any) => setNewPriority(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                    >
                      <option value="HIGH">HIGH priority</option>
                      <option value="MEDIUM">MEDIUM priority</option>
                      <option value="LOW">LOW priority</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estimated Release</label>
                  <input 
                    type="text" 
                    value={newRelease}
                    onChange={(e) => setNewRelease(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white"
                    placeholder="e.g. Q4 2026"
                  />
                </div>

                <div className="pt-2 text-right">
                  <button 
                    type="submit"
                    className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-2.5 px-5 rounded-full transition cursor-pointer"
                  >
                    Submit Idea
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail item details modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020205]/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="bg-[#0c0d16] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                <span>Roadmap</span>
                <span>/</span>
                <span>{activeItem.status}</span>
                <span>/</span>
                <span className="text-[#6366F1]">{activeItem.category}</span>
              </div>

              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                {activeItem.title}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeItem.desc}
              </p>

              {/* Progress Detail */}
              <div className="space-y-2 border-t border-b border-white/5 py-4">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
                  <span>Development Progress</span>
                  <span>{activeItem.progress}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-emerald h-full rounded-full transition-all duration-300"
                    style={{ width: `${activeItem.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left text-[10px]">
                <div className="space-y-0.5">
                  <span className="text-zinc-500 font-bold uppercase">Estimated Release</span>
                  <span className="text-white block font-semibold">{activeItem.estimatedRelease}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 font-bold uppercase">Priority Tier</span>
                  <span className="text-white block font-semibold">{activeItem.priority}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5">
                {activeItem.tags.map((tag) => (
                  <span key={tag} className="text-[8.5px] font-bold font-mono bg-white/5 border border-white/5 text-slate-350 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

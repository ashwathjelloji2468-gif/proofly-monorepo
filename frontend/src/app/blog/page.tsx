'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Search, 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowRight,
  Sparkles,
  X,
  User,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlogPage() {
  // Mock Blog Database
  const blogPosts = [
    {
      id: 'post-1',
      title: 'How DevFlow Doubled Onboarding Conversion Rates in 30 Days',
      category: 'Conversion',
      readTime: '5 min read',
      date: 'June 25, 2026',
      author: 'Sarah Jenkins',
      authorRole: 'Growth Lead',
      desc: 'An in-depth study of how real-time video validation and frictionless widgets accelerated onboarding pipelines.',
      content: `### Introduction
DevFlow Inc. recently redesigned its developer onboarding flow. By replacing text feedback forms with Proofly's authenticated mobile video recorders, they collected higher quality insights while reducing friction.

### The Challenge
Developers are notoriously sensitive to onboarding length. Traditional multi-field review forms caused high dropoffs.

### The Solution: 10-Second Browser Recorders
By allowing users to record video testimonials natively in their mobile browser with 0 app installs, DevFlow:
1. Boosted submission rates by **35%**.
2. Closed **3 new enterprise clients** who saw the verified video widgets on the pricing page.
3. Attained an overall **18% increase in trial-to-paid conversions**.

### Conclusion
Authentic customer success assets represent the highest ROI growth loops for modern SaaS platforms.`,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah',
      isFeatured: true
    },
    {
      id: 'post-2',
      title: 'The Developer Guide to REST API Authentication & Keys',
      category: 'Guides',
      readTime: '7 min read',
      date: 'June 20, 2026',
      author: 'Marcus Brody',
      authorRole: 'Lead Architect',
      desc: 'Secure your API pipelines, prevent token leaks, and set up client headers limits properly.',
      content: `### API Key Best Practices
Managing API keys securely is critical for protecting server pipelines. Here are 3 rules for developer tokens:

1. **Never commit keys to Version Control**: Use environment variables (.env files) to store sensitive client tokens.
2. **Implement Rate Limiting**: Ensure endpoint requests are capped (e.g. 60 requests/minute) using standard leaky bucket algorithms.
3. **Use Scoped Bearer Tokens**: Ensure write scopes are separate from read-only widget access scopes.

### Code Sample Header
\`\`\`bash
Authorization: Bearer pr_live_key_51N...
\`\`\`

Protecting endpoints prevents malicious script injections while ensuring high availability systems.`,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus'
    },
    {
      id: 'post-3',
      title: 'Why Glassmorphism and Hover Animations Boost Interaction Rates',
      category: 'Productivity',
      readTime: '4 min read',
      date: 'June 18, 2026',
      author: 'Chloe Jones',
      authorRole: 'Product Designer',
      desc: 'How subtle design changes in review cards increase widget play clicks and engagement statistics.',
      content: `### Design Aesthetics and Social Proof
Static review layouts are often ignored by users. Modern SaaS design relies on interactive glassmorphic cards to draw engagement:

- **Soft Blur backgrounds**: rgba backgrounds with 20px backdrop filter blend widgets into brand themes.
- **Hover Micro-animations**: Slight spring translations on mouse enter indicate interactivity.
- **Star Glow effects**: Adding subtle drop shadows behind rating stars increases card read duration rates by **12%**.

By building premium interfaces, visitors view reviews longer, boosting overall attribution.`,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chloe'
    }
  ];

  // States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const activePost = blogPosts.find(p => p.id === activePostId);

  // Filters
  const filteredPosts = blogPosts.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#8677FF]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <span className="bg-[#8677FF]/15 text-[#8677FF] border border-[#8677FF]/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          Platform Blog & Guides
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          Insights on growth, trust <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#8677FF] bg-clip-text text-transparent">
            & developer design
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Tips, guides, case studies, and engineering updates from the builders of the Proofly validation platform.
        </p>
      </section>

      {/* Main Workspace Container */}
      <section className="max-w-6xl mx-auto px-6 pb-24 w-full space-y-8 text-left">
        
        {/* Search & Category filter tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center space-x-2 bg-zinc-950 p-1 rounded-xl border border-white/[0.05]">
            {['All', 'Conversion', 'Guides', 'Productivity'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition duration-200 cursor-pointer ${
                  selectedCategory === cat ? 'bg-[#8677FF] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl pl-8 pr-4 py-2 text-xs text-white transition duration-200"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Featured Post Card */}
        {selectedCategory === 'All' && !searchQuery && (
          <div 
            onClick={() => setActivePostId(blogPosts[0].id)}
            className="bg-[#0c0d16] border border-white/[0.05] rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-2xl cursor-pointer hover:scale-[1.01] transition-all duration-300 relative overflow-hidden"
          >
            <div className="md:col-span-7 space-y-4">
              <span className="text-[9px] font-black uppercase text-brand-teal tracking-widest bg-brand-teal/10 border border-brand-teal/20 px-2.5 py-0.5 rounded-full">
                Featured Case Study
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {blogPosts[0].title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                {blogPosts[0].desc}
              </p>
              <div className="flex items-center space-x-6 text-[10px] text-zinc-500 font-bold uppercase tracking-wider pt-2">
                <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /><span>{blogPosts[0].date}</span></span>
                <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>{blogPosts[0].readTime}</span></span>
              </div>
            </div>

            <div className="md:col-span-5 bg-zinc-950/80 border border-white/[0.05] p-5 rounded-2xl flex flex-col justify-between h-full min-h-[140px] text-left">
              <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Author Profile</span>
              <div className="flex items-center space-x-3 mt-4">
                <img 
                  src={blogPosts[0].avatar} 
                  alt={blogPosts[0].author}
                  className="w-10 h-10 rounded-full border border-white/10 shrink-0"
                />
                <div className="leading-none text-left">
                  <span className="text-xs font-bold text-white block">{blogPosts[0].author}</span>
                  <span className="text-[9px] text-zinc-500 block mt-1">{blogPosts[0].authorRole}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          {filteredPosts.map((post) => (
            <div 
              key={post.id}
              onClick={() => setActivePostId(post.id)}
              className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl space-y-4 shadow-xl cursor-pointer hover:scale-[1.01] hover:border-[#8677FF]/20 transition-all duration-300 flex flex-col justify-between text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-slate-400">
                    {post.category}
                  </span>
                  <span className="text-[8.5px] text-zinc-500">{post.readTime}</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide leading-tight">
                  {post.title}
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {post.desc}
                </p>
              </div>

              <div className="flex items-center space-x-2.5 pt-2 border-t border-white/5 mt-auto">
                <img 
                  src={post.avatar} 
                  alt={post.author}
                  className="w-7 h-7 rounded-full border border-white/5 shrink-0"
                />
                <div className="leading-none">
                  <span className="text-[10px] font-bold text-white block">{post.author}</span>
                  <span className="text-[8px] text-zinc-500 block mt-0.5">{post.authorRole}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Dynamic post content Modal overlay */}
      <AnimatePresence>
        {activePost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020205]/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActivePostId(null)}
          >
            <motion.div 
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="bg-[#0c0d16] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[550px] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-left space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActivePostId(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                <span>Blog</span>
                <span>/</span>
                <span>{activePost.category}</span>
                <span>/</span>
                <span className="text-[#8677FF]">{activePost.readTime}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                {activePost.title}
              </h2>

              <div className="text-xs text-slate-300 leading-relaxed space-y-4 whitespace-pre-wrap max-w-none border-b border-white/5 pb-4">
                {activePost.content}
              </div>

              <div className="flex items-center space-x-3.5 pt-2">
                <img 
                  src={activePost.avatar} 
                  alt={activePost.author}
                  className="w-9 h-9 rounded-full border border-white/10 shrink-0"
                />
                <div className="leading-none text-left">
                  <span className="text-xs font-bold text-white block">{activePost.author}</span>
                  <span className="text-[9px] text-zinc-500 block mt-1">{activePost.authorRole} • Published {activePost.date}</span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

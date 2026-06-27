'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Video, 
  FileText, 
  Settings, 
  Plus, 
  Trash2, 
  ArrowRight,
  Monitor,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CollectProductPage() {
  // Customizer States
  const [spaceName, setSpaceName] = useState('Acme Tech Labs');
  const [headerTitle, setHeaderTitle] = useState('Love our product?');
  const [customMessage, setCustomMessage] = useState('Share your experience with us! It takes less than 60 seconds.');
  const [themeColor, setThemeColor] = useState('#8677FF'); // Violet accent
  const [collectVideo, setCollectVideo] = useState(true);
  const [collectText, setCollectText] = useState(true);
  const [questions, setQuestions] = useState([
    'How has Acme helped you solve your daily engineering workflows?',
    'What is your favorite feature and why?',
    'Would you recommend Acme to other SaaS founders?'
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile');
  
  // Custom swatches
  const colorSwatches = [
    { name: 'Violet', value: '#8677FF' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Orange', value: '#F97316' }
  ];

  const handleAddQuestion = () => {
    if (newQuestionText.trim()) {
      setQuestions([...questions, newQuestionText.trim()]);
      setNewQuestionText('');
    }
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-12 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#8677FF]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <span className="bg-[#8677FF]/10 text-[#8677FF] border border-[#8677FF]/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          Collection Forms
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          Capture customer love <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#8677FF] bg-clip-text text-transparent">
            without the friction
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Design beautiful, customizable review collection links that work natively on any desktop, tablet, or mobile browser with zero app installs.
        </p>
      </section>

      {/* Main Workspace Area */}
      <section className="max-w-7xl mx-auto px-6 pb-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Form Configurator (7 Columns) */}
        <div className="lg:col-span-6 bg-[#0c0d16] border border-white/[0.06] rounded-2xl p-6 space-y-6 shadow-2xl relative">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Settings className="w-4 h-4 text-[#8677FF]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">Form Configurator</h2>
          </div>

          {/* Space Name */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Space Name</label>
            <input 
              type="text" 
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl px-4 py-2.5 text-xs text-white transition duration-200"
              placeholder="e.g. Acme Tech Labs"
            />
          </div>

          {/* Header Title */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Header Title</label>
            <input 
              type="text" 
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl px-4 py-2.5 text-xs text-white transition duration-200"
              placeholder="e.g. Love our product?"
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Message / Prompts</label>
            <textarea 
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full h-18 bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl px-4 py-2.5 text-xs text-white transition duration-200 resize-none leading-relaxed"
              placeholder="Share details about what makes us special..."
            />
          </div>

          {/* Swatch Picker */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Brand Accent Color</label>
            <div className="flex items-center space-x-3.5">
              {colorSwatches.map((swatch, idx) => (
                <button
                  key={idx}
                  onClick={() => setThemeColor(swatch.value)}
                  className={`w-6 h-6 rounded-full border-2 transition duration-200 relative ${
                    themeColor === swatch.value ? 'border-white scale-110 shadow-lg shadow-white/10' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.value }}
                  aria-label={`Select ${swatch.name}`}
                />
              ))}
            </div>
          </div>

          {/* Collection Methods */}
          <div className="grid grid-cols-2 gap-4 text-left pt-2">
            <div className="bg-zinc-950 border border-white/[0.06] p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-red-500" />
                <span className="text-[11px] font-bold text-slate-300">Allow Video</span>
              </div>
              <input 
                type="checkbox" 
                checked={collectVideo} 
                onChange={(e) => setCollectVideo(e.target.checked)}
                className="w-4 h-4 rounded text-[#8677FF] accent-[#8677FF] cursor-pointer"
              />
            </div>
            <div className="bg-zinc-950 border border-white/[0.06] p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-bold text-slate-300">Allow Text</span>
              </div>
              <input 
                type="checkbox" 
                checked={collectText} 
                onChange={(e) => setCollectText(e.target.checked)}
                className="w-4 h-4 rounded text-[#8677FF] accent-[#8677FF] cursor-pointer"
              />
            </div>
          </div>

          {/* Guide Questions */}
          <div className="space-y-3 text-left pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Guide Questions Checklist</label>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              <AnimatePresence>
                {questions.map((q, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center justify-between bg-zinc-950 border border-white/[0.05] p-2.5 rounded-lg text-[10.5px] text-slate-300"
                  >
                    <span className="truncate max-w-[90%]">{q}</span>
                    <button 
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-zinc-650 hover:text-red-500 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add question form */}
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Ask reviewer about onboarding, APIs, support..."
                className="flex-1 bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl px-3.5 py-2 text-xs text-white transition duration-200"
                onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
              />
              <button 
                onClick={handleAddQuestion}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Visual Simulator Preview (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-4">
          
          {/* Toggle Device buttons */}
          <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-full border border-white/5">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                previewDevice === 'mobile' ? 'bg-[#8677FF] text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                previewDevice === 'desktop' ? 'bg-[#8677FF] text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Simulator Wrapper Frame */}
          <div className="w-full flex items-center justify-center">
            <div 
              className={`bg-[#030303] border-4 border-zinc-800 rounded-[36px] shadow-2xl relative transition-all duration-300 overflow-hidden ${
                previewDevice === 'mobile' 
                  ? 'w-[280px] h-[520px] px-4 py-6' 
                  : 'w-full max-w-[480px] h-[400px] px-6 py-6'
              }`}
            >
              {/* Speaker pill notch for mobile */}
              {previewDevice === 'mobile' && (
                <div className="w-20 h-4 bg-zinc-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-8 h-1 bg-zinc-900 rounded-full" />
                </div>
              )}

              {/* Internal simulator preview contents */}
              <div className="w-full h-full flex flex-col justify-between text-left relative z-10 select-none overflow-y-auto pr-0.5 animate-fadeIn">
                
                {/* Brand header */}
                <div className="flex items-center space-x-2.5 pb-2.5 border-b border-white/5 mt-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[9px] text-white shrink-0 shadow-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    {spaceName ? spaceName.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="leading-none text-left">
                    <span className="text-[10px] font-black text-white block">{spaceName || 'Space Name'}</span>
                    <span className="text-[7.5px] text-zinc-500 block mt-0.5">Testimonial Collector</span>
                  </div>
                </div>

                {/* Form texts */}
                <div className="space-y-2 my-2.5 text-left">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                    {headerTitle || 'Love our product?'}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 leading-relaxed">
                    {customMessage || 'Share details about your experience...'}
                  </p>
                </div>

                {/* Guide questions box */}
                {questions.length > 0 && (
                  <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-3 space-y-1.5 mb-2.5 text-left">
                    <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest block">Guide Checklist</span>
                    <ul className="space-y-1 text-[8.5px] text-slate-300 leading-snug">
                      {questions.map((q, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-[7.5px] select-none" style={{ color: themeColor }}>✓</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2 mt-auto">
                  {collectVideo && (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-white font-bold text-[10px] py-2 rounded-lg flex items-center justify-center space-x-1 shadow-lg cursor-pointer focus:outline-none"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      <span>Record Video Testimonial</span>
                    </motion.button>
                  )}

                  {collectText && (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 text-slate-200 font-bold text-[10px] py-2 rounded-lg flex items-center justify-center space-x-1 cursor-pointer focus:outline-none"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>Send Text Review</span>
                    </motion.button>
                  )}
                </div>

              </div>

              {/* Phone home indicator */}
              {previewDevice === 'mobile' && (
                <div className="w-24 h-1 bg-zinc-800 absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full z-20" />
              )}
            </div>
          </div>

          {/* Quick Publish Action */}
          <div className="pt-4 text-center">
            <Link href="/signup">
              <button 
                className="bg-gradient-to-r from-[#6C5CFF] to-[#8677FF] text-white font-bold text-xs py-3 px-6 rounded-full flex items-center space-x-1.5 shadow-[0_4px_15px_rgba(108,92,255,0.35)] hover:scale-102 cursor-pointer focus:outline-none"
              >
                <span>Save Space & Deploy Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

        </div>

      </section>

      <Footer />
    </div>
  );
}

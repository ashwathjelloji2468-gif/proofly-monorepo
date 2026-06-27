'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useStore, SupportTicket } from '@/store/useStore';
import { 
  Search, 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  ChevronRight, 
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportPage() {
  const { supportTickets, createSupportTicket, addTicketReply, closeTicket } = useStore();

  // Search Knowledge Base State
  const [kbQuery, setKbQuery] = useState('');

  // Contact support states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactCategory, setContactCategory] = useState('Getting Started');
  const [contactPriority, setContactPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [contactMessage, setContactMessage] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // UI status overlays
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  // Live Chat Drawer State
  const [showChatDrawer, setShowChatDrawer] = useState(false);

  const activeTicket = supportTickets.find(t => t.id === activeTicketId);

  // Knowledge Base articles Database
  const kbArticles = [
    { title: 'How to embed the Wall of Love widget on Webflow', category: 'Embeds', content: 'Step-by-step instructions to embed your iframe script code using custom elements inside Webflow.' },
    { title: 'Setting up custom questions for video testimonials', category: 'Testimonials', content: 'Add guidance prompts inside your space collection rules to elicit deep customer value details.' },
    { title: 'Restricting API access using scoped Live keys', category: 'API', content: 'Ensure bearer headers restrict writes to authorization tokens limits.' },
    { title: 'Upgrading or canceling subscription packages', category: 'Billing', content: 'Manage payments securely, download PDF invoices, and bind coupon discounts.' }
  ];

  const filteredKb = kbArticles.filter(art => 
    art.title.toLowerCase().includes(kbQuery.toLowerCase()) ||
    art.content.toLowerCase().includes(kbQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(kbQuery.toLowerCase())
  );

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactSubject && contactMessage) {
      createSupportTicket({
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        category: contactCategory,
        priority: contactPriority,
        message: contactMessage
      });
      // reset
      setContactSubject('');
      setContactMessage('');
      setAttachmentName('');
      setSuccessSubmitted(true);
      setTimeout(() => setSuccessSubmitted(false), 4000);
    }
  };

  const handleSendReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTicketId && replyMessage) {
      addTicketReply(activeTicketId, replyMessage);
      setReplyMessage('');
    }
  };

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden relative">
      <Navbar />

      {/* Hero Search Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#6366F1]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <span className="bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/20 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block mb-3.5">
          Support Desk
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          How can we help you <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            today?
          </span>
        </h1>

        {/* Knowledge base search bar */}
        <div className="max-w-xl mx-auto mt-6 relative">
          <input 
            type="text"
            value={kbQuery}
            onChange={(e) => setKbQuery(e.target.value)}
            placeholder="Search help topics (e.g. 'webflow', 'SSO', 'API')..."
            className="w-full bg-[#0c0d16] border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl pl-10 pr-4 py-3 text-xs text-white transition duration-200 shadow-xl"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </section>

      {/* Main Support Grid Workspace */}
      <section className="max-w-7xl mx-auto px-6 pb-24 w-full space-y-10 flex-1 flex flex-col text-left">
        
        {/* Knowledge Base Results Overlay (if searching) */}
        {kbQuery && (
          <div className="bg-[#0c0d16] border border-white/[0.05] p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Search Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKb.map((art, idx) => (
                <div key={idx} className="bg-zinc-950/60 p-4 border border-white/[0.04] rounded-2xl text-left space-y-2">
                  <span className="text-[8px] font-black uppercase text-[#6366F1] tracking-wider block">{art.category}</span>
                  <h4 className="text-xs font-bold text-white leading-tight">{art.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{art.content}</p>
                </div>
              ))}
              {filteredKb.length === 0 && (
                <div className="text-zinc-650 text-xs py-4 md:col-span-2 text-center">
                  No matching help articles found. Check contact form below to ask support.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Support Cards Grid */}
        {!kbQuery && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              'Getting Started', 'Authentication', 'Billing', 'Testimonials', 
              'Wall of Love', 'AI Features', 'Embeds', 'API', 
              'Integrations', 'Account Settings'
            ].map((cat, idx) => (
              <div 
                key={idx}
                onClick={() => setKbQuery(cat)}
                className="bg-[#0c0d16] border border-white/[0.05] hover:border-[#6366F1]/25 hover:scale-102 p-4 rounded-2xl cursor-pointer text-center space-y-2 transition duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-slate-450">
                  <BookOpen className="w-4 h-4 text-brand-teal" />
                </div>
                <span className="text-[9.5px] font-bold text-white block truncate">{cat}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ticket Dashboard + Contact Support intake form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Support Ticket Intake Form */}
          <div className="lg:col-span-7 bg-[#0c0d16] border border-white/[0.05] p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#6366F1] block">Contact Support Desk</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase">Average response: 4 hrs</span>
            </div>

            {successSubmitted ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-3 animate-fadeIn">
                <div className="w-11 h-11 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald shadow-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black text-white">Ticket Submitted Successfully!</h3>
                <p className="text-[10px] text-slate-450 max-w-sm leading-relaxed mx-auto">
                  Your support ticket has been logged into the Dashboard. Check active status registry block to post updates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white"
                      placeholder="Ateeqhulla Khan Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white"
                      placeholder="jane@domain.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white"
                      placeholder="e.g. Wall of love widgets alignment broken"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Priority</label>
                    <select
                      value={contactPriority}
                      onChange={(e: any) => setContactPriority(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white cursor-pointer"
                    >
                      <option value="HIGH">HIGH priority</option>
                      <option value="MEDIUM">MEDIUM priority</option>
                      <option value="LOW">LOW priority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white cursor-pointer"
                    >
                      <option value="Getting Started">Getting Started</option>
                      <option value="Billing & Pricing">Billing & Pricing</option>
                      <option value="Embeds & Wall of Love">Embeds & Wall of Love</option>
                      <option value="API Integration">API Integration</option>
                      <option value="Account Access">Account Access</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Company (Optional)</label>
                    <input 
                      type="text" 
                      value={contactCompany}
                      onChange={(e) => setContactCompany(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white"
                      placeholder="e.g. Stripe Inc."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Message details</label>
                  <textarea 
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full h-24 bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white resize-none"
                    placeholder="Provide screenshot links or developer logs if available..."
                  />
                </div>

                {/* Mock file upload selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="file" 
                      id="file-attachment"
                      onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || '')}
                      className="hidden" 
                    />
                    <label 
                      htmlFor="file-attachment"
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[9px] px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      Attach screenshots
                    </label>
                    <span className="text-[9px] text-zinc-500 font-mono truncate max-w-xs">{attachmentName || 'No files attached'}</span>
                  </div>

                  <button 
                    type="submit"
                    className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-3 px-6 rounded-full flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <span>Submit Help Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </form>
            )}
          </div>

          {/* Active Support Tickets Dashboard list */}
          <div className="lg:col-span-5 bg-[#0c0d16] border border-white/[0.05] p-6 rounded-3xl shadow-2xl text-left space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <MessageSquare className="w-4 h-4 text-brand-teal" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Active Help Tickets</h3>
            </div>

            <div className="space-y-3.5 overflow-y-auto max-h-[380px] scrollbar-thin">
              {supportTickets.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setActiveTicketId(t.id)}
                  className="bg-zinc-950/60 border border-white/[0.04] p-3.5 rounded-xl hover:border-[#6366F1]/25 cursor-pointer transition duration-200 space-y-2 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                      t.status === 'OPEN' ? 'bg-brand-teal/10 text-brand-teal' : t.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-450' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono">{t.createdAt.slice(0,10)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{t.subject}</h4>
                  <div className="flex justify-between items-center text-[8.5px] text-zinc-500 font-bold">
                    <span>Priority: {t.priority}</span>
                    <span>{t.replies.length} messages</span>
                  </div>
                </div>
              ))}

              {supportTickets.length === 0 && (
                <div className="py-20 text-center text-zinc-650 text-xs border border-dashed border-white/5 rounded-xl">
                  No active support tickets logged. Submit form to open ticket.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Ticket replies thread modal */}
      <AnimatePresence>
        {activeTicket && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020205]/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveTicketId(null)}
          >
            <motion.div 
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="bg-[#0c0d16] border border-white/[0.08] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-left space-y-4 flex flex-col max-h-[500px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveTicketId(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                <span>Support Ticket</span>
                <span>/</span>
                <span>{activeTicket.category}</span>
                <span>/</span>
                <span className="text-[#6366F1]">{activeTicket.priority}</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-black text-white truncate max-w-xs">{activeTicket.subject}</h3>
                <button 
                  onClick={() => {
                    closeTicket(activeTicket.id);
                    setActiveTicketId(null);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-[9px] font-bold px-3 py-1.5 rounded-lg text-slate-350 cursor-pointer"
                >
                  Close Issue
                </button>
              </div>

              {/* Thread logs list */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin text-xs leading-relaxed max-h-[220px]">
                {/* Client core message */}
                <div className="bg-zinc-950/60 p-3 border border-white/[0.04] rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                    <span>{activeTicket.name} (Creator)</span>
                    <span className="font-mono">{activeTicket.createdAt.slice(11,16)}</span>
                  </div>
                  <p className="text-[10px] text-slate-200">{activeTicket.message}</p>
                </div>

                {/* Reply records */}
                {activeTicket.replies.map((rep) => (
                  <div 
                    key={rep.id} 
                    className={`p-3 border rounded-xl space-y-1 text-left ${
                      rep.author === 'You' ? 'bg-[#6366F1]/5 border-[#6366F1]/15' : 'bg-brand-teal/5 border-brand-teal/15'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                      <span className={rep.author !== 'You' ? 'text-brand-teal' : 'text-[#6366F1]'}>{rep.author}</span>
                      <span className="font-mono">{rep.createdAt.slice(11,16)}</span>
                    </div>
                    <p className="text-[10px] text-slate-200">{rep.message}</p>
                  </div>
                ))}
              </div>

              {/* Send response bar */}
              {activeTicket.status !== 'CLOSED' ? (
                <form onSubmit={handleSendReplySubmit} className="flex gap-2.5 pt-2">
                  <input 
                    type="text" 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    required
                    placeholder="Type your response update here..."
                    className="flex-1 bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                  <button 
                    type="submit"
                    className="bg-[#6366F1] hover:bg-[#7263EB] text-white font-bold text-[10px] px-4 rounded-xl cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              ) : (
                <div className="text-zinc-650 text-[10px] text-center py-2">
                  This support ticket is closed. Submit form to log a new ticket.
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Live Chat Bubble */}
      <div className="fixed bottom-6 left-6 z-40">
        <button 
          onClick={() => setShowChatDrawer(true)}
          className="bg-brand-teal hover:bg-brand-emerald text-zinc-950 font-black p-3.5 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition hover:scale-105 cursor-pointer relative"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#09090B] animate-ping" />
        </button>
      </div>

      {/* Live Chat drawer overlay */}
      <AnimatePresence>
        {showChatDrawer && (
          <motion.div 
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            className="fixed bottom-22 left-6 z-40 max-w-xs w-full bg-[#0c0d16]/95 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl shadow-2xl flex flex-col space-y-3.5 text-left"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-brand-teal" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Chat desk</span>
              </div>
              <button 
                onClick={() => setShowChatDrawer(false)}
                className="text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              We typically reply within **24 hours**. Submit details or ask account verification links below.
            </p>

            <div className="bg-zinc-950/60 p-3 rounded-lg border border-white/[0.04]">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider block">Status</span>
              <span className="text-[9.5px] font-bold text-white block mt-0.5">Live Desk Offline</span>
            </div>

            <button
              onClick={() => setShowChatDrawer(false)}
              className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-[9.5px] py-2 rounded-lg transition cursor-pointer text-center"
            >
              Okay, got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

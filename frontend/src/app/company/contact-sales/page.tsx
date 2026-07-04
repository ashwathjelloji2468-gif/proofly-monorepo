'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Mail, 
  ChevronDown, 
  Check, 
  ArrowRight,
  Sparkles,
  Building,
  Users
} from 'lucide-react';

export default function ContactSalesPage() {
  // Form states
  const [fullName, setFullName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState('11-50');
  const [message, setMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && businessEmail && companyName) {
      setFormSubmitted(true);
    }
  };

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans  overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-12 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#6366F1]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <span className="bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          Connect with Enterprise sales
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          Scale your enterprise <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            social proof loop
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Need white-label templates, custom domains hosting, dedicated SSO/SAML auth systems, or bespoke SLAs? Tell us about your client conversion targets.
        </p>
      </section>

      {/* Main Form Section */}
      <section className="max-w-4xl mx-auto px-6 pb-24 w-full text-left">
        <div className="bg-[#0c0d16] border border-white/[0.05] rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl relative">
          
          {formSubmitted ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3 animate-fadeIn">
              <div className="w-11 h-11 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald shadow-lg">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">Lead Submitted Successfully!</h3>
              <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed mx-auto">
                Thank you for contacting sales. Our Enterprise Growth Desk will review your project requirements and email you back at **{businessEmail}** within 4 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitContact} className="space-y-4">
              
              {/* Full Name & Business Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white transition duration-200"
                    placeholder="e.g. Ateeqhulla Khan Doe"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Business Email</label>
                  <input 
                    type="email" 
                    required
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white transition duration-200"
                    placeholder="e.g. jane@company.com"
                  />
                </div>
              </div>

              {/* Company Name & Team Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Company Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl pl-8 pr-4 py-2 text-xs text-white transition duration-200"
                      placeholder="e.g. Stripe Inc."
                    />
                    <Building className="w-3.5 h-3.5 text-zinc-650 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                
                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Team Size</label>
                  <div className="relative">
                    <select
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl pl-8 pr-4 py-2.5 text-xs text-white transition duration-200 appearance-none cursor-pointer"
                    >
                      <option value="1-10">1 - 10 members</option>
                      <option value="11-50">11 - 50 members</option>
                      <option value="51-200">51 - 200 members</option>
                      <option value="200+">200+ members</option>
                    </select>
                    <Users className="w-3.5 h-3.5 text-zinc-650 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Project Requirements / Details</label>
                <textarea 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-24 bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3.5 py-2 text-xs text-white transition duration-200 resize-none leading-relaxed"
                  placeholder="Tell us about your active space traffic, volume of video reviews, and target custom domains..."
                />
              </div>

              {/* Action Submit */}
              <div className="pt-2 text-right">
                <button 
                  type="submit"
                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-3 px-6 rounded-full flex items-center space-x-1.5 transition cursor-pointer focus:outline-none"
                >
                  <span>Submit Sales Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </form>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}

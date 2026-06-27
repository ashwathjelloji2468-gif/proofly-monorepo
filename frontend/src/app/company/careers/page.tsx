'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Check, 
  ArrowRight,
  Sparkles,
  Award,
  Coffee,
  Heart
} from 'lucide-react';

export default function CareersPage() {
  // Mock Jobs list
  const jobs = [
    { title: 'Senior Full-Stack Engineer', type: 'Full-time', location: 'Remote (GMT+/-4)', salary: '$140k - $170k' },
    { title: 'Lead Product Designer', type: 'Full-time', location: 'Remote (US/EU)', salary: '$120k - $150k' },
    { title: 'Technical Documentation Writer', type: 'Contract / PT', location: 'Remote', salary: '$60/hr - $80/hr' }
  ];

  // Benefits
  const benefits = [
    { title: '100% Remote Workspace', desc: 'Work from anywhere in the world. We offer home office stipends to optimize your desk setups.' },
    { title: 'Infinite Learning Stipend', desc: 'We cover 100% of books, conference entries, online courses, and research materials.' },
    { title: 'Flexible PTO & Health', desc: 'Unlimited vacation policy paired with comprehensive international medical coverage packages.' }
  ];

  // Talent Pool Form states
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [candidateNote, setCandidateNote] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (candidateName && candidateEmail && resumeLink) {
      setFormSubmitted(true);
    }
  };

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-12 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#10B981]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <span className="bg-[#10B981]/10 text-brand-emerald border border-brand-emerald/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          Careers at Proofly
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          Help us build the trust <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#8677FF] bg-clip-text text-transparent">
            layer of the web
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          We are a fully remote, fast-moving team of product designers, builders, and marketers passionate about developer tools and conversion optimization.
        </p>
      </section>

      {/* Benefits grid */}
      <section className="max-w-4xl mx-auto px-6 py-8 w-full text-left">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2.5 mb-6">
          Team Perks & Benefits
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {benefits.map((b, idx) => (
            <div key={idx} className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl space-y-2.5 text-left relative">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                {idx === 0 ? <Coffee className="w-3.5 h-3.5 text-brand-teal" /> : idx === 1 ? <Award className="w-3.5 h-3.5 text-[#8677FF]" /> : <Heart className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <h4 className="text-xs font-bold text-white tracking-wide">{b.title}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Positions List */}
      <section className="max-w-4xl mx-auto px-6 py-12 w-full text-left">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2.5 mb-6">
          Open Positions
        </h2>

        <div className="space-y-3">
          {jobs.map((job, idx) => (
            <div 
              key={idx}
              className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-white">{job.title}</h4>
                <div className="flex items-center space-x-3 text-[9.5px] text-zinc-500">
                  <span className="flex items-center space-x-1">
                    <Briefcase className="w-3 h-3" />
                    <span>{job.type}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{job.location}</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono">{job.salary}</span>
                </div>
              </div>

              <a href="#apply" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-[#8677FF] hover:bg-[#7263EB] text-white font-bold text-[10px] px-4 py-2 rounded-xl transition cursor-pointer">
                  Apply Now
                </button>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Talent Intake Form */}
      <section id="apply" className="max-w-4xl mx-auto px-6 py-12 pb-24 w-full text-left">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2.5 mb-6">
          Join the Talent Pool
        </h2>

        <div className="bg-[#0c0d16] border border-white/[0.05] rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl relative">
          
          {formSubmitted ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3 animate-fadeIn">
              <div className="w-11 h-11 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald shadow-lg">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">Application Received!</h3>
              <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
                Thank you for applying to Proofly's talent pool. Our design and dev coordinators will review your resume portfolio and contact you back via email!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl px-3.5 py-2 text-xs text-white transition duration-200"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Contact Email</label>
                  <input 
                    type="email" 
                    required
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl px-3.5 py-2 text-xs text-white transition duration-200"
                    placeholder="e.g. jane@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Resume / Portfolio Link</label>
                <input 
                  type="url" 
                  required
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl px-3.5 py-2 text-xs text-white transition duration-200"
                  placeholder="e.g. https://linkedin.com/in/janedoe"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Short Cover Note / Message</label>
                <textarea 
                  value={candidateNote}
                  onChange={(e) => setCandidateNote(e.target.value)}
                  className="w-full h-24 bg-zinc-950 border border-white/[0.08] focus:border-[#8677FF] outline-none rounded-xl px-3.5 py-2 text-xs text-white transition duration-200 resize-none leading-relaxed"
                  placeholder="Tell us what excites you about Proofly..."
                />
              </div>

              <div className="pt-2 text-right">
                <button 
                  type="submit"
                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-3 px-6 rounded-full flex items-center space-x-1.5 transition cursor-pointer focus:outline-none"
                >
                  <span>Submit Application</span>
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

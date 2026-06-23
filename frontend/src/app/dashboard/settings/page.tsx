'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Settings, 
  Globe, 
  Users, 
  CreditCard, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  ShieldAlert,
  Trash2,
  Plus
} from 'lucide-react';
import { StripeCheckoutModal } from '@/components/StripeCheckoutModal';

export default function SettingsPage() {
  const user = useStore(state => state.user);
  const updateBillingTier = useStore(state => state.updateBillingTier);

  // States
  const [activeSettingsTab, setActiveSettingsTab] = useState<'billing' | 'domains' | 'team'>('billing');
  
  // Domains
  const [domains, setDomains] = useState<string[]>(['reviews.acmesaas.io']);
  const [newDomain, setNewDomain] = useState('');
  
  // Team
  const [teamMembers, setTeamMembers] = useState<{ email: string; role: string }[]>([
    { email: 'colleague@acmesaas.io', role: 'Collaborator' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Collaborator');

  // Stripe Checkout success status
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  // Stripe Modal state
  const [selectedPlan, setSelectedPlan] = useState<{ id: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE'; name: string; price: string } | null>(null);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || domains.includes(newDomain)) return;
    setDomains([...domains, newDomain]);
    setNewDomain('');
  };

  const handleInviteTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || teamMembers.some(t => t.email === inviteEmail)) return;
    setTeamMembers([...teamMembers, { email: inviteEmail, role: inviteRole }]);
    setInviteEmail('');
  };

  const pricingPlans = [
    {
      id: 'FREE',
      name: 'Starter Plan',
      price: '$0',
      period: 'forever',
      features: ['1 Active collection Space', '10 Total testimonials limit', 'Standard text collections', 'PowerTestimonials watermark badge']
    },
    {
      id: 'PRO',
      name: 'Professional',
      price: '$49',
      period: 'monthly',
      features: ['5 Active Spaces', '100 Total testimonials', 'HD Video camera recorder', 'Custom CSS styling themes', 'Remove branding watermarks']
    },
    {
      id: 'BUSINESS',
      name: 'Business Growth',
      price: '$99',
      period: 'monthly',
      features: ['Unlimited Spaces', '1,000 Testimonials', 'AI Sentiment Engine summaries', 'Custom domain mapping', 'CSV/Spreadsheet bulk imports']
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise Dedicated',
      price: '$249',
      period: 'monthly',
      features: ['Unlimited everything', 'Dedicated vector clusters', 'Mux webhook SLA agreements', 'SAML SSO security', 'Account Manager support']
    }
  ] as const;

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0">
      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-brand-emerald" />
            <span>Workspace Settings</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Manage subscriptions, invite teammates, and configure custom domain aliases.</p>
        </div>
      </header>

      {/* Settings Panel Grid */}
      <main className="p-8 max-w-5xl w-full text-left space-y-6">
        
        {/* Checkout alert banner */}
        {checkoutSuccess && (
          <div className="bg-brand-emerald/10 border border-brand-emerald/30 p-4 rounded-xl flex items-center space-x-3 text-slate-100 shadow-md">
            <Check className="w-5 h-5 text-brand-emerald shrink-0" />
            <span className="text-xs font-bold">{checkoutSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <aside className="md:col-span-1 space-y-2 shrink-0 select-none">
            {[
              { id: 'billing', label: 'Subscription Plans', desc: 'Manage Stripe billing', icon: <CreditCard className="w-4 h-4 text-brand-teal" /> },
              { id: 'domains', label: 'Custom Domains', desc: 'CNAME setup links', icon: <Globe className="w-4 h-4 text-brand-emerald" /> },
              { id: 'team', label: 'Workspace Team', desc: 'Invite administrators', icon: <Users className="w-4 h-4 text-brand-teal" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSettingsTab(tab.id as any);
                  setCheckoutSuccess(null);
                }}
                className={`w-full text-left p-3 border rounded-xl flex items-center space-x-3 transition cursor-pointer ${
                  activeSettingsTab === tab.id
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

          {/* Settings Details Canvas */}
          <section className="md:col-span-3 bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl relative min-h-[400px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-emerald/5 rounded-full blur-2xl -z-10" />

            {/* BILLING PLANS TAB */}
            {activeSettingsTab === 'billing' && user && (
              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-brand-teal" />
                    <span>Billing Plans</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Select a plan to upgrade your workspace. Upgrading is simulated instantly via Stripe SDK hooks.</p>
                </div>

                {/* Active user status banner */}
                <div className="bg-[#09090B] border border-border-primary p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-brand-emerald" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Active Plan Tier</span>
                      <span className="text-sm font-black text-white uppercase tracking-wider">{user.tier} Membership</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2.5 py-1 rounded-full font-black uppercase">
                    Active Account
                  </span>
                </div>

                {/* Pricing Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricingPlans.map((plan) => {
                    const isCurrent = user.tier === plan.id;
                    return (
                      <div 
                        key={plan.id} 
                        className={`p-5 border rounded-xl flex flex-col justify-between space-y-4 relative ${
                          isCurrent 
                            ? 'bg-brand-emerald/5 border-brand-emerald' 
                            : 'bg-[#09090B] border-border-primary'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-2.5 right-4 bg-brand-emerald text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow">
                            Current Plan
                          </span>
                        )}

                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-extrabold text-white block">{plan.name}</span>
                            <span className="text-2xl font-black text-white block mt-1">
                              {plan.price}
                              <span className="text-xs text-muted-foreground font-normal"> / {plan.period}</span>
                            </span>
                          </div>

                          <ul className="space-y-1.5 pt-2 text-[10px] text-slate-400">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-center space-x-1.5">
                                <Check className="w-3 h-3 text-brand-teal shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => setSelectedPlan({ id: plan.id, name: plan.name, price: plan.price })}
                            className="w-full bg-[#18181B] hover:bg-[#27272A] border border-border-primary text-slate-200 hover:text-white font-bold text-[11px] py-2 rounded-lg cursor-pointer transition text-center block"
                          >
                            Upgrade Plan
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DOMAINS TAB */}
            {activeSettingsTab === 'domains' && (
              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-brand-emerald" />
                    <span>Custom Domains Mapping</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">White-label your collection URLs by mapping customized subdomains.</p>
                </div>

                {/* Form to add custom domain */}
                <form onSubmit={handleAddDomain} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. feedback.yourcompany.com"
                    className="flex-1 bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                  <button
                    type="submit"
                    className="bg-[#09090B] hover:bg-[#18181B] text-slate-300 hover:text-white font-bold text-xs py-2 px-4 border border-border-primary rounded-lg flex items-center space-x-1 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Alias</span>
                  </button>
                </form>

                {/* List current domains */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold text-brand-teal uppercase tracking-widest">Domains list</h4>
                  {domains.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No custom domains added yet.</p>
                  ) : (
                    domains.map((dom) => (
                      <div key={dom} className="bg-[#09090B] border border-border-primary p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                          <span className="text-xs font-semibold text-white">{dom}</span>
                        </div>
                        <button
                          onClick={() => setDomains(domains.filter(d => d !== dom))}
                          className="text-zinc-600 hover:text-red-400 p-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* CNAME configuration instructions */}
                <div className="bg-[#09090B] border border-border-primary rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-brand-teal" />
                    <span>DNS Configuration Instructions</span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Access your domain registrar (GoDaddy, Namecheap, Cloudflare) and create a CNAME record with these credentials:
                  </p>
                  <table className="w-full text-[10px] font-mono border-t border-border-primary/50 pt-2">
                    <tbody>
                      <tr className="border-b border-border-primary/30">
                        <td className="py-2 text-zinc-500">Record Type</td>
                        <td className="py-2 text-brand-emerald font-black">CNAME</td>
                      </tr>
                      <tr className="border-b border-border-primary/30">
                        <td className="py-2 text-zinc-500">Host / Name</td>
                        <td className="py-2 text-white font-semibold">feedback (or your subdomain name)</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-zinc-500">Value / Target</td>
                        <td className="py-2 text-white font-semibold">cname.powertestimonials.com</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TEAM MEMBERS TAB */}
            {activeSettingsTab === 'team' && user && (
              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-brand-teal" />
                    <span>Workspace Teammates</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Collaborate by inviting project administrators and content review moderators.</p>
                </div>

                {/* Form to invite teammates */}
                <form onSubmit={handleInviteTeam} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="flex-1 bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-[#09090B] border border-border-primary rounded-lg text-xs font-semibold py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    <option value="Collaborator">Collaborator</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-[#09090B] hover:bg-[#18181B] text-slate-300 hover:text-white font-bold text-xs py-2 px-4 border border-border-primary rounded-lg flex items-center space-x-1 cursor-pointer transition shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </form>

                {/* Team member list */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold text-brand-emerald uppercase tracking-widest">Active Members</h4>
                  
                  {/* Current User */}
                  <div className="bg-[#09090B] border border-border-primary p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground block">{user.email}</span>
                    </div>
                    <span className="text-[9px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded font-black uppercase">
                      Workspace Owner
                    </span>
                  </div>

                  {/* Invites list mapping */}
                  {teamMembers.map((member) => (
                    <div key={member.email} className="bg-[#09090B] border border-border-primary p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white block">{member.email}</span>
                        <span className="text-[10px] text-zinc-500 block">Invited Collaborator</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-[9px] bg-zinc-800 border border-border-primary text-slate-400 px-2 py-0.5 rounded font-black uppercase">
                          {member.role}
                        </span>
                        <button
                          onClick={() => setTeamMembers(teamMembers.filter(t => t.email !== member.email))}
                          className="text-zinc-600 hover:text-red-400 cursor-pointer transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </section>

        </div>

      </main>

      <StripeCheckoutModal 
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        tierKey={selectedPlan?.id || 'FREE'}
      />
    </div>
  );
}

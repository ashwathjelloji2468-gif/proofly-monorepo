'use client';

import React from 'react';
import { Settings, ShieldAlert } from 'lucide-react';
import { ProoflyLogo } from '@/components/ProoflyLogo';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-950/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-md w-full text-center space-y-6 bg-[#121214] border border-border-primary rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center space-x-2">
          <ProoflyLogo className="w-8 h-8" />
        </div>

        <div className="flex justify-center">
          <div className="p-4 bg-purple-950/40 rounded-full text-purple-400 border border-purple-900/40 animate-spin">
            <Settings className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight text-white uppercase">System Maintenance</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Proofly is currently undergoing scheduled platform upgrades or emergency performance adjustments. 
            We are working to bring the services back online shortly. Thank you for your patience.
          </p>
        </div>

        <div className="border-t border-border-primary/50 pt-4 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
          Platform Security Center
        </div>
      </div>
    </div>
  );
}

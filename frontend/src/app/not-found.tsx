import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found — Proofly',
  description: 'The page you are looking for does not exist.',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 font-sans">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-teal/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative text-center max-w-lg space-y-8">
        {/* 404 */}
        <div className="space-y-2">
          <p className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-brand-teal select-none">
            404
          </p>
          <h1 className="text-2xl font-bold text-white">Page not found</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            The page you&apos;re looking for has moved, been deleted, or never existed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-emerald to-brand-teal text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg shadow-brand-emerald/10"
          >
            Go to Homepage
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#18181B] border border-border-primary text-slate-300 hover:text-white hover:border-slate-600 rounded-xl text-sm font-semibold transition"
          >
            Open Dashboard
          </a>
        </div>

        {/* Helpful links */}
        <div className="text-[11px] text-slate-600 space-x-4">
          <a href="/docs" className="hover:text-slate-400 transition">Docs</a>
          <a href="/support" className="hover:text-slate-400 transition">Support</a>
          <a href="/status" className="hover:text-slate-400 transition">Status</a>
        </div>
      </div>
    </div>
  );
}

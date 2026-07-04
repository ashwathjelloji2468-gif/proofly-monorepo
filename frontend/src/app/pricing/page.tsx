'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/#pricing');
  }, [router]);
  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <p className="text-slate-400 text-sm animate-pulse">Loading pricing...</p>
    </div>
  );
}

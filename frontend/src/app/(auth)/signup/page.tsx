'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#09090B] text-slate-400">
      <div className="flex flex-col items-center space-y-3">
        <Loader className="w-8 h-8 text-brand-emerald animate-spin" />
        <span className="text-xs">Redirecting to passwordless sign up...</span>
      </div>
    </div>
  );
}

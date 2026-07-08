'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const inviteToken = searchParams.get('inviteToken');
    const dest = inviteToken ? `/auth?inviteToken=${inviteToken}` : '/auth';
    router.replace(dest);
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <Loader className="w-8 h-8 text-brand-emerald animate-spin" />
      <span className="text-xs">Redirecting to passwordless sign in...</span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#09090B] text-slate-400">
      <Suspense fallback={
        <div className="flex flex-col items-center space-y-3">
          <Loader className="w-8 h-8 text-brand-emerald animate-spin" />
          <span className="text-xs">Loading...</span>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}

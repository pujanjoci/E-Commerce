'use client';

import { login } from '@/app/actions/auth';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTransition } from 'react';

export default function AdminLoginPage() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden text-white">
      {/* High-Security Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-500/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Grid Pattern Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent text-white mb-8 mx-auto shadow-[0_0_50px_rgba(var(--accent-rgb),0.3)] border border-accent/50">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter uppercase italic">
          Admin Portal.
        </h2>
        <p className="mt-4 text-neutral-400 font-mono text-sm tracking-widest uppercase">
          Authorization Required // Level 0 Access
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/50 backdrop-blur-2xl py-12 px-8 shadow-2xl shadow-black/50 border border-white/5 rounded-[2.5rem] sm:px-12">
          <form className="space-y-8" action={handleSubmit} noValidate>
            {/* Hidden field to help the login action know we are in the admin portal if needed, 
                though our logic currently handles it via role check */}
            <input type="hidden" name="redirect_to" value="/admin" />

            <div className="space-y-3">
              <label htmlFor="email" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 px-1">
                 <Lock className="w-3 h-3" /> Identity String (Email)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@antigravity.com"
                className="block w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-5 text-white placeholder:text-neutral-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-lg transition-all"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 px-1">
                 <Lock className="w-3 h-3" /> Verification Key
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="block w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-5 text-white placeholder:text-neutral-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-lg transition-all"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center items-center gap-4 rounded-2xl bg-white py-6 px-6 text-xl font-black text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-accent hover:text-white transition-all active:scale-[0.98] group disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? 'Authenticating...' : 'Authenticate'}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-white/5">
            <Link href="/" className="text-neutral-500 font-mono text-xs uppercase tracking-widest hover:text-neutral-300 transition-colors">
              &larr; Return to Central Storefront
            </Link>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-8 text-neutral-600 font-mono text-[10px] uppercase tracking-tighter">
           <span>Sys_Ver: 2.0.4</span>
           <span>Status: Encrypted</span>
           <span>Auth: Supabase/SSR</span>
        </div>
      </div>
    </div>
  );
}

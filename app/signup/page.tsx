import { signUp } from '@/app/actions/auth';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-foreground text-background mb-8 mx-auto shadow-2xl transition-transform hover:scale-110 active:scale-95">
          <ShoppingBag className="w-8 h-8" />
        </Link>
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
          Join the Collective.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground font-medium">
          Create an account to track orders and save your curated collection.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-card/50 backdrop-blur-3xl py-10 px-8 shadow-2xl shadow-black/5 border border-border rounded-[2.5rem] sm:px-12">
          <form className="space-y-6" action={signUp} noValidate>
             <div className="space-y-2">
              <label htmlFor="full_name" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Alex Mercer"
                autoComplete="name"
                className="block w-full appearance-none rounded-2xl border border-border bg-background/50 px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-lg transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="alex@example.com"
                autoComplete="email"
                className="block w-full appearance-none rounded-2xl border border-border bg-background/50 px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-lg transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="block w-full appearance-none rounded-2xl border border-border bg-background/50 px-5 py-4 text-foreground placeholder:text-muted-foreground/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-lg transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex w-full justify-center items-center gap-3 rounded-2xl border border-transparent bg-foreground py-5 px-6 text-lg font-bold text-background shadow-2xl hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all active:scale-[0.98]"
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-accent font-bold hover:underline underline-offset-4">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-muted-foreground px-8 leading-relaxed">
          By joining, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

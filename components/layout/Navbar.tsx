import Link from 'next/link';
import { Search, Sparkle } from 'lucide-react';
import CartButton from '@/components/store/CartButton';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-[var(--ag-border)] bg-[var(--ag-base)]/86 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Ecommerce home">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--ag-text-primary)] text-[var(--ag-base)]">
              <Sparkle className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight text-[var(--ag-text-primary)]">
              Ecommerce
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/products" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--ag-text-secondary)] transition-colors hover:bg-[var(--ag-surface-2)] hover:text-[var(--ag-text-primary)]">
              Shop
            </Link>
            <Link href="/products?category=furniture" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--ag-text-secondary)] transition-colors hover:bg-[var(--ag-surface-2)] hover:text-[var(--ag-text-primary)]">
              Furniture
            </Link>
            <Link href="/products?category=lighting" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--ag-text-secondary)] transition-colors hover:bg-[var(--ag-surface-2)] hover:text-[var(--ag-text-primary)]">
              Lighting
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden w-56 lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ag-text-muted)]" />
            <input
              type="text"
              placeholder="Search pieces"
              className="h-10 w-full rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] pl-9 pr-3 text-sm text-[var(--ag-text-primary)] transition-all placeholder:text-[var(--ag-text-muted)] focus:border-[var(--ag-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-accent)]/20"
            />
          </div>
          <ThemeToggle />
          <CartButton />
        </div>
      </div>
    </header>
  );
}

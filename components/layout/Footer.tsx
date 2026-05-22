import Link from 'next/link';
import { Code, Globe, Mail, Sparkle } from 'lucide-react';

const shopLinks = [
  ['All Products', '/products'],
  ['Furniture', '/products?category=furniture'],
  ['Lighting', '/products?category=lighting'],
  ['Decor', '/products?category=decor'],
];

const supportLinks = ['Returns', 'Care Guide', 'Trade Program', 'Privacy'];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--ag-border)] bg-[var(--ag-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--ag-text-primary)] text-[var(--ag-base)]">
                <Sparkle className="h-4 w-4" />
              </span>
              <span className="font-semibold tracking-tight text-[var(--ag-text-primary)]">Ecommerce</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--ag-text-secondary)]">
              Thoughtful furniture, lighting, and objects for calm, durable spaces.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                [Globe, 'Website'],
                [Mail, 'Email'],
                [Code, 'Source'],
              ].map(([Icon, label]) => (
                <a
                  key={label as string}
                  href="#"
                  aria-label={label as string}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--ag-border)] text-[var(--ag-text-secondary)] transition-colors hover:border-[var(--ag-accent)] hover:text-[var(--ag-accent)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-[var(--ag-text-primary)]">Shop</h3>
            <ul className="mt-4 space-y-3">
              {shopLinks.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-[var(--ag-text-secondary)] transition-colors hover:text-[var(--ag-accent)]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-[var(--ag-text-primary)]">Support</h3>
            <ul className="mt-4 space-y-3">
              {supportLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[var(--ag-text-secondary)] transition-colors hover:text-[var(--ag-accent)]">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-[var(--ag-text-primary)]">Studio</h3>
            <p className="mt-4 text-sm leading-6 text-[var(--ag-text-secondary)]">
              Kathmandu and remote. Ships worldwide.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--ag-border)] pt-6 text-sm text-[var(--ag-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} Ecommerce.</p>
          <p>Built for quiet rooms and daily use.</p>
        </div>
      </div>
    </footer>
  );
}

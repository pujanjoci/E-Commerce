'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="section-padding bg-[var(--ag-surface)]">
      <div className="mx-auto grid max-w-7xl gap-8 border-y border-[var(--ag-border)] py-14 lg:grid-cols-12 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-6"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ag-accent)]">Private list</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ag-text-primary)] md:text-4xl">
            Early access to limited production runs.
          </h2>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="flex flex-col gap-3 sm:flex-row lg:col-span-6"
        >
          <input
            type="email"
            placeholder="Email address"
            className="h-12 min-w-0 flex-1 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-base)] px-4 text-sm text-[var(--ag-text-primary)] placeholder:text-[var(--ag-text-muted)] focus:border-[var(--ag-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-accent)]/20"
            required
          />
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--ag-text-primary)] px-5 text-sm font-semibold text-[var(--ag-base)] transition-transform hover:-translate-y-0.5">
            Join list <ArrowRight className="h-4 w-4" />
          </button>
        </motion.form>
      </div>
    </section>
  );
}

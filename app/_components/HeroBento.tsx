'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, BadgeCheck, Truck, Waves, type LucideIcon } from 'lucide-react';

const heroImages = [
  {
    src: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1600',
    alt: 'A sculptural lounge chair in a calm interior',
    title: 'Levitation Lounge Chair',
  },
  {
    src: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&q=80&w=900',
    alt: 'A warm pendant light above a quiet room',
    title: 'Halo Pendant Light',
  },
  {
    src: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=900',
    alt: 'Textured ceramic vessels arranged together',
    title: 'Zenith Ceramic Set',
  },
];

const trustItems: Array<{ icon: LucideIcon; title: string; body: string }> = [
  { icon: BadgeCheck, title: 'Maker-vetted', body: 'Small-batch production' },
  { icon: Truck, title: 'Ships free', body: 'On premium orders' },
];

const stats = [
  { value: '150+', label: 'Artisan runs' },
  { value: '4.9', label: 'Avg rating' },
  { value: '60 day', label: 'Returns' },
];

export default function HeroBento() {
  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { stiffness: 90, damping: 28, mass: 0.45 });
  const imageY = useTransform(smoothY, [0, 720], [0, 96]);
  const imageScale = useTransform(smoothY, [0, 720], [1, 1.05]);
  const copyY = useTransform(smoothY, [0, 720], [0, -34]);
  const railY = useTransform(smoothY, [0, 720], [0, 52]);
  const cardOneY = useTransform(smoothY, [0, 720], [0, -42]);
  const cardTwoY = useTransform(smoothY, [0, 720], [0, 68]);
  const parallaxStyle = (y: typeof imageY) => ({ y });

  return (
    <section className="relative overflow-hidden border-b border-[var(--ag-border)] bg-[var(--ag-base)]">
      <div className="noise-surface absolute inset-0 opacity-45" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-10 pt-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        <motion.div style={parallaxStyle(copyY)} className="max-w-2xl transform-gpu will-change-transform lg:col-span-5">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ag-text-secondary)]"
          >
            <Waves className="h-3.5 w-3.5 text-[var(--ag-accent)]" />
            Spring edit now live
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-5xl font-semibold leading-[0.98] tracking-tight text-[var(--ag-text-primary)] sm:text-6xl lg:text-7xl"
          >
            Furniture with a quieter kind of confidence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-6 max-w-xl text-base leading-7 text-[var(--ag-text-secondary)] sm:text-lg"
          >
            Warm materials, precise silhouettes, and objects that make a room feel settled without shouting for attention.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/products" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--ag-text-primary)] px-5 text-sm font-semibold text-[var(--ag-base)] transition-transform hover:-translate-y-0.5">
              Shop collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/products?category=furniture" className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] px-5 text-sm font-semibold text-[var(--ag-text-primary)] transition-colors hover:border-[var(--ag-accent)] hover:text-[var(--ag-accent)]">
              View furniture
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-10 grid max-w-lg grid-cols-2 gap-3"
          >
            {trustItems.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] p-4">
                <Icon className="h-4 w-4 text-[var(--ag-accent)]" />
                <p className="mt-3 text-sm font-semibold text-[var(--ag-text-primary)]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--ag-text-muted)]">{body}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative lg:col-span-7">
          <motion.div
            style={parallaxStyle(imageY)}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[5/6] overflow-hidden rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface-2)] shadow-[var(--ag-shadow-lg)] transform-gpu will-change-transform sm:aspect-[16/13]"
          >
            <motion.div style={{ scale: imageScale }} className="absolute inset-0 transform-gpu will-change-transform">
              <Image
                src={heroImages[0].src}
                alt={heroImages[0].alt}
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 text-white sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Featured piece</p>
              <p className="mt-2 max-w-sm text-2xl font-semibold leading-tight">{heroImages[0].title}</p>
            </div>
          </motion.div>

          <motion.div
            style={parallaxStyle(cardOneY)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.22 }}
            className="absolute -left-3 top-10 hidden w-32 overflow-hidden rounded-lg border border-white/40 bg-white/80 p-2 shadow-[var(--ag-shadow)] backdrop-blur transform-gpu will-change-transform sm:block lg:-left-8"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-md">
              <Image src={heroImages[1].src} alt={heroImages[1].alt} fill sizes="128px" className="object-cover" />
            </div>
            <p className="mt-2 truncate text-xs font-semibold text-neutral-950">{heroImages[1].title}</p>
          </motion.div>

          <motion.div
            style={parallaxStyle(cardTwoY)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.32 }}
            className="absolute -right-2 bottom-20 hidden w-36 overflow-hidden rounded-lg border border-white/40 bg-white/80 p-2 shadow-[var(--ag-shadow)] backdrop-blur transform-gpu will-change-transform sm:block lg:-right-6"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-md">
              <Image src={heroImages[2].src} alt={heroImages[2].alt} fill sizes="144px" className="object-cover" />
            </div>
            <p className="mt-2 truncate text-xs font-semibold text-neutral-950">{heroImages[2].title}</p>
          </motion.div>

          <motion.div
            style={parallaxStyle(railY)}
            className="absolute -bottom-7 left-4 right-4 grid grid-cols-3 overflow-hidden rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] shadow-[var(--ag-shadow)] transform-gpu will-change-transform sm:left-auto sm:right-8 sm:w-[430px]"
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="border-r border-[var(--ag-border)] p-4 last:border-r-0">
                <p className="text-xl font-semibold text-[var(--ag-text-primary)]">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--ag-text-muted)]">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

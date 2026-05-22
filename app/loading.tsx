import { ShoppingBag } from 'lucide-react'

export default function Loading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--ag-base)]">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="space-y-6 lg:col-span-5">
          <div className="inline-flex h-10 w-44 items-center gap-2 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)] px-3">
            <span className="loading-dot" />
            <span className="skeleton h-3 w-28 rounded-md" />
          </div>
          <div className="space-y-3">
            <div className="skeleton h-14 w-full max-w-lg rounded-lg" />
            <div className="skeleton h-14 w-10/12 rounded-lg" />
            <div className="skeleton h-14 w-7/12 rounded-lg" />
          </div>
          <div className="skeleton h-5 w-11/12 max-w-md rounded-md" />
          <div className="skeleton h-5 w-8/12 max-w-sm rounded-md" />
        </div>

        <div className="relative lg:col-span-7">
          <div className="relative aspect-[5/6] overflow-hidden rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface-2)] sm:aspect-[16/13]">
            <div className="loading-sheen absolute inset-0" />
            <div className="absolute inset-0 grid place-items-center text-[var(--ag-text-muted)]">
              <div className="loading-orbit grid h-16 w-16 place-items-center rounded-lg border border-[var(--ag-border)] bg-[var(--ag-surface)]">
                <ShoppingBag className="h-7 w-7" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/store/CartDrawer';

export default function LayoutRenderer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');
  const isAdminPage = pathname?.startsWith('/admin');
  
  const hideStoreLayout = isAuthPage || isAdminPage;

  if (hideStoreLayout) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

// App layout wrapper that conditionally shows header/footer

'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Don't show header/footer on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 pt-16 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
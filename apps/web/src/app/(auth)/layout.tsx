import type { Metadata } from 'next';
import { Logo } from '@/components/brand/Logo';

export const metadata: Metadata = {
  title: 'METFLIX — Sign in',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid-glow" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header>
          <Logo size="lg" />
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          {children}
        </main>
        <footer className="pt-6 text-xs text-text-subtle">
          Dev demo platform • Not for production use
        </footer>
      </div>
    </div>
  );
}

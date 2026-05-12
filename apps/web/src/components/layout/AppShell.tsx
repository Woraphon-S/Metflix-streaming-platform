'use client';

import { Navbar } from './Navbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <footer className="border-t border-white/5 bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-2 text-xs text-text-subtle">
          <span>© {new Date().getFullYear()} METFLIX — demo platform</span>
          <span>Built with Next.js, NestJS, and PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}

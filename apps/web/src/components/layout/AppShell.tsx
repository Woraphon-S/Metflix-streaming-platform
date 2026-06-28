'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Navbar } from './Navbar';
import { Logo } from '@/components/brand/Logo';

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'METFLIX',
    links: [
      { label: 'เกี่ยวกับเรา', href: '#' },
      { label: 'ร่วมงานกับเรา', href: '#' },
      { label: 'ห้องข่าว', href: '#' },
      { label: 'ศูนย์สื่อ', href: '#' },
    ],
  },
  {
    title: 'ช่วยเหลือ',
    links: [
      { label: 'ศูนย์ช่วยเหลือ', href: '#' },
      { label: 'บัญชีของฉัน', href: '/profile' },
      { label: 'ติดต่อเรา', href: '#' },
      { label: 'คำถามที่พบบ่อย', href: '#' },
    ],
  },
  {
    title: 'รับชม',
    links: [
      { label: 'ภาพยนตร์', href: '/movies' },
      { label: 'ซีรีส์', href: '/series' },
      { label: 'มาใหม่และกำลังฮิต', href: '/new' },
      { label: 'รายการของฉัน', href: '/my-list' },
    ],
  },
  {
    title: 'กฎหมาย',
    links: [
      { label: 'ความเป็นส่วนตัว', href: '#' },
      { label: 'ข้อกำหนดการใช้งาน', href: '#' },
      { label: 'การตั้งค่าคุกกี้', href: '#' },
      { label: 'ข้อมูลองค์กร', href: '#' },
    ],
  },
];

const SOCIAL = [
  { Icon: Facebook, label: 'Facebook' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Youtube, label: 'YouTube' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>

      <footer className="mt-16 border-t border-white/5 bg-surface/40">
        <div className="mx-auto max-w-[1800px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
            <div className="space-y-4">
              <Logo />
              <p className="max-w-xs text-sm text-text-muted">
                แพลตฟอร์มสตรีมมิงภาพยนตร์และซีรีส์ ดูได้ทุกที่ทุกเวลา
              </p>
              <div className="flex items-center gap-3">
                {SOCIAL.map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-text-muted transition hover:border-white/40 hover:text-text"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-16">
              {FOOTER_COLUMNS.map((col) => (
                <div key={col.title} className="space-y-3">
                  <h3 className="text-sm font-semibold text-text">{col.title}</h3>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-text-muted transition hover:text-text"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-1 border-t border-white/5 pt-6 text-xs text-text-subtle">
            <span>© {new Date().getFullYear()} METFLIX — แพลตฟอร์มเดโม</span>
            <span>พัฒนาด้วย Next.js, NestJS และ PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

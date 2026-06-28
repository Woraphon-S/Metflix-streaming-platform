'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { adminService } from '@/services/admin.service';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');

  const usersQ = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminService.users({ search: search || undefined, pageSize: 50 }),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">ผู้ใช้</h1>
        <p className="text-text-muted">เรียกดูบัญชีที่ลงทะเบียน</p>
      </header>

      <div className="max-w-md">
        <Input
          leading={<Search className="h-4 w-4" />}
          placeholder="ค้นหาด้วยอีเมล…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {usersQ.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : usersQ.data && usersQ.data.items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface/40">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">ผู้ใช้</th>
                <th className="px-4 py-3">อีเมล</th>
                <th className="px-4 py-3">บทบาท</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3">เข้าร่วมเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {usersQ.data.items.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-emerald text-xs font-bold text-background">
                          {u.displayName.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="font-medium">{u.displayName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={u.role === 'admin' ? 'success' : 'primary'}>
                      {u.role === 'admin' ? 'ผู้ดูแล' : 'ผู้ใช้'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.status === 'active' ? 'success' : 'warning'}>
                      {u.status === 'active' ? 'ใช้งานอยู่' : 'ถูกระงับ'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="ยังไม่มีผู้ใช้" description="เมื่อมีผู้ลงทะเบียน รายชื่อจะปรากฏที่นี่" />
      )}
    </div>
  );
}

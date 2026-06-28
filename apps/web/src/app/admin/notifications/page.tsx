'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Megaphone, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { notificationsService } from '@/services/notifications.service';
import { extractErrorMessage } from '@/services/api';
import type { NotificationType } from '@metflix/shared-types';

const schema = z.object({
  type: z.enum([
    'movie_published',
    'series_published',
    'episode_published',
    'system',
    'admin_message',
    'security',
  ]),
  title: z.string().min(1).max(140),
  message: z.string().min(1).max(800),
  targetUserId: z.string().uuid().optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

const TYPES: NotificationType[] = [
  'admin_message',
  'system',
  'movie_published',
  'series_published',
  'episode_published',
  'security',
];

const TYPE_LABELS: Record<NotificationType, string> = {
  admin_message: 'ข้อความจากผู้ดูแล',
  system: 'ระบบ',
  movie_published: 'เผยแพร่ภาพยนตร์',
  series_published: 'เผยแพร่ซีรีส์',
  episode_published: 'เผยแพร่ตอนใหม่',
  security: 'ความปลอดภัย',
};

export default function AdminNotificationsPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'admin_message', title: '', message: '', targetUserId: '' },
  });

  const sendMutation = useMutation({
    mutationFn: (values: FormValues) =>
      notificationsService.adminCreate({
        type: values.type,
        title: values.title,
        message: values.message,
        targetUserId: values.targetUserId || undefined,
      }),
    onSuccess: () => {
      setSent(true);
      form.reset({ type: 'admin_message', title: '', message: '', targetUserId: '' });
      setTimeout(() => setSent(false), 2500);
    },
    onError: (error) => setServerError(extractErrorMessage(error)),
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-emerald">
          <Megaphone className="h-5 w-5" />
          <span className="text-xs uppercase tracking-wide">การแจ้งเตือน</span>
        </div>
        <h1 className="font-display text-2xl font-bold">ส่งการแจ้งเตือน</h1>
        <p className="text-text-muted">
          ส่งข้อความถึงผู้ใช้ทุกคน หรือระบุบัญชีเดียวด้วยรหัสผู้ใช้ (ID)
        </p>
      </header>

      <form
        onSubmit={form.handleSubmit((values) => {
          setServerError(null);
          sendMutation.mutate(values);
        })}
        className="glass-strong grid max-w-3xl gap-4 rounded-2xl p-6 shadow-card sm:grid-cols-2"
      >
        <Select
          label="ประเภท"
          className="sm:col-span-1"
          {...form.register('type')}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Input
          label="ส่งถึงผู้ใช้ (ID) (ไม่บังคับ)"
          placeholder="เว้นว่างเพื่อส่งถึงผู้ใช้ทุกคน"
          hint="ส่งถึงผู้ใช้ที่ระบุด้วย id หรือเว้นว่างเพื่อส่งถึงทุกคน"
          {...form.register('targetUserId')}
        />
        <Input
          label="หัวข้อ"
          className="sm:col-span-2"
          error={form.formState.errors.title?.message}
          {...form.register('title')}
        />
        <Textarea
          label="ข้อความ"
          rows={4}
          className="sm:col-span-2"
          error={form.formState.errors.message?.message}
          {...form.register('message')}
        />
        {serverError && (
          <p className="sm:col-span-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}
        <div className="sm:col-span-2 flex items-center justify-end gap-3">
          {sent && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald">
              <CheckCircle2 className="h-4 w-4" /> ส่งการแจ้งเตือนแล้ว
            </span>
          )}
          <Button
            type="submit"
            variant="emerald"
            leading={<Send className="h-4 w-4" />}
            loading={sendMutation.isPending}
          >
            ส่งการแจ้งเตือน
          </Button>
        </div>
      </form>
    </div>
  );
}

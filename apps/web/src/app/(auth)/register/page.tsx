'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AtSign, Lock, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { extractErrorMessage } from '@/services/api';

const schema = z.object({
  displayName: z.string().min(2, 'อย่างน้อย 2 ตัวอักษร').max(40),
  email: z.string().email('กรอกอีเมลให้ถูกต้อง'),
  password: z.string().min(6, 'อย่างน้อย 6 ตัวอักษร').max(64),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await authService.register(values);
      setSession(res.accessToken, res.user);
      router.replace('/profiles');
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Registration failed'));
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-strong rounded-3xl p-7 shadow-card">
        <h1 className="font-display text-2xl font-bold">สร้างบัญชี</h1>
        <p className="mt-1 text-sm text-text-muted">
          เข้าร่วม METFLIX และสร้างรายการดูของคุณ
        </p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="ชื่อที่แสดง"
            leading={<UserCircle2 className="h-4 w-4" />}
            placeholder="ชื่อของคุณ"
            error={form.formState.errors.displayName?.message}
            {...form.register('displayName')}
          />
          <Input
            label="อีเมล"
            type="email"
            leading={<AtSign className="h-4 w-4" />}
            placeholder="you@metflix.app"
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />
          <Input
            label="รหัสผ่าน"
            type="password"
            leading={<Lock className="h-4 w-4" />}
            placeholder="อย่างน้อย 6 ตัวอักษร"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />
          {serverError && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {serverError}
            </p>
          )}
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
            สร้างบัญชี
          </Button>
          <p className="text-center text-sm text-text-muted">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login" className="text-primary-400 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

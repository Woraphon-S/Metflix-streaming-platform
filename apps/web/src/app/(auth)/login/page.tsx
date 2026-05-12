'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, AtSign, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { extractErrorMessage } from '@/services/api';

const userSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type UserForm = z.infer<typeof userSchema>;

const adminSchema = z.object({
  id: z.string().min(1, 'Admin id is required'),
  password: z.string().min(1, 'Password is required'),
});
type AdminForm = z.infer<typeof adminSchema>;

type Mode = 'user' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<Mode>('user');
  const [serverError, setServerError] = useState<string | null>(null);

  const userForm = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: '', password: '' },
  });
  const adminForm = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: { id: 'admin', password: '1234' },
  });

  const submitUser = async (values: UserForm) => {
    setServerError(null);
    try {
      const res = await authService.login(values);
      setSession(res.accessToken, res.user);
      router.replace('/browse');
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Login failed'));
    }
  };

  const submitAdmin = async (values: AdminForm) => {
    setServerError(null);
    try {
      const res = await authService.adminLogin(values);
      setSession(res.accessToken, res.user);
      router.replace('/admin');
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Admin login failed'));
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-strong rounded-3xl p-7 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-text-muted">
              {mode === 'user'
                ? 'Sign in to continue streaming'
                : 'Developer admin access'}
            </p>
          </div>
          {mode === 'admin' && <Badge tone="emerald">Demo only</Badge>}
        </div>

        <div className="mb-6 inline-flex rounded-full border border-white/10 bg-surface/50 p-1 text-sm">
          <button
            onClick={() => setMode('user')}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              mode === 'user' ? 'bg-primary text-white shadow-glow' : 'text-text-muted'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setMode('admin')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors ${
              mode === 'admin' ? 'bg-emerald text-background' : 'text-text-muted'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </button>
        </div>

        {mode === 'user' ? (
          <form onSubmit={userForm.handleSubmit(submitUser)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              leading={<AtSign className="h-4 w-4" />}
              placeholder="you@metflix.app"
              error={userForm.formState.errors.email?.message}
              {...userForm.register('email')}
            />
            <Input
              label="Password"
              type="password"
              leading={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              error={userForm.formState.errors.password?.message}
              {...userForm.register('password')}
            />
            {serverError && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {serverError}
              </p>
            )}
            <Button type="submit" className="w-full" loading={userForm.formState.isSubmitting}>
              Sign in
            </Button>
            <p className="text-center text-sm text-text-muted">
              New here?{' '}
              <Link href="/register" className="text-primary-400 hover:underline">
                Create an account
              </Link>
            </p>
            <div className="rounded-xl border border-white/10 bg-surface/40 p-3 text-xs text-text-subtle">
              Demo user: <span className="text-text">demo@metflix.local</span> / <span className="text-text">demo1234</span>
            </div>
          </form>
        ) : (
          <form onSubmit={adminForm.handleSubmit(submitAdmin)} className="space-y-4">
            <Input
              label="Admin ID"
              leading={<KeyRound className="h-4 w-4" />}
              error={adminForm.formState.errors.id?.message}
              {...adminForm.register('id')}
            />
            <Input
              label="Password"
              type="password"
              leading={<Lock className="h-4 w-4" />}
              error={adminForm.formState.errors.password?.message}
              {...adminForm.register('password')}
            />
            {serverError && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {serverError}
              </p>
            )}
            <Button
              type="submit"
              variant="emerald"
              className="w-full"
              loading={adminForm.formState.isSubmitting}
            >
              Enter admin console
            </Button>
            <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-3 text-xs text-emerald">
              Fixed dev account: <span className="font-semibold">id: admin</span>{' '}
              <span className="font-semibold">password: 1234</span>. Demo only — do not deploy as-is.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

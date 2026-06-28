'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { DEFAULT_AVATAR_KEY } from '@/lib/avatars';
import { profilesService } from '@/services/profiles.service';
import { useAuthStore } from '@/stores/auth.store';
import { extractErrorMessage } from '@/services/api';
import type { Profile } from '@metflix/shared-types';

const MAX_PROFILES = 5;

interface FormState {
  id: string | 'new';
  displayName: string;
  avatarKey: string;
}

function ManageProfiles() {
  const qc = useQueryClient();
  const activeProfile = useAuthStore((s) => s.activeProfile);
  const setActiveProfile = useAuthStore((s) => s.setActiveProfile);

  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profilesQ = useQuery({ queryKey: ['profiles'], queryFn: profilesService.list });
  const profiles = profilesQ.data ?? [];

  const reset = () => {
    setForm(null);
    setError(null);
  };

  const refresh = () => qc.invalidateQueries({ queryKey: ['profiles'] });

  const createMut = useMutation({
    mutationFn: (input: { displayName: string; avatarKey: string }) =>
      profilesService.create(input),
    onSuccess: () => {
      refresh();
      reset();
    },
    onError: (e) => setError(extractErrorMessage(e, 'เพิ่มโปรไฟล์ไม่สำเร็จ')),
  });

  const updateMut = useMutation({
    mutationFn: (input: FormState) =>
      profilesService.update(input.id, {
        displayName: input.displayName,
        avatarKey: input.avatarKey,
      }),
    onSuccess: (updated: Profile) => {
      if (activeProfile?.id === updated.id) setActiveProfile(updated);
      refresh();
      reset();
    },
    onError: (e) => setError(extractErrorMessage(e, 'บันทึกไม่สำเร็จ')),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => profilesService.remove(id),
    onSuccess: (_data, id) => {
      if (activeProfile?.id === id) setActiveProfile(null);
      refresh();
      reset();
    },
    onError: (e) => setError(extractErrorMessage(e, 'ลบไม่สำเร็จ')),
  });

  const busy = createMut.isPending || updateMut.isPending || removeMut.isPending;

  const submit = () => {
    if (!form) return;
    const displayName = form.displayName.trim();
    if (!displayName) {
      setError('กรุณากรอกชื่อโปรไฟล์');
      return;
    }
    if (form.id === 'new') {
      createMut.mutate({ displayName, avatarKey: form.avatarKey });
    } else {
      updateMut.mutate({ ...form, displayName });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <Link
            href={activeProfile ? '/browse' : '/profiles'}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" /> เสร็จสิ้น
          </Link>
        </div>

        <h1 className="mb-2 font-display text-3xl font-bold">จัดการโปรไฟล์</h1>
        <p className="mb-8 text-text-muted">
          เพิ่ม แก้ไข หรือลบโปรไฟล์ในบัญชีของคุณ (สูงสุด {MAX_PROFILES} โปรไฟล์)
        </p>

        {profilesQ.isLoading ? (
          <Spinner />
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) =>
              form && form.id === profile.id ? (
                <ProfileForm
                  key={profile.id}
                  form={form}
                  setForm={setForm}
                  onSubmit={submit}
                  onCancel={reset}
                  busy={busy}
                  error={error}
                  canDelete={!profile.isPrimary}
                  onDelete={() => removeMut.mutate(profile.id)}
                />
              ) : (
                <div
                  key={profile.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface/40 p-4"
                >
                  <ProfileAvatar
                    displayName={profile.displayName}
                    avatarKey={profile.avatarKey}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{profile.displayName}</p>
                    {profile.isPrimary && (
                      <p className="text-xs text-emerald">โปรไฟล์หลัก</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm({
                        id: profile.id,
                        displayName: profile.displayName,
                        avatarKey: profile.avatarKey ?? DEFAULT_AVATAR_KEY,
                      })
                    }
                  >
                    แก้ไข
                  </Button>
                </div>
              ),
            )}

            {form?.id === 'new' && (
              <ProfileForm
                form={form}
                setForm={setForm}
                onSubmit={submit}
                onCancel={reset}
                busy={busy}
                error={error}
                canDelete={false}
                onDelete={() => {}}
              />
            )}

            {!form && profiles.length < MAX_PROFILES && (
              <button
                onClick={() =>
                  setForm({ id: 'new', displayName: '', avatarKey: DEFAULT_AVATAR_KEY })
                }
                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/15 p-4 text-text-muted transition hover:border-white/40 hover:text-text"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5">
                  <Plus className="h-5 w-5" />
                </span>
                เพิ่มโปรไฟล์
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  busy,
  error,
  canDelete,
  onDelete,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  busy: boolean;
  error: string | null;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-primary/30 bg-surface/60 p-5">
      <div className="flex items-center gap-4">
        <ProfileAvatar
          displayName={form.displayName || 'A'}
          avatarKey={form.avatarKey}
          size="md"
        />
        <div className="flex-1">
          <Input
            name="displayName"
            autoFocus
            placeholder="ชื่อโปรไฟล์"
            maxLength={30}
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-text-muted">เลือกอวาตาร์</p>
        <AvatarPicker
          value={form.avatarKey}
          displayName={form.displayName}
          onChange={(key) => setForm({ ...form, avatarKey: key })}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={onSubmit} loading={busy}>
            {form.id === 'new' ? 'เพิ่มโปรไฟล์' : 'บันทึก'}
          </Button>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            ยกเลิก
          </Button>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            onClick={onDelete}
            disabled={busy}
            leading={<Trash2 className="h-4 w-4" />}
            className="text-danger hover:bg-danger/10"
          >
            ลบ
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ManageProfilesPage() {
  return (
    <AuthGuard requireProfile={false}>
      <ManageProfiles />
    </AuthGuard>
  );
}

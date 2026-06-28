'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { moviesService, type MovieAdminInput } from '@/services/movies.service';
import { extractErrorMessage } from '@/services/api';
import { formatDuration } from '@/lib/format';
import { STATUS_LABEL } from '@/lib/labels';

const movieSchema = z.object({
  title: z.string().min(1, 'จำเป็นต้องกรอก').max(200),
  description: z.string().max(4000).optional().or(z.literal('')),
  posterUrl: z.string().url().optional().or(z.literal('')),
  backdropUrl: z.string().url().optional().or(z.literal('')),
  trailerUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  durationSeconds: z.coerce.number().int().min(0).optional(),
  maturityRating: z.string().max(20).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  highlight: z
    .enum(['none', 'new', 'top10', 'new_episode', 'new_season'])
    .optional(),
  genre: z
    .enum([
      'anime',
      'animation',
      'korean_drama',
      'drama',
      'horror',
      'comedy',
      'tv_show',
      'action',
      'scifi',
      'thriller',
      'romance',
      'general',
    ])
    .optional(),
});
type MovieForm = z.infer<typeof movieSchema>;

export default function AdminMoviesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const moviesQ = useQuery({
    queryKey: ['admin', 'movies', search],
    queryFn: () => moviesService.adminList({ search: search || undefined, pageSize: 30 }),
  });

  const form = useForm<MovieForm>({
    resolver: zodResolver(movieSchema),
    defaultValues: { status: 'draft' },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: MovieForm) => {
      const payload: MovieAdminInput = {
        title: values.title,
        description: values.description || undefined,
        posterUrl: values.posterUrl || undefined,
        backdropUrl: values.backdropUrl || undefined,
        trailerUrl: values.trailerUrl || undefined,
        videoUrl: values.videoUrl || undefined,
        durationSeconds: values.durationSeconds,
        maturityRating: values.maturityRating || undefined,
        status: values.status,
        highlight: values.highlight,
        genre: values.genre,
      };
      if (editing) {
        return moviesService.adminUpdate(editing, payload);
      }
      return moviesService.adminCreate(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'movies'] });
      qc.invalidateQueries({ queryKey: ['movies'] });
      setOpen(false);
      setEditing(null);
      form.reset({ status: 'draft' });
    },
    onError: (error) => setServerError(extractErrorMessage(error)),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => moviesService.adminRemove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'movies'] });
      qc.invalidateQueries({ queryKey: ['movies'] });
    },
  });

  const startCreate = () => {
    setEditing(null);
    setServerError(null);
    form.reset({
      title: '',
      description: '',
      posterUrl: '',
      backdropUrl: '',
      trailerUrl: '',
      videoUrl: '',
      durationSeconds: 0,
      maturityRating: 'PG-13',
      status: 'draft',
      highlight: 'none',
      genre: 'general',
    });
    setOpen(true);
  };

  const startEdit = async (id: string) => {
    setServerError(null);
    setEditing(id);
    try {
      const movie = await moviesService.adminDetail(id);
      form.reset({
        title: movie.title,
        description: movie.description ?? '',
        posterUrl: movie.posterUrl ?? '',
        backdropUrl: movie.backdropUrl ?? '',
        trailerUrl: movie.trailerUrl ?? '',
        videoUrl: movie.videoUrl ?? '',
        durationSeconds: movie.durationSeconds,
        maturityRating: movie.maturityRating,
        status: movie.status,
        highlight: movie.highlight,
        genre: movie.genre,
      });
      setOpen(true);
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">ภาพยนตร์</h1>
          <p className="text-text-muted">สร้าง แก้ไข และเผยแพร่ภาพยนตร์ในคลัง</p>
        </div>
        <Button leading={<Plus className="h-4 w-4" />} onClick={startCreate}>
          เพิ่มภาพยนตร์
        </Button>
      </header>

      <div className="max-w-md">
        <Input
          leading={<Search className="h-4 w-4" />}
          placeholder="ค้นหาภาพยนตร์…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {moviesQ.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : moviesQ.data && moviesQ.data.items.length > 0 ? (
        <ul className="space-y-2">
          {moviesQ.data.items.map((movie) => (
            <li
              key={movie.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-surface/40 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="line-clamp-1 font-display font-semibold">{movie.title}</h3>
                  <Badge
                    tone={
                      movie.status === 'published'
                        ? 'success'
                        : movie.status === 'archived'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {STATUS_LABEL[movie.status] ?? movie.status}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  {formatDuration(movie.durationSeconds)} · {movie.maturityRating} · slug: {movie.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leading={<Pencil className="h-4 w-4" />}
                  onClick={() => startEdit(movie.id)}
                >
                  แก้ไข
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leading={<Trash2 className="h-4 w-4" />}
                  onClick={() => {
                    if (confirm(`ลบ "${movie.title}"?`)) removeMutation.mutate(movie.id);
                  }}
                  loading={removeMutation.isPending}
                >
                  ลบ
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="ยังไม่มีภาพยนตร์"
          description="เพิ่มภาพยนตร์เรื่องแรกเข้าคลังเพื่อเผยแพร่ให้ผู้ใช้"
          action={<Button onClick={startCreate}>เพิ่มภาพยนตร์</Button>}
        />
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'แก้ไขภาพยนตร์' : 'เพิ่มภาพยนตร์'}
        size="lg"
      >
        <form
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Input
            className="sm:col-span-2"
            label="ชื่อเรื่อง"
            error={form.formState.errors.title?.message}
            {...form.register('title')}
          />
          <Textarea
            className="sm:col-span-2"
            label="คำอธิบาย"
            rows={3}
            {...form.register('description')}
          />
          <Input label="ลิงก์โปสเตอร์" {...form.register('posterUrl')} />
          <Input label="ลิงก์ภาพพื้นหลัง" {...form.register('backdropUrl')} />
          <Input label="ลิงก์ตัวอย่าง" {...form.register('trailerUrl')} />
          <Input label="ลิงก์วิดีโอ" {...form.register('videoUrl')} />
          <Input
            label="ความยาว (วินาที)"
            type="number"
            {...form.register('durationSeconds')}
          />
          <Input label="เรตติ้ง" placeholder="PG-13" {...form.register('maturityRating')} />
          <Select label="สถานะ" {...form.register('status')}>
            <option value="draft">ฉบับร่าง</option>
            <option value="published">เผยแพร่แล้ว</option>
            <option value="archived">เก็บถาวร</option>
          </Select>
          <Select label="ป้ายไฮไลต์ (badge บนการ์ด)" {...form.register('highlight')}>
            <option value="none">ไม่มี</option>
            <option value="new">เพิ่มใหม่ล่าสุด</option>
            <option value="top10">TOP 10</option>
            <option value="new_episode">ตอนใหม่</option>
            <option value="new_season">ซีซั่นใหม่</option>
          </Select>
          <Select label="หมวดหมู่ (genre)" {...form.register('genre')}>
            <option value="general">ทั่วไป</option>
            <option value="tv_show">รายการทีวี</option>
            <option value="korean_drama">ซีรีส์เกาหลี</option>
            <option value="anime">อนิเมะ</option>
            <option value="animation">แอนิเมชัน</option>
            <option value="action">หนังแอ็กชัน</option>
            <option value="comedy">หนังตลก</option>
            <option value="horror">หนังสยองขวัญ</option>
            <option value="romance">หนังโรแมนติก</option>
            <option value="thriller">หนังระทึกขวัญ</option>
            <option value="drama">ดราม่า</option>
            <option value="scifi">ไซไฟและแฟนตาซี</option>
          </Select>
          {serverError && (
            <p className="sm:col-span-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {serverError}
            </p>
          )}
          <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
            >
              ยกเลิก
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'บันทึก' : 'สร้างภาพยนตร์'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

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

const movieSchema = z.object({
  title: z.string().min(1, 'Required').max(200),
  description: z.string().max(4000).optional().or(z.literal('')),
  posterUrl: z.string().url().optional().or(z.literal('')),
  backdropUrl: z.string().url().optional().or(z.literal('')),
  trailerUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  durationSeconds: z.coerce.number().int().min(0).optional(),
  maturityRating: z.string().max(20).optional(),
  status: z.enum(['draft', 'published', 'archived']),
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
          <h1 className="font-display text-2xl font-bold">Movies</h1>
          <p className="text-text-muted">Create, edit, and publish films in the catalog.</p>
        </div>
        <Button leading={<Plus className="h-4 w-4" />} onClick={startCreate}>
          New movie
        </Button>
      </header>

      <div className="max-w-md">
        <Input
          leading={<Search className="h-4 w-4" />}
          placeholder="Search movies…"
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
                        ? 'emerald'
                        : movie.status === 'archived'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {movie.status}
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
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leading={<Trash2 className="h-4 w-4" />}
                  onClick={() => {
                    if (confirm(`Delete "${movie.title}"?`)) removeMutation.mutate(movie.id);
                  }}
                  loading={removeMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No movies yet"
          description="Add the first movie to the catalog to publish it for users."
          action={<Button onClick={startCreate}>New movie</Button>}
        />
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit movie' : 'New movie'}
        size="lg"
      >
        <form
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Input
            className="sm:col-span-2"
            label="Title"
            error={form.formState.errors.title?.message}
            {...form.register('title')}
          />
          <Textarea
            className="sm:col-span-2"
            label="Description"
            rows={3}
            {...form.register('description')}
          />
          <Input label="Poster URL" {...form.register('posterUrl')} />
          <Input label="Backdrop URL" {...form.register('backdropUrl')} />
          <Input label="Trailer URL" {...form.register('trailerUrl')} />
          <Input label="Video URL" {...form.register('videoUrl')} />
          <Input
            label="Duration (seconds)"
            type="number"
            {...form.register('durationSeconds')}
          />
          <Input label="Maturity rating" placeholder="PG-13" {...form.register('maturityRating')} />
          <Select label="Status" className="sm:col-span-2" {...form.register('status')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
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
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Save changes' : 'Create movie'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

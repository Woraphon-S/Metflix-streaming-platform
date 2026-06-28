'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { seriesService, type SeriesAdminInput } from '@/services/series.service';
import { extractErrorMessage } from '@/services/api';

const seriesSchema = z.object({
  title: z.string().min(1, 'Required').max(200),
  description: z.string().max(4000).optional().or(z.literal('')),
  posterUrl: z.string().url().optional().or(z.literal('')),
  backdropUrl: z.string().url().optional().or(z.literal('')),
  trailerUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']),
});
type SeriesForm = z.infer<typeof seriesSchema>;

const seasonSchema = z.object({
  seasonNumber: z.coerce.number().int().min(1),
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional().or(z.literal('')),
});
type SeasonForm = z.infer<typeof seasonSchema>;

const episodeSchema = z.object({
  seasonId: z.string().uuid(),
  episodeNumber: z.coerce.number().int().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  durationSeconds: z.coerce.number().int().min(0).optional(),
  status: z.enum(['draft', 'published', 'archived']),
});
type EpisodeForm = z.infer<typeof episodeSchema>;

export default function AdminSeriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingSeries, setEditingSeries] = useState<string | null>(null);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [seasonOpenFor, setSeasonOpenFor] = useState<string | null>(null);
  const [episodeOpenFor, setEpisodeOpenFor] = useState<{ seriesId: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const seriesQ = useQuery({
    queryKey: ['admin', 'series', search],
    queryFn: () => seriesService.adminList({ search: search || undefined, pageSize: 30 }),
  });

  const expandedDetailQ = useQuery({
    queryKey: ['admin', 'series', expanded],
    queryFn: () => seriesService.adminDetail(expanded as string),
    enabled: !!expanded,
  });

  const seriesForm = useForm<SeriesForm>({
    resolver: zodResolver(seriesSchema),
    defaultValues: { status: 'draft' },
  });
  const seasonForm = useForm<SeasonForm>({
    resolver: zodResolver(seasonSchema),
    defaultValues: { seasonNumber: 1, title: 'Season 1' },
  });
  const episodeForm = useForm<EpisodeForm>({
    resolver: zodResolver(episodeSchema),
    defaultValues: { episodeNumber: 1, status: 'published' },
  });

  const saveSeries = useMutation({
    mutationFn: async (values: SeriesForm) => {
      const payload: SeriesAdminInput = {
        title: values.title,
        description: values.description || undefined,
        posterUrl: values.posterUrl || undefined,
        backdropUrl: values.backdropUrl || undefined,
        trailerUrl: values.trailerUrl || undefined,
        status: values.status,
      };
      if (editingSeries) return seriesService.adminUpdate(editingSeries, payload);
      return seriesService.adminCreate(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'series'] });
      qc.invalidateQueries({ queryKey: ['series'] });
      setSeriesOpen(false);
      setEditingSeries(null);
      seriesForm.reset({ status: 'draft' });
    },
    onError: (error) => setServerError(extractErrorMessage(error)),
  });

  const removeSeries = useMutation({
    mutationFn: (id: string) => seriesService.adminRemove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'series'] });
      setExpanded(null);
    },
  });

  const createSeason = useMutation({
    mutationFn: (values: SeasonForm) =>
      seriesService.adminCreateSeason({
        seriesId: seasonOpenFor as string,
        seasonNumber: values.seasonNumber,
        title: values.title,
        description: values.description || undefined,
      }),
    onSuccess: () => {
      setSeasonOpenFor(null);
      seasonForm.reset({ seasonNumber: 1, title: 'Season 1' });
      qc.invalidateQueries({ queryKey: ['admin', 'series', expanded] });
    },
    onError: (error) => setServerError(extractErrorMessage(error)),
  });

  const createEpisode = useMutation({
    mutationFn: (values: EpisodeForm) =>
      seriesService.adminCreateEpisode({
        seasonId: values.seasonId,
        episodeNumber: values.episodeNumber,
        title: values.title,
        description: values.description || undefined,
        videoUrl: values.videoUrl || undefined,
        durationSeconds: values.durationSeconds,
        status: values.status,
      }),
    onSuccess: () => {
      setEpisodeOpenFor(null);
      episodeForm.reset({ episodeNumber: 1, status: 'published' });
      qc.invalidateQueries({ queryKey: ['admin', 'series', expanded] });
    },
    onError: (error) => setServerError(extractErrorMessage(error)),
  });

  const startCreate = () => {
    setEditingSeries(null);
    setServerError(null);
    seriesForm.reset({
      title: '',
      description: '',
      posterUrl: '',
      backdropUrl: '',
      trailerUrl: '',
      status: 'draft',
    });
    setSeriesOpen(true);
  };

  const startEdit = async (id: string) => {
    setServerError(null);
    setEditingSeries(id);
    try {
      const data = await seriesService.adminDetail(id);
      seriesForm.reset({
        title: data.title,
        description: data.description ?? '',
        posterUrl: data.posterUrl ?? '',
        backdropUrl: data.backdropUrl ?? '',
        trailerUrl: data.trailerUrl ?? '',
        status: data.status,
      });
      setSeriesOpen(true);
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  const detail = expandedDetailQ.data;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Series</h1>
          <p className="text-text-muted">Manage series, seasons, and episodes.</p>
        </div>
        <Button leading={<Plus className="h-4 w-4" />} onClick={startCreate}>
          New series
        </Button>
      </header>

      <div className="max-w-md">
        <Input
          leading={<Search className="h-4 w-4" />}
          placeholder="Search series…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {seriesQ.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : seriesQ.data && seriesQ.data.items.length > 0 ? (
        <ul className="space-y-2">
          {seriesQ.data.items.map((series) => (
            <li
              key={series.id}
              className="rounded-2xl border border-white/5 bg-surface/40"
            >
              <button
                onClick={() =>
                  setExpanded((prev) => (prev === series.id ? null : series.id))
                }
                className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left"
              >
                <ChevronRight
                  className={`h-4 w-4 text-text-muted transition-transform ${
                    expanded === series.id ? 'rotate-90 text-emerald' : ''
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="line-clamp-1 font-display font-semibold">
                      {series.title}
                    </h3>
                    <Badge
                      tone={series.status === 'published' ? 'emerald' : 'neutral'}
                    >
                      {series.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    {series.seasonsCount} seasons · {series.episodesCount} episodes ·
                    slug: {series.slug}
                  </p>
                </div>
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    leading={<Pencil className="h-4 w-4" />}
                    onClick={() => startEdit(series.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leading={<Trash2 className="h-4 w-4" />}
                    onClick={() => {
                      if (confirm(`Delete "${series.title}"?`))
                        removeSeries.mutate(series.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </button>
              {expanded === series.id && (
                <div className="border-t border-white/5 px-4 py-4">
                  {expandedDetailQ.isLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : detail ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-display text-sm font-semibold">
                          Seasons & episodes
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          leading={<Plus className="h-4 w-4" />}
                          onClick={() => {
                            const next =
                              (detail.seasons[detail.seasons.length - 1]?.seasonNumber ??
                                0) + 1;
                            seasonForm.reset({
                              seasonNumber: next,
                              title: `Season ${next}`,
                              description: '',
                            });
                            setSeasonOpenFor(series.id);
                          }}
                        >
                          Add season
                        </Button>
                      </div>
                      {detail.seasons.length > 0 ? (
                        detail.seasons.map((season) => (
                          <div
                            key={season.id}
                            className="rounded-xl border border-white/5 bg-surface/60 p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="font-display text-sm">
                                Season {season.seasonNumber} —{' '}
                                <span className="text-text-muted">{season.title}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                leading={<Plus className="h-4 w-4" />}
                                onClick={() => {
                                  const next =
                                    (season.episodes[season.episodes.length - 1]
                                      ?.episodeNumber ?? 0) + 1;
                                  episodeForm.reset({
                                    seasonId: season.id,
                                    episodeNumber: next,
                                    title: `Episode ${next}`,
                                    description: '',
                                    videoUrl: '',
                                    durationSeconds: 0,
                                    status: 'published',
                                  });
                                  setEpisodeOpenFor({ seriesId: series.id });
                                }}
                              >
                                Add episode
                              </Button>
                            </div>
                            {season.episodes.length ? (
                              <ul className="mt-3 space-y-1.5 text-sm">
                                {season.episodes.map((ep) => (
                                  <li
                                    key={ep.id}
                                    className="flex items-center justify-between rounded-lg bg-surface/70 px-3 py-1.5"
                                  >
                                    <span>
                                      E{ep.episodeNumber} · {ep.title}
                                    </span>
                                    <Badge
                                      tone={
                                        ep.status === 'published'
                                          ? 'emerald'
                                          : 'neutral'
                                      }
                                    >
                                      {ep.status}
                                    </Badge>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 text-xs text-text-muted">
                                No episodes in this season.
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-text-muted">
                          No seasons yet. Add the first season to start.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No series yet"
          description="Add the first series to the catalog."
          action={<Button onClick={startCreate}>New series</Button>}
        />
      )}

      <Modal
        open={seriesOpen}
        onClose={() => {
          setSeriesOpen(false);
          setEditingSeries(null);
        }}
        title={editingSeries ? 'Edit series' : 'New series'}
        size="lg"
      >
        <form
          onSubmit={seriesForm.handleSubmit((values) => saveSeries.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Input
            className="sm:col-span-2"
            label="Title"
            error={seriesForm.formState.errors.title?.message}
            {...seriesForm.register('title')}
          />
          <Textarea
            className="sm:col-span-2"
            label="Description"
            rows={3}
            {...seriesForm.register('description')}
          />
          <Input label="Poster URL" {...seriesForm.register('posterUrl')} />
          <Input label="Backdrop URL" {...seriesForm.register('backdropUrl')} />
          <Input label="Trailer URL" {...seriesForm.register('trailerUrl')} />
          <Select label="Status" {...seriesForm.register('status')}>
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
                setSeriesOpen(false);
                setEditingSeries(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saveSeries.isPending}>
              {editingSeries ? 'Save changes' : 'Create series'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!seasonOpenFor}
        onClose={() => setSeasonOpenFor(null)}
        title="Add season"
      >
        <form
          onSubmit={seasonForm.handleSubmit((values) => createSeason.mutate(values))}
          className="space-y-4"
        >
          <Input
            label="Season number"
            type="number"
            error={seasonForm.formState.errors.seasonNumber?.message}
            {...seasonForm.register('seasonNumber')}
          />
          <Input
            label="Title"
            error={seasonForm.formState.errors.title?.message}
            {...seasonForm.register('title')}
          />
          <Textarea label="Description" {...seasonForm.register('description')} />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSeasonOpenFor(null)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createSeason.isPending}>
              Create season
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!episodeOpenFor}
        onClose={() => setEpisodeOpenFor(null)}
        title="Add episode"
        size="lg"
      >
        <form
          onSubmit={episodeForm.handleSubmit((values) => createEpisode.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Input
            className="sm:col-span-2"
            label="Title"
            error={episodeForm.formState.errors.title?.message}
            {...episodeForm.register('title')}
          />
          <Input
            label="Episode number"
            type="number"
            error={episodeForm.formState.errors.episodeNumber?.message}
            {...episodeForm.register('episodeNumber')}
          />
          <Input
            label="Duration (seconds)"
            type="number"
            {...episodeForm.register('durationSeconds')}
          />
          <Input
            className="sm:col-span-2"
            label="Video URL"
            {...episodeForm.register('videoUrl')}
          />
          <Textarea
            className="sm:col-span-2"
            label="Description"
            {...episodeForm.register('description')}
          />
          <Select
            label="Status"
            className="sm:col-span-2"
            {...episodeForm.register('status')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
          <input type="hidden" {...episodeForm.register('seasonId')} />
          <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEpisodeOpenFor(null)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createEpisode.isPending}>
              Create episode
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

export const ensureUniqueSlug = async (
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> => {
  const root = slugify(base) || 'item';
  if (!(await exists(root))) return root;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${root}-${n}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${root}-${Date.now()}`;
};

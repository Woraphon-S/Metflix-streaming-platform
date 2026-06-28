import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { SCHEMA_SQL } from '../database/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  // eslint-disable-next-line no-console
  console.error('[seed] DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });

const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';
const SAMPLE_TRAILER =
  'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4';

const pic = (seed: string) => ({
  posterUrl: `https://picsum.photos/seed/${seed}/600/900`,
  backdropUrl: `https://picsum.photos/seed/${seed}b/1600/900`,
});

const moviesSeed = [
  {
    title: 'Neon Skyline',
    description:
      'A cyberpunk thriller about a hacker who uncovers a corporate conspiracy in a rain-soaked megacity.',
    posterUrl:
      'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80',
    durationSeconds: 7320,
    maturityRating: 'TV-MA',
    genre: 'scifi',
    highlight: 'new',
  },
  {
    title: 'Emerald Tide',
    description:
      'Two estranged siblings reunite on a remote coastline to chase a legend hidden beneath emerald waves.',
    posterUrl:
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1502209524164-acea936639a2?auto=format&fit=crop&w=1600&q=80',
    durationSeconds: 6300,
    maturityRating: 'PG-13',
    genre: 'drama',
    highlight: 'none',
  },
  {
    title: 'Velvet Static',
    description:
      'A radio host receives messages from a parallel city that only she can hear — and they are warnings.',
    posterUrl:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80',
    durationSeconds: 5940,
    maturityRating: 'TV-14',
    genre: 'thriller',
    highlight: 'top10',
  },
  {
    title: 'Midnight Mosaic',
    description:
      'An art forger is dragged into a heist that spans three continents and one stolen identity.',
    posterUrl:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=80',
    durationSeconds: 6900,
    maturityRating: 'PG-13',
    genre: 'action',
    highlight: 'none',
  },
  {
    title: 'Hollow Signal',
    description:
      'A deep-space salvage crew answers a distress call from a ship that should not exist.',
    posterUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80',
    durationSeconds: 7800,
    maturityRating: 'TV-MA',
    genre: 'scifi',
    highlight: 'new',
  },
  {
    title: 'Glasswing',
    description:
      'A retired ballerina trains a runaway in the basement of an old theater, until the past catches up.',
    posterUrl:
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1600&q=80',
    durationSeconds: 6480,
    maturityRating: 'PG-13',
    genre: 'drama',
    highlight: 'top10',
  },
  { title: 'ดาบเทพอสูร', description: 'นักล่าอสูรหนุ่มออกตามหาวิธีรักษาน้องสาวที่กลายร่าง', durationSeconds: 1440, maturityRating: 'TV-14', genre: 'anime', highlight: 'new_episode', ...pic('anime1') },
  { title: 'นินจารัตติกาล', description: 'ตำนานนินจาผู้พิทักษ์หมู่บ้านจากเงามืด', durationSeconds: 1500, maturityRating: 'TV-14', genre: 'anime', highlight: 'none', ...pic('anime2') },
  { title: 'ผจญภัยแดนของเล่น', description: 'ของเล่นมีชีวิตออกผจญภัยช่วยเจ้าของตัวน้อย', durationSeconds: 5400, maturityRating: 'G', genre: 'animation', highlight: 'new', ...pic('anim1') },
  { title: 'เพื่อนซี้สี่ขา', description: 'มิตรภาพอบอุ่นของเด็กชายกับสุนัขจอมซน', durationSeconds: 5700, maturityRating: 'G', genre: 'animation', highlight: 'none', ...pic('anim2') },
  { title: 'รักนี้ที่กรุงโซล', description: 'เรื่องราวความรักของสองหัวใจกลางมหานครโซล', durationSeconds: 6600, maturityRating: 'PG-13', genre: 'korean_drama', highlight: 'top10', ...pic('kdrama1') },
  { title: 'สัญญารักห้าฤดู', description: 'คำสัญญาที่รอคอยข้ามกาลเวลาห้าฤดูกาล', durationSeconds: 6300, maturityRating: 'PG-13', genre: 'korean_drama', highlight: 'none', ...pic('kdrama2') },
  { title: 'บ้านเช่าเฮี้ยน', description: 'ครอบครัวหนึ่งย้ายเข้าบ้านเช่าราคาถูกผิดปกติ', durationSeconds: 6000, maturityRating: 'TV-MA', genre: 'horror', highlight: 'new', ...pic('horror1') },
  { title: 'เสียงเรียกตอนตีสาม', description: 'เสียงปริศนาที่ดังขึ้นทุกคืนเวลาตีสาม', durationSeconds: 5820, maturityRating: 'TV-MA', genre: 'horror', highlight: 'none', ...pic('horror2') },
  { title: 'แก๊งป่วนชวนหัว', description: 'สี่เกลอกับภารกิจป่วนสุดฮาประจำมหาวิทยาลัย', durationSeconds: 5760, maturityRating: 'PG-13', genre: 'comedy', highlight: 'none', ...pic('comedy1') },
  { title: 'ครอบครัวสุดเพี้ยน', description: 'ครอบครัวจอมป่วนกับเรื่องวุ่นๆ ในทุกวัน', durationSeconds: 5940, maturityRating: 'PG', genre: 'comedy', highlight: 'new', ...pic('comedy2') },
  { title: 'ล่าล้างแค้น', description: 'อดีตสายลับกลับมาทวงความยุติธรรมด้วยตัวเอง', durationSeconds: 7080, maturityRating: 'TV-MA', genre: 'action', highlight: 'top10', ...pic('action1') },
  { title: 'ภารกิจรหัสเดือด', description: 'หน่วยรบพิเศษกับภารกิจกู้ระเบิดข้ามชาติ', durationSeconds: 6960, maturityRating: 'TV-14', genre: 'action', highlight: 'none', ...pic('action2') },
  { title: 'รักแรกที่ปลายฝน', description: 'ความรักครั้งแรกที่เริ่มต้นในวันฝนพรำ', durationSeconds: 6120, maturityRating: 'PG-13', genre: 'romance', highlight: 'new', ...pic('romance1') },
  { title: 'จดหมายถึงเธอ', description: 'จดหมายเก่าที่นำพาสองหัวใจให้พบกันอีกครั้ง', durationSeconds: 6240, maturityRating: 'PG', genre: 'romance', highlight: 'none', ...pic('romance2') },
  { title: 'เกมล่าเงา', description: 'นักสืบไล่ล่าฆาตกรที่ทิ้งปริศนาไว้ทุกฉาก', durationSeconds: 6780, maturityRating: 'TV-MA', genre: 'thriller', highlight: 'none', ...pic('thriller1') },
  { title: 'ดาวเคราะห์ที่หายไป', description: 'ทีมสำรวจอวกาศตามหาดาวเคราะห์ที่หายไปอย่างลึกลับ', durationSeconds: 7200, maturityRating: 'TV-14', genre: 'scifi', highlight: 'new', ...pic('scifi1') },
];

const seriesSeed = [
  {
    title: 'Aurora Protocol',
    description:
      'A clandestine task force investigates anomalies along the magnetic poles. Each episode peels back another layer of an old, buried experiment.',
    posterUrl:
      'https://images.unsplash.com/photo-1483086431886-3590a88317fe?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1483086431886-3590a88317fe?auto=format&fit=crop&w=1600&q=80',
    genre: 'tv_show',
    highlight: 'new_season',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          { episodeNumber: 1, title: 'Cold Open', durationSeconds: 2700 },
          { episodeNumber: 2, title: 'Magnetic Fault', durationSeconds: 2820 },
          { episodeNumber: 3, title: 'Borealis', durationSeconds: 2700 },
        ],
      },
      {
        seasonNumber: 2,
        title: 'Season 2',
        episodes: [
          { episodeNumber: 1, title: 'Polarity', durationSeconds: 2880 },
          { episodeNumber: 2, title: 'Drift', durationSeconds: 2940 },
        ],
      },
    ],
  },
  {
    title: 'Last Light District',
    description:
      'A neon-noir detective drama set in a city where the sun has not risen in seven years.',
    posterUrl: 'https://picsum.photos/seed/lastlight/600/900',
    backdropUrl: 'https://picsum.photos/seed/lastlightb/1600/900',
    genre: 'tv_show',
    highlight: 'new_episode',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          { episodeNumber: 1, title: 'Pilot', durationSeconds: 3120 },
          { episodeNumber: 2, title: 'Static on 5th', durationSeconds: 3000 },
          { episodeNumber: 3, title: 'Wet Streets', durationSeconds: 3060 },
          { episodeNumber: 4, title: 'Closing Time', durationSeconds: 3300 },
        ],
      },
    ],
  },
  {
    title: 'Field Notes',
    description:
      'A botanist documents the rapid evolution of plant life inside a sealed greenhouse — and the things growing in the soil.',
    posterUrl:
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1600&q=80',
    genre: 'tv_show',
    highlight: 'none',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [
          { episodeNumber: 1, title: 'Germinate', durationSeconds: 2640 },
          { episodeNumber: 2, title: 'Photosynthesis', durationSeconds: 2700 },
        ],
      },
    ],
  },
];

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');

async function waitForDatabase(maxAttempts = 20): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch {
      if (attempt === maxAttempts) throw new Error('Database not reachable');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

async function ensureSchema(): Promise<void> {
  await pool.query(SCHEMA_SQL);
}

async function ensureAdmin(): Promise<void> {
  const id = process.env.ADMIN_DEV_ID ?? 'admin';
  const password = process.env.ADMIN_DEV_PASSWORD ?? '1234';
  const adminEmail = `${id}@metflix.local`;

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE email = $1',
    [adminEmail],
  );

  if (existing.rows.length === 0) {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'admin')
       RETURNING id`,
      [adminEmail, passwordHash],
    );
    await pool.query(
      'INSERT INTO profiles (user_id, display_name, avatar_key, is_primary) VALUES ($1, $2, $3, true)',
      [result.rows[0].id, 'METFLIX Admin', 'mono'],
    );
  } else {
    await pool.query(
      `UPDATE users SET role = 'admin', password_hash = $2 WHERE id = $1`,
      [existing.rows[0].id, passwordHash],
    );
  }
}

async function ensureDemoUser(): Promise<void> {
  const email = 'demo@metflix.local';
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const existing = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE email = $1',
    [email],
  );

  if (existing.rows.length === 0) {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'user')
       RETURNING id`,
      [email, passwordHash],
    );
    const demoId = result.rows[0].id;
    await pool.query(
      'INSERT INTO profiles (user_id, display_name, avatar_key, is_primary) VALUES ($1, $2, $3, true)',
      [demoId, 'Demo Viewer', 'aurora'],
    );
    await pool.query(
      'INSERT INTO profiles (user_id, display_name, avatar_key, is_primary) VALUES ($1, $2, $3, false)',
      [demoId, 'Family', 'ember'],
    );
    await pool.query(
      'INSERT INTO profiles (user_id, display_name, avatar_key, is_primary) VALUES ($1, $2, $3, false)',
      [demoId, 'Kids', 'grape'],
    );
  }
}

async function seedMovies(): Promise<void> {
  for (const movie of moviesSeed) {
    const slug = slugify(movie.title);
    await pool.query(
      `INSERT INTO movies
         (title, slug, description, poster_url, backdrop_url, trailer_url, video_url,
          duration_seconds, maturity_rating, status, highlight, genre, view_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published', $10, $11, $12)
       ON CONFLICT (slug) DO UPDATE SET
         description = EXCLUDED.description,
         poster_url = EXCLUDED.poster_url,
         backdrop_url = EXCLUDED.backdrop_url,
         video_url = EXCLUDED.video_url,
         trailer_url = EXCLUDED.trailer_url,
         highlight = EXCLUDED.highlight,
         genre = EXCLUDED.genre`,
      [
        movie.title,
        slug,
        movie.description,
        movie.posterUrl,
        movie.backdropUrl,
        SAMPLE_TRAILER,
        SAMPLE_VIDEO,
        movie.durationSeconds,
        movie.maturityRating,
        movie.highlight,
        movie.genre,
        Math.floor(Math.random() * 5000),
      ],
    );
  }
}

async function seedSeries(): Promise<void> {
  for (const series of seriesSeed) {
    const slug = slugify(series.title);
    const seriesResult = await pool.query<{ id: string }>(
      `INSERT INTO series
         (title, slug, description, poster_url, backdrop_url, trailer_url, status, highlight, genre, view_count)
       VALUES ($1, $2, $3, $4, $5, $6, 'published', $7, $8, $9)
       ON CONFLICT (slug) DO UPDATE SET
         description = EXCLUDED.description,
         poster_url = EXCLUDED.poster_url,
         backdrop_url = EXCLUDED.backdrop_url,
         highlight = EXCLUDED.highlight,
         genre = EXCLUDED.genre
       RETURNING id`,
      [
        series.title,
        slug,
        series.description,
        series.posterUrl,
        series.backdropUrl,
        SAMPLE_TRAILER,
        series.highlight,
        series.genre,
        Math.floor(Math.random() * 3000),
      ],
    );
    const seriesId = seriesResult.rows[0].id;

    for (const season of series.seasons) {
      const seasonResult = await pool.query<{ id: string }>(
        `INSERT INTO seasons (series_id, season_number, title)
         VALUES ($1, $2, $3)
         ON CONFLICT (series_id, season_number) DO UPDATE SET
           title = EXCLUDED.title
         RETURNING id`,
        [seriesId, season.seasonNumber, season.title],
      );
      const seasonId = seasonResult.rows[0].id;

      for (const ep of season.episodes) {
        await pool.query(
          `INSERT INTO episodes
             (series_id, season_id, episode_number, title, duration_seconds, video_url, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'published')
           ON CONFLICT (season_id, episode_number) DO UPDATE SET
             title = EXCLUDED.title,
             duration_seconds = EXCLUDED.duration_seconds,
             video_url = EXCLUDED.video_url,
             status = EXCLUDED.status`,
          [seriesId, seasonId, ep.episodeNumber, ep.title, ep.durationSeconds, SAMPLE_VIDEO],
        );
      }
    }
  }
}

async function seedWelcomeNotification(): Promise<void> {
  const existing = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM notifications WHERE type = 'system'`,
  );
  if (Number(existing.rows[0].count) > 0) return;

  await pool.query(
    `INSERT INTO notifications (type, title, message, payload, target_user_id)
     VALUES ('system', $1, $2, $3::jsonb, NULL)`,
    [
      'Welcome to METFLIX',
      'Browse a curated catalog of movies and series. Use My List to save what you want to watch later.',
      JSON.stringify({ onboarding: true }),
    ],
  );
}

async function main(): Promise<void> {
  await waitForDatabase();
  await ensureSchema();
  await ensureAdmin();
  await ensureDemoUser();
  await seedMovies();
  await seedSeries();
  await seedWelcomeNotification();
  // eslint-disable-next-line no-console
  console.log('[seed] metflix sample data ready');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('[seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

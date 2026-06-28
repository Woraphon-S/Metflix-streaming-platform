import type { ContentGenre } from '@metflix/shared-types';

export const GENRE_LABELS: Record<ContentGenre, string> = {
  anime: 'อนิเมะ',
  animation: 'แอนิเมชัน',
  korean_drama: 'ซีรีส์เกาหลี',
  drama: 'ดราม่า',
  horror: 'หนังสยองขวัญ',
  comedy: 'หนังตลก',
  tv_show: 'รายการทีวี',
  action: 'หนังแอ็กชัน',
  scifi: 'ไซไฟและแฟนตาซี',
  thriller: 'หนังระทึกขวัญ',
  romance: 'หนังโรแมนติก',
  general: 'ทั่วไป',
};

export const GENRE_ORDER: ContentGenre[] = [
  'tv_show',
  'korean_drama',
  'anime',
  'action',
  'comedy',
  'horror',
  'romance',
  'thriller',
  'animation',
  'drama',
  'scifi',
  'general',
];

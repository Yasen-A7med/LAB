import type { Record4, SearchOptions } from '../../workers/thanawyaWorker';

export type { Record4, SearchOptions };

export interface ThanawyaProps {
  onBack: () => void;
}

export interface WorkerResultItem {
  rec: Record4;
  score: number;
}

export type ThanawyaSortOption = 'rel' | 'score_desc' | 'score_asc' | 'seat_asc' | 'name_asc';

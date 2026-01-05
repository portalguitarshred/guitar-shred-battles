
export enum Category {
  SHRED = 'shred',
  SOLO = 'solo',
  RIFF = 'riff',
  IMPROV = 'improviso'
}

export enum SkillLevel {
  BEGINNER = 'iniciante',
  INTERMEDIATE = 'intermediário',
  ADVANCED = 'avançado'
}

export enum Style {
  ROCK = 'rock',
  METAL = 'metal',
  PROG = 'prog',
  FUSION = 'fusion'
}

export interface Guitarist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  winRate: number;
  styles: Style[];
  achievements: string[];
  links: {
    youtube?: string;
    instagram?: string;
  };
}

export interface BattleVideo {
  id: string;
  authorId: string;
  authorName: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: Category;
  skillLevel: SkillLevel;
  style: Style;
  bpm?: number;
  votes: number;
}

export interface Battle {
  id: string;
  playerA: BattleVideo;
  playerB: BattleVideo;
  startTime: string; // ISO
  endTime: string;   // ISO
  status: 'active' | 'finished';
  winnerId?: string;
}

export interface AIFeedback {
  publicHighlight: string;
  publicImprovement: string;
  technicalAnalysis: string;
  practicalSuggestion: string;
  technicalScore: number;
}

export interface RankingEntry {
  guitaristId: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
}

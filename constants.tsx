
import React from 'react';
import { Guitarist, Battle, Category, SkillLevel, Style } from './types';

export const MOCK_USER: Guitarist = {
  id: 'user-1',
  name: 'Kiko Loureiro Jr',
  avatar: 'https://picsum.photos/id/64/200/200',
  bio: 'Passion for neo-classical metal and odd time signatures.',
  level: 42,
  xp: 12450,
  winRate: 68,
  styles: [Style.METAL, Style.PROG],
  achievements: ['Speed Demon', 'Crowd Favorite', 'Perfect Riff'],
  links: { youtube: 'https://youtube.com', instagram: 'https://instagram.com' }
};

export const MOCK_BATTLES: Battle[] = [
  {
    id: 'battle-1',
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    playerA: {
      id: 'v1',
      authorId: 'p1',
      authorName: 'Alex Shredder',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://picsum.photos/id/10/400/225',
      category: Category.SHRED,
      skillLevel: SkillLevel.ADVANCED,
      style: Style.METAL,
      votes: 142
    },
    playerB: {
      id: 'v2',
      authorId: 'p2',
      authorName: 'Elias Prog',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://picsum.photos/id/20/400/225',
      category: Category.SHRED,
      skillLevel: SkillLevel.ADVANCED,
      style: Style.PROG,
      votes: 128
    }
  },
  {
      id: 'battle-2',
      status: 'active',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      playerA: {
        id: 'v3',
        authorId: 'p3',
        authorName: 'Lina Fusion',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://picsum.photos/id/30/400/225',
        category: Category.SOLO,
        skillLevel: SkillLevel.INTERMEDIATE,
        style: Style.FUSION,
        votes: 89
      },
      playerB: {
        id: 'v4',
        authorId: 'p4',
        authorName: 'Marc Riff',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://picsum.photos/id/40/400/225',
        category: Category.RIFF,
        skillLevel: SkillLevel.INTERMEDIATE,
        style: Style.ROCK,
        votes: 94
      }
    }
];

export const TOP_RANKING = [
  { id: '1', name: 'Joe Satriani Fan', score: 2500, avatar: 'https://picsum.photos/id/101/50/50' },
  { id: '2', name: 'SpeedKing', score: 2350, avatar: 'https://picsum.photos/id/102/50/50' },
  { id: '3', name: 'BluesMaster', score: 2100, avatar: 'https://picsum.photos/id/103/50/50' },
  { id: '4', name: 'PolyphiaClone', score: 1980, avatar: 'https://picsum.photos/id/104/50/50' },
  { id: '5', name: 'MetalHead99', score: 1850, avatar: 'https://picsum.photos/id/105/50/50' },
];

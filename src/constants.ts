import { Shield, Zap, Star, Droplet, Circle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PlaceColumn = {
  id: number;
  type: 'whole' | 'part';
  title: string;
  color: string;
  bgLight: string;
  border: string;
  ring: string;
  icon: LucideIcon;
  size: number;
  label: string;
  isSeparator: false;
};

export type SeparatorColumn = {
  id: -1;
  isSeparator: true;
};

export type Column = PlaceColumn | SeparatorColumn;

export const COLUMNS: Column[] = [
  { id: 0, isSeparator: false, type: 'whole', title: 'Thousands', color: 'text-indigo-400', bgLight: 'bg-indigo-500/20', border: 'border-indigo-500/50', ring: 'ring-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]', icon: Shield, size: 48, label: 'Ultra Shields' },
  { id: 1, isSeparator: false, type: 'whole', title: 'Hundreds', color: 'text-blue-400', bgLight: 'bg-blue-500/20', border: 'border-blue-500/50', ring: 'ring-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]', icon: Shield, size: 40, label: 'Mega Shields' },
  { id: 2, isSeparator: false, type: 'whole', title: 'Tens', color: 'text-emerald-400', bgLight: 'bg-emerald-500/20', border: 'border-emerald-500/50', ring: 'ring-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]', icon: Zap, size: 32, label: 'Power Zaps' },
  { id: 3, isSeparator: false, type: 'whole', title: 'Ones', color: 'text-amber-400', bgLight: 'bg-amber-500/20', border: 'border-amber-500/50', ring: 'ring-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]', icon: Star, size: 24, label: 'Energy Stars' },
  { id: -1, isSeparator: true },
  { id: 4, isSeparator: false, type: 'part', title: 'Tenths', color: 'text-purple-400', bgLight: 'bg-purple-500/20', border: 'border-purple-500/50', ring: 'ring-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]', icon: Droplet, size: 20, label: 'Mini Drops' },
  { id: 5, isSeparator: false, type: 'part', title: 'Hundredths', color: 'text-pink-400', bgLight: 'bg-pink-500/20', border: 'border-pink-500/50', ring: 'ring-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]', icon: Circle, size: 14, label: 'Micro Sparks' },
  { id: 6, isSeparator: false, type: 'part', title: 'Thousandths', color: 'text-rose-400', bgLight: 'bg-rose-500/20', border: 'border-rose-500/50', ring: 'ring-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.8)]', icon: Circle, size: 8, label: 'Nano Dust' },
];

export type GameMode = 'power-grid' | 'value-decoder' | 'number-clash';

export type Digits = [number, number, number, number, number, number, number];

export const EMPTY_DIGITS: Digits = [0, 0, 0, 0, 0, 0, 0];

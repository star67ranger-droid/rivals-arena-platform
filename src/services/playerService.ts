import { UserProfile } from '../types';
import { playerServiceSupabase } from './playerServiceSupabase';

// Redirect all exports to Supabase implementation for the Ultimate Edition
export const playerService = playerServiceSupabase;
export { ACHIEVEMENT_MASTER_LIST, RARITY_CONFIG } from './playerServiceSupabase';
export type { AchievementRarity } from './playerServiceSupabase';

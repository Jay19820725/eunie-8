/**
 * Core type definitions for EUNIE 嶼妳
 */

export enum FiveElement {
  WOOD = 'wood',
  FIRE = 'fire',
  EARTH = 'earth',
  METAL = 'metal',
  WATER = 'water'
}

export const ELEMENT_COLORS: Record<FiveElement, string> = {
  [FiveElement.WOOD]: "#A8E6CF",
  [FiveElement.FIRE]: "#FFB7B2",
  [FiveElement.EARTH]: "#FDFD96",
  [FiveElement.METAL]: "#E0E0E0",
  [FiveElement.WATER]: "#B39DDB",
};

export const ELEMENT_NAMES_ZH: Record<FiveElement, string> = {
  [FiveElement.WOOD]: "木",
  [FiveElement.FIRE]: "火",
  [FiveElement.EARTH]: "土",
  [FiveElement.METAL]: "金",
  [FiveElement.WATER]: "水",
};

export interface FiveElementValues {
  [FiveElement.WOOD]: number;
  [FiveElement.FIRE]: number;
  [FiveElement.EARTH]: number;
  [FiveElement.METAL]: number;
  [FiveElement.WATER]: number;
}

export interface ImageCard {
  id: string;
  locale?: string;
  name: string;
  name_en?: string;
  imageUrl: string;
  elements: FiveElementValues;
  description?: string;
  metadata?: {
    artist?: string;
    series?: string;
  };
}

export interface WordCard {
  id: string;
  locale?: string;
  name: string;
  name_en?: string;
  text: string;
  imageUrl: string;
  elements: FiveElementValues;
  description?: string;
  metadata?: {
    language?: string;
    category?: string;
  };
}

export interface CardPair {
  image: ImageCard;
  word: WordCard;
  association?: string;
}

export interface SelectedCards {
  sessionId?: string;
  images: ImageCard[];
  words: WordCard[];
  pairs?: CardPair[];
  drawnAt: number;
}

export interface AnalysisReport {
  id: string;
  userId?: string;
  timestamp: number;
  selectedImageIds: string[];
  selectedWordIds: string[];
  totalScores: FiveElementValues; // Normalized percentages
  dominantElement: string;
  weakElement: string;
  balanceScore: number;
  interpretation?: string;
  pairInterpretations?: { pair_id: string; text: string }[];
  pairs?: CardPair[];
  
  // AI Analysis Sections
  todayTheme?: string;
  cardInterpretation?: string;
  psychologicalInsight?: string;
  manifestationGuidance?: string;
  energyObstacles?: string;
  fiveElementAnalysis?: string;
  reflection?: string;
  actionSuggestion?: string;
  shareThumbnail?: string;

  // Inner Relief (Wish) specific fields
  soulMirror?: string;
  destinyWhisper?: string;
  transformationPath?: string;
  healingRitual?: string;
  plainSummary?: string;

  // Multilingual Content
  multilingualContent?: {
    'zh-TW': {
      todayTheme: string;
      cardInterpretation: string;
      psychologicalInsight: string;
      fiveElementAnalysis: string;
      reflection: string;
      actionSuggestion: string;
      pairInterpretations: { pair_id: string; text: string }[];
      // Wish specific
      soulMirror?: string;
      destinyWhisper?: string;
      transformationPath?: string;
      healingRitual?: string;
      plainSummary?: string;
    };
    'ja-JP': {
      todayTheme: string;
      cardInterpretation: string;
      psychologicalInsight: string;
      fiveElementAnalysis: string;
      reflection: string;
      actionSuggestion: string;
      pairInterpretations: { pair_id: string; text: string }[];
      // Wish specific
      soulMirror?: string;
      destinyWhisper?: string;
      transformationPath?: string;
      healingRitual?: string;
      plainSummary?: string;
    };
  };
  
  // Legacy fields (keep for backward compatibility)
  psychologicalReflection?: string;
  energyAdvice?: string;
  
  isGuest?: boolean;
  isAiComplete?: boolean;
  reportType?: 'daily' | 'wish';
  wishContext?: {
    category: string;
    target: string;
    content: string;
  };
}

export type UserRole = 'guest' | 'free_member' | 'premium_member' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  register_date: string;
  subscription_status: 'active' | 'inactive' | 'none' | 'trialing' | 'expired';
  subscription_tier?: 'free' | 'premium';
  subscription_type?: 'none' | 'monthly' | 'yearly';
  subscription_expiry?: string;
  trial_start_date?: string;
  last_login?: string;
  language?: string;
  loop_stage?: string;
  default_bottle_nickname?: string;
  settings?: {
    daily_reminder: boolean;
    dark_mode: boolean;
    newsletter: boolean;
  };
}

export interface Session {
  id: string;
  user_id: string;
  session_time: string;
  image_cards: ImageCard[];
  word_cards: WordCard[];
  pairs: CardPair[];
  association_text: string[];
}

export type EmotionTag = 'calm' | 'anxious' | 'inspired' | 'tired';

export type ManifestationStatus = 'active' | 'completed' | 'cancelled' | 'expired';
export type ManifestationDeadlineOption = '1_month' | '6_months' | '12_months';

export interface Manifestation {
  id?: string;
  user_id: string;
  wish_title: string;
  deadline: string;
  deadline_option: ManifestationDeadlineOption;
  status: ManifestationStatus;
  created_at: string;
  reminder_sent?: boolean;
}

export interface EnergyJournalEntry {
  id?: string;
  user_id: string;
  date: string;
  emotion_tag: EmotionTag;
  insight: string;
  intention: string;
  created_at: string;
}

export type AIPromptCategory = 'analysis' | 'daily' | 'persona';
export type AIPromptStyle = 'gentle' | 'ethereal' | 'poetic' | 'professional' | 'healing' | 'custom';

export type AtmosphereType = 'ocean' | 'nebula' | 'komorebi' | 'forest';
export type ChartType = 'radar' | 'bar' | 'pie' | 'energy_trend';

export interface ReportSettings {
  layout: { id: string; type: string; enabled: boolean; order: number }[];
  styles: {
    glassmorphism: number;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  atmosphere: AtmosphereType;
  prompts: {
    zh: {
      tone: string;
      style: string;
      systemInstruction: string;
    };
    ja: {
      tone: string;
      style: string;
      systemInstruction: string;
    };
  };
  charts: ChartType[];
  isPublished: boolean;
  updatedAt: string;
}

export interface AIPrompt {
  id: string;
  report_type: 'daily' | 'wish';
  section_key: string;
  prompt_zh: string;
  prompt_ja: string;
  is_enabled: boolean;
  updated_at: string;
}

export interface SEOSettings {
  title: string;
  description: string;
  keywords: string;
  og_image: string;
  google_analytics_id: string;
  search_console_id: string;
  index_enabled: boolean;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  energyUpdate?: FiveElementValues;
}

export type DrawStage = 'idle' | 'wish_input' | 'shuffling' | 'drawing_images' | 'drawing_words' | 'pairing' | 'pairing_review' | 'associating' | 'revealed';

export type LoopStage = 'calibration' | 'resonance' | 'reflection' | 'completed';

export type EnergyReportData = AnalysisReport;

export interface SiteSettings {
  key: string;
  value: any;
  updated_at: string;
}

export interface Bottle {
  id: string;
  user_id: string;
  content: string;
  element: string;
  lang: string;
  origin_locale: string;
  energy_color_tag?: string;
  tag_id?: string;
  hug_count?: number;
  card_id?: string;
  quote?: string;
  report_id?: string;
  sender_nickname?: string;
  is_active: boolean;
  created_at: string;
  display_name?: string; // Joined from users table
  sender_name?: string; // COALESCE(sender_nickname, display_name)
  card_image?: string;
  card_name?: string;
  card_image_url?: string;
  card_name_saved?: string;
  word_text?: string;
  word_name?: string;
  translatedContent?: string; // For frontend translation
  report_data?: any; // JSON data from energy_reports
  reply_message?: string; // For saved bottles
  saved_id?: string; // For saved bottles
  saved_at?: string; // For saved bottles
  tag_zh?: string; // Joined from bottle_tags
  tag_ja?: string; // Joined from bottle_tags
}

export interface BottleTag {
  id: string;
  tag: string;
  zh: string;
  ja: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BottleBlessing {
  id: string;
  bottle_id: string;
  user_id: string;
  tag_id: string;
  created_at: string;
}

// ══════════════════════════════════════════════════════════════
// MEMORY ALBUM — TypeScript Type Definitions
// ══════════════════════════════════════════════════════════════

/** Represents a single uploaded memory photo */
export interface MemoryPhoto {
  id: string;
  file: File | null;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | 'square';
  dominantColor: string;
  caption?: string;
  quote?: Quote;
  personalNote?: string;
  dateAdded: number;
}

/** A curated quote */
export interface Quote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
}

/** Quote categories */
export type QuoteCategory =
  | 'friendship'
  | 'family'
  | 'love'
  | 'travel'
  | 'adventure'
  | 'dreams'
  | 'growth'
  | 'gratitude'
  | 'nostalgia'
  | 'life';

/** A letter template */
export interface LetterTemplate {
  id: string;
  title: string;
  body: string;
  category: LetterCategory;
  paperStyle: PaperStyle;
}

/** Letter categories */
export type LetterCategory =
  | 'bestFriend'
  | 'family'
  | 'love'
  | 'appreciation'
  | 'childhood'
  | 'graduation'
  | 'celebration'
  | 'futureSelf'
  | 'longDistance'
  | 'memories';

/** Paper style variants */
export type PaperStyle =
  | 'vintage'
  | 'sticky'
  | 'journal'
  | 'coffeeStained'
  | 'handmade'
  | 'parchment'
  | 'linen';

/** Represents a single memory (photo + text) */
export interface MemoryItem {
  id: string;
  photoUrl: string;
  caption: string;
  date: string;
  quote?: string;
}

export type LetterStyle = 'vintage' | 'normal' | 'sticky';

export interface AlbumLetter {
  style: LetterStyle;
  text: string;
}

/** A memory album */
export interface MemoryAlbum {
  id: string;
  type?: 'book' | 'frame'; // New property for Album type
  title: string;
  coverColor: string;
  memories: MemoryItem[];
  createdAt: number;
  letter?: AlbumLetter;
  frameText?: string; // New property for Wooden Frame engraved text
  framePhotoUrl?: string; // New property for Wooden Frame photo
}

/** A chapter within an album */
export interface MemoryChapter {
  id: string;
  title: string;
  subtitle?: string;
  photoIds: string[];
  layoutTemplateId: string;
  atmosphere: ChapterAtmosphere;
}

/** Chapter atmosphere settings */
export interface ChapterAtmosphere {
  particleType: 'sparkles' | 'confetti' | 'bokeh' | 'fireworks' | 'feathers' | 'fireflies';
  colorAccent: string;
  lightingTint: string;
  fogDensity: number;
}

/** The final letter in the album */
export interface FinalLetter {
  content: string;
  sealType: 'wax' | 'ribbon' | 'vintage';
  isCustom: boolean;
  templateId?: string;
}

/** Dynamically generated album theme */
export interface AlbumTheme {
  primary: string;
  secondary: string;
  accent: string;
  warm: string;
  cool: string;
  backgroundGradient: string[];
}

/** App navigation state */
export type AppScene =
  | 'loading'
  | 'tutorial'
  | 'creation'
  | 'entering'
  | 'viewing'
  | 'album'
  | 'dashboard'
  | 'letter'
  | 'closing';

/** Device capability tier */
export type DeviceTier = 'high' | 'mid' | 'low';

/** Hidden discoverable types */
export interface Discoverable {
  id: string;
  type: 'note' | 'envelope' | 'token' | 'bonusPage';
  found: boolean;
  position: [number, number, number];
  content: string;
}

// ── AI Architecture Placeholders ────────────────────────────

/** @future AI Background Removal Service */
export interface AIBackgroundRemoval {
  removeBackground(image: File): Promise<Blob>;
}

/** @future AI Subject Extraction Service */
export interface AISubjectExtraction {
  extractSubject(image: File): Promise<Blob>;
}

/** @future AI Cover Generation Service */
export interface AICoverGeneration {
  generateCover(images: File[]): Promise<Blob>;
}

/** @future AI Story Generation Service */
export interface AIStoryGeneration {
  generateStory(images: File[]): Promise<string>;
}

/** @future AI Memory Grouping Service */
export interface AIMemoryGrouping {
  groupMemories(images: File[]): Promise<MemoryChapter[]>;
}

/** @future AI Quote Recommendation Service */
export interface AIQuoteRecommendation {
  recommend(mood: string): Promise<Quote[]>;
}

/** @future AI Caption Generation Service */
export interface AICaptionGeneration {
  generateCaption(image: File): Promise<string>;
}

/** @future AI Face Detection Service */
export interface AIFaceDetection {
  detectFaces(image: File): Promise<{ x: number; y: number; width: number; height: number }[]>;
}

/** @future AI Theme Generation Service */
export interface AIThemeGeneration {
  generateTheme(images: File[]): Promise<AlbumTheme>;
}

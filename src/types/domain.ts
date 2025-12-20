/**
 * Tipos de dominio de la aplicación
 * Estos tipos representan cómo la app trabaja con Ideas internamente
 */

export interface Idea {
  id: string;
  title?: string;
  transcription: string;
  audioUrl?: string;
  audioDuration?: number;
  createdAt: Date | string;
  category: string;
  aiProcessed: boolean;
  aiAnalysis?: string;
  aiMarkdown?: string;
  aiSuggestions?: string[];
  tags?: string[];
  isArchived?: boolean;
}

export type IdeaInput = {
  transcription: string;
  duration: number;
};

export type IdeaUpdate = Partial<Omit<Idea, 'id' | 'createdAt'>>;

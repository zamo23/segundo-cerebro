/**
 * Tipos puros de la API
 * Estos tipos representan exactamente la estructura retornada por el backend
 */

export interface ProcessedContent {
  titulo?: string;
  categoria?: string;
  categoria_sugerida?: string;
  [key: string]: any;
}

export interface ApiEntry {
  id: string;
  category_name?: string;
  created_at: string;
  preview?: string;
  transcription?: string;
  raw_transcription?: string;
  content_json?: Record<string, any>;
  content_markdown?: string;
  markdown_content?: string;
  processed_content?: ProcessedContent;
  user_id?: string;
  category_id?: string;
  duration?: number;
  is_archived?: boolean;
}

export interface ApiResponse {
  entries?: ApiEntry[];
  entry?: ApiEntry;
  data?: ApiEntry;
  success?: boolean;
  total?: number;
  limit?: number;
  offset?: number;
  entry_id?: string;
}

export interface CreateIdeaInput {
  transcription: string;
  duration: number;
}

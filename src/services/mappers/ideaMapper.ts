/**
 * Mapper de Ideas
 * Transforma datos de la API al formato de dominio y viceversa
 */

import { Idea } from '@/types/domain';
import { ApiEntry } from '../api/types';

/**
 * Extrae la categoría de diferentes posibles ubicaciones en ApiEntry
 */
function extractCategory(entry: ApiEntry): string {
  return (
    entry.category_name ||
    entry.processed_content?.categoria ||
    (entry.processed_content as any)?.categoria_sugerida ||
    'sin-categoría'
  );
}

/**
 * Extrae el título de la ApiEntry
 */
function extractTitle(entry: ApiEntry): string | undefined {
  return entry.processed_content?.titulo;
}

/**
 * Extrae la transcripción, probando múltiples fuentes
 */
function extractTranscription(entry: ApiEntry): string {
  return (
    entry.transcription ||
    entry.raw_transcription ||
    entry.preview ||
    ''
  );
}

/**
 * Determina si una idea ha sido procesada por IA
 */
function isAiProcessed(entry: ApiEntry): boolean {
  return !!entry.markdown_content || !!entry.content_markdown;
}

/**
 * Extrae el markdown procesado por IA
 */
function extractAiMarkdown(entry: ApiEntry): string | undefined {
  return entry.markdown_content || entry.content_markdown;
}

/**
 * Extrae el análisis de IA
 */
function extractAiAnalysis(entry: ApiEntry): string | undefined {
  if (entry.processed_content) {
    return JSON.stringify(entry.processed_content);
  }
  if (entry.content_json) {
    return JSON.stringify(entry.content_json);
  }
  return undefined;
}

export const ideaMapper = {
  /**
   * Convierte una ApiEntry a Idea de dominio
   */
  fromApi(entry: ApiEntry): Idea {
    return {
      id: entry.id,
      title: extractTitle(entry),
      transcription: extractTranscription(entry),
      createdAt: entry.created_at,
      category: extractCategory(entry),
      aiProcessed: isAiProcessed(entry),
      aiMarkdown: extractAiMarkdown(entry),
      aiAnalysis: extractAiAnalysis(entry),
      audioUrl: undefined,
      audioDuration: entry.duration,
      aiSuggestions: [],
      tags: [],
      isArchived: !!entry.is_archived,
    };
  },

  /**
   * Convierte múltiples ApiEntry a Ideas
   */
  fromApiList(entries: ApiEntry[]): Idea[] {
    return entries.map(entry => this.fromApi(entry));
  },

  /**
   * Convierte una Idea a ApiEntry (parcial, para updates)
   */
  toApi(_idea: Idea): Partial<ApiEntry> {
    return {
      
    };
  },
};

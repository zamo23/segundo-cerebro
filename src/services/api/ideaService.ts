/**
 * Servicio de Ideas
 * Encapsula todas las llamadas a API relacionadas con ideas
 */

import { apiCall, logApiCall } from './client';
import { ApiEntry, ApiResponse, CreateIdeaInput } from './types';

export const ideaService = {
  /**
   * Obtiene todas las ideas del usuario
   */
  async getAll(token: string, limit = 10, offset = 0): Promise<ApiEntry[]> {
    logApiCall('GET', `/entries?limit=${limit}&offset=${offset}`);

    const data = await apiCall<ApiResponse>(
      `/entries?limit=${limit}&offset=${offset}`,
      { token, method: 'GET' }
    );

    return data.entries || [];
  },

  /**
   * Obtiene todas las ideas archivadas del usuario
   */
  async getArchived(token: string, limit = 10, offset = 0): Promise<ApiEntry[]> {
    logApiCall('GET', `/entries?include_archived=true&limit=${limit}&offset=${offset}`);

    const data = await apiCall<ApiResponse>(
      `/entries?include_archived=true&limit=${limit}&offset=${offset}`,
      { token, method: 'GET' }
    );

    // Filtrar solo las ideas archivadas
    return (data.entries || []).filter(entry => entry.is_archived === 1);
  },

  /**
   * Obtiene una idea específica por ID
   */
  async getById(id: string, token: string): Promise<ApiEntry> {
    logApiCall('GET', `/entries/${id}`);

    const data = await apiCall<ApiResponse>(`/entries/${id}`, {
      token,
      method: 'GET',
    });

    if (!data.entry) {
      throw new Error('Entry not found');
    }

    return data.entry;
  },

  /**
   * Crea una nueva idea con transcripción (texto)
   */
  async createWithTranscription(
    transcription: string,
    duration: number,
    token: string
  ): Promise<ApiEntry> {
    const input: CreateIdeaInput = {
      transcription,
      duration,
    };

    logApiCall('POST', '/entries (text)', input);

    const data = await apiCall<ApiResponse>('/entries', {
      token,
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const entry = (data as any).data || data.entry;

    if (!entry) {
      throw new Error('No entry returned from API');
    }

    return entry;
  },

  /**
   * Crea una nueva idea con archivo de audio
   */
  async createWithAudio(
    audioFile: Blob,
    duration: number,
    token: string
  ): Promise<ApiEntry> {
    const formData = new FormData();
    formData.append('audio_file', audioFile, 'recording.webm');
    formData.append('duration', duration.toString());

    logApiCall('POST', '/entries (audio)', { duration });

    const data = await apiCall<ApiResponse>('/entries', {
      token,
      method: 'POST',
      body: formData,
      // No setear Content-Type, el navegador lo pone automáticamente
      isFormData: true,
    });

    const entry = (data as any).data || data.entry;

    if (!entry) {
      throw new Error('No entry returned from API');
    }

    return entry;
  },

  /**
   * Crea una nueva idea (método heredado - usa transcripción)
   */
  async create(
    input: CreateIdeaInput,
    token: string
  ): Promise<ApiEntry> {
    return this.createWithTranscription(input.transcription, input.duration, token);
  },

  /**
   * Actualiza una idea existente
   */
  async update(
    id: string,
    updates: Partial<ApiEntry>,
    token: string
  ): Promise<ApiEntry> {
    logApiCall('PATCH', `/entries/${id}`, updates);

    const data = await apiCall<ApiResponse>(`/entries/${id}`, {
      token,
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (!data.entry) {
      throw new Error('No entry returned from API');
    }

    return data.entry;
  },

  /**
   * Elimina una idea
   */
  async delete(id: string, token: string): Promise<void> {
    logApiCall('DELETE', `/entries/${id}`);

    await apiCall(`/entries/${id}`, {
      token,
      method: 'DELETE',
    });
  },

  /**
   * Archiva o desarchiva una idea
   * @param id - ID de la idea
   * @param isArchived - true para archivar, false para desarchivar
   * @param token - Token de autenticación
   */
  async archive(id: string, isArchived: boolean, token: string): Promise<{ entry_id: string; is_archived: boolean }> {
    logApiCall('PATCH', `/entries/${id}/archive`, { is_archived: isArchived });

    const data = await apiCall<{ success: boolean; message: string; entry_id: string }>(`/entries/${id}/archive`, {
      token,
      method: 'PATCH',
      body: JSON.stringify({ is_archived: isArchived }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!data.success || !data.entry_id) {
      throw new Error('No entry_id returned from API');
    }

    return { entry_id: data.entry_id, is_archived: isArchived };
  },
};

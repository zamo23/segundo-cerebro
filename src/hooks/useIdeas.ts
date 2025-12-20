import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ideaService } from '@/services/api/ideaService';
import { ideaValidator, ValidationError } from '@/services/validators/ideaValidator';
import { ideaMapper } from '@/services/mappers/ideaMapper';
import { Idea } from '@/types/domain';

interface UseIdeasState {
  ideas: Idea[];
  loading: boolean;
  error: string | null;
}

/**
 * Extrae mensaje de error de forma consistente
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ValidationError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Error desconocido';
}

/**
 * Hook para gestionar ideas
 * Encapsula toda la lógica de fetch, transformación y validación
 */
export function useIdeas() {
  const { getToken } = useAuth();
  const [state, setState] = useState<UseIdeasState>({
    ideas: [],
    loading: true,
    error: null,
  });
  const [isFetching, setIsFetching] = useState(false);

  /**
   * Obtiene todas las ideas del usuario
   */
  const fetchIdeas = useCallback(async () => {
    // Evitar race conditions
    if (isFetching) {
      return;
    }

    try {
      setIsFetching(true);
      setState(prev => ({ ...prev, loading: true, error: null }));

      const token = await getToken();
      if (!token) {
        throw new Error('No token available');
      }
      
      const entries = await ideaService.getAll(token);
      const ideas = ideaMapper.fromApiList(entries);

      setState({ ideas, loading: false, error: null });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    } finally {
      setIsFetching(false);
    }
  }, [getToken, isFetching]);

  // Cargar ideas al montar el componente
  useEffect(() => {
    fetchIdeas();
  }, []);

  /**
   * Crea una nueva idea con texto
   * @param input - Objeto con transcription y duration
   */
  const createIdea = useCallback(
    async (input: { transcription: string; duration: number }): Promise<Idea | null> => {
      try {
        const { transcription, duration } = input;
        // Validar entrada
        ideaValidator.validateCreateInput(transcription, duration);

        setState(prev => ({ ...prev, error: null }));
        const token = await getToken();
        if (!token) {
          throw new Error('No token available');
        }

        const entry = await ideaService.create(
          { transcription, duration },
          token
        );
        const idea = ideaMapper.fromApi(entry);

        // Agregar al inicio de la lista
        setState(prev => ({
          ...prev,
          ideas: [idea, ...prev.ideas],
        }));

        return idea;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setState(prev => ({ ...prev, error: errorMessage }));
        return null;
      }
    },
    [getToken]
  );

  /**
   * Crea una nueva idea con audio
   * @param input - Objeto con audioBlob y duration
   */
  const createIdeaWithAudio = useCallback(
    async (input: { audioBlob: Blob; duration: number }): Promise<Idea | null> => {
      try {
        const { audioBlob, duration } = input;

        setState(prev => ({ ...prev, error: null }));
        const token = await getToken();
        if (!token) {
          throw new Error('No token available');
        }

        console.log('createIdeaWithAudio: Enviando audio al servidor');
        const entry = await ideaService.createWithAudio(audioBlob, duration, token);
        console.log('createIdeaWithAudio: Respuesta del servidor:', entry);
        const idea = ideaMapper.fromApi(entry);

        // Agregar al inicio de la lista
        setState(prev => ({
          ...prev,
          ideas: [idea, ...prev.ideas],
        }));

        return idea;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        console.error('createIdeaWithAudio error:', errorMessage);
        setState(prev => ({ ...prev, error: errorMessage }));
        return null;
      }
    },
    [getToken]
  );

  /**
   * Actualiza una idea existente
   */
  const updateIdea = useCallback(
    async (id: string, updates: Partial<Idea>): Promise<boolean> => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No token available');
        }
        
        await ideaService.update(id, updates, token);

        setState(prev => ({
          ...prev,
          ideas: prev.ideas.map(idea =>
            idea.id === id ? { ...idea, ...updates } : idea
          ),
          error: null,
        }));

        return true;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setState(prev => ({ ...prev, error: errorMessage }));
        return false;
      }
    },
    [getToken]
  );

  /**
   * Elimina una idea
   */
  const deleteIdea = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No token available');
        }
        
        await ideaService.delete(id, token);

        setState(prev => ({
          ...prev,
          ideas: prev.ideas.filter(idea => idea.id !== id),
          error: null,
        }));

        return true;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setState(prev => ({ ...prev, error: errorMessage }));
        return false;
      }
    },
    [getToken]
  );

  /**
   * Archiva o desarchiva una idea
   * @param id - ID de la idea
   * @param isArchived - true para archivar, false para desarchivar
   */
  const archiveIdea = useCallback(
    async (id: string, isArchived: boolean): Promise<boolean> => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No token available');
        }
        await ideaService.archive(id, isArchived, token);
        setState(prev => ({
          ...prev,
          ideas: prev.ideas.filter(idea => idea.id !== id),
          error: null,
        }));
        return true;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setState(prev => ({ ...prev, error: errorMessage }));
        return false;
      }
    },
    [getToken]
  );

  /**
   * Obtiene los detalles de una idea específica
   */
  const getIdeaDetails = useCallback(
    async (id: string): Promise<Idea | null> => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No token available');
        }
        
        const entry = await ideaService.getById(id, token);
        return ideaMapper.fromApi(entry);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setState(prev => ({ ...prev, error: errorMessage }));
        return null;
      }
    },
    [getToken]
  );

  /**
   * Recarga la lista de ideas
   */
  const refetch = useCallback(() => {
    setIsFetching(false);
    return fetchIdeas();
  }, [fetchIdeas]);

  return {
    ideas: state.ideas,
    loading: state.loading,
    error: state.error,
    createIdea,
    createIdeaWithAudio,
    updateIdea,
    deleteIdea,
    archiveIdea,
    getIdeaDetails,
    refetch,
  };
}

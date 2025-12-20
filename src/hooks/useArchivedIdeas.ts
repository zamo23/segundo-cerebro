import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ideaService } from '@/services/api/ideaService';
import { ideaMapper } from '@/services/mappers/ideaMapper';
import { Idea } from '@/types/domain';

interface UseArchivedIdeasState {
  archivedIdeas: Idea[];
  loading: boolean;
  error: string | null;
}

/**
 * Extrae mensaje de error de forma consistente
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return 'Error desconocido';
}

/**
 * Hook para gestionar ideas archivadas
 * Encapsula toda la lógica de fetch, transformación y validación para ideas archivadas
 */
export function useArchivedIdeas() {
  const { getToken } = useAuth();
  const [state, setState] = useState<UseArchivedIdeasState>({
    archivedIdeas: [],
    loading: true,
    error: null,
  });
  const [isFetching, setIsFetching] = useState(false);

  /**
   * Obtiene todas las ideas archivadas del usuario
   */
  const fetchArchivedIdeas = useCallback(async () => {
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

      const entries = await ideaService.getArchived(token);
      const archivedIdeas = ideaMapper.fromApiList(entries);

      setState({ archivedIdeas, loading: false, error: null });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    } finally {
      setIsFetching(false);
    }
  }, [getToken, isFetching]);

  // Cargar ideas archivadas al montar el componente
  useEffect(() => {
    fetchArchivedIdeas();
  }, []);

  /**
   * Elimina una idea archivada
   */
  const deleteArchivedIdea = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No token available');
        }

        await ideaService.delete(id, token);

        setState(prev => ({
          ...prev,
          archivedIdeas: prev.archivedIdeas.filter(idea => idea.id !== id),
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
   * Desarchiva una idea (la mueve de archivadas a activas)
   */
  const unarchiveIdea = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('No token available');
        }

        await ideaService.archive(id, false, token);

        setState(prev => ({
          ...prev,
          archivedIdeas: prev.archivedIdeas.filter(idea => idea.id !== id),
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
   * Recarga la lista de ideas archivadas
   */
  const refetch = useCallback(() => {
    setIsFetching(false);
    return fetchArchivedIdeas();
  }, [fetchArchivedIdeas]);

  return {
    archivedIdeas: state.archivedIdeas,
    loading: state.loading,
    error: state.error,
    deleteArchivedIdea,
    unarchiveIdea,
    refetch,
  };
}
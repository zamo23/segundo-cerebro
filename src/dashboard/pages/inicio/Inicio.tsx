import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import IdeaCard from '../../components/IdeaCard';
import IdeaDetail from './IdeaDetail';
import ProcessingIdeas from './ProcessingIdeas';
import RecordingModal from '../../components/RecordingModal';
import type { Idea } from '../../../types/domain';

interface ProcessingIdea {
  id: string;
  transcription: string;
  createdAt: Date;
  progress?: number;
}


interface ContextType {
  ideas: Idea[];
  onUpdate: (id: string, updates: Partial<Idea>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, isArchived: boolean) => void;
  createIdea: (input: { transcription: string; duration: number }) => Promise<Idea | null>;
  createIdeaWithAudio: (input: { audioBlob: Blob; duration: number }) => Promise<Idea | null>;
  getIdeaDetails: (id: string) => Promise<Idea | null>;
  search?: string;
}

interface InicioProps {
  search?: string;
}

export default function Inicio({ search }: InicioProps) {
  const { ideas, onDelete, onArchive, createIdea, createIdeaWithAudio, getIdeaDetails, search: contextSearch } = useOutletContext<ContextType>();
  const searchValue = typeof search === 'string' ? search : contextSearch || '';
  const { ideaId } = useParams<{ ideaId?: string }>();
  const navigate = useNavigate();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedIdeaDetail, setSelectedIdeaDetail] = useState<Idea | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [processingIdeas, setProcessingIdeas] = useState<ProcessingIdea[]>([]);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  // Si hay ideaId en la URL, cargar esa idea
  useEffect(() => {
    if (ideaId) {
      setSelectedIdeaId(ideaId);
    } else {
      setSelectedIdeaId(null);
      setSelectedIdeaDetail(null);
    }
  }, [ideaId]);

  // Navegar a la idea cuando se selecciona (solo si viene del usuario, no de la URL)
  useEffect(() => {
    if (selectedIdeaId && !ideaId) {
      navigate(`idea/${selectedIdeaId}`, { replace: true });
    }
  }, [selectedIdeaId, ideaId, navigate]);

  // Cargar detalles de idea cuando se selecciona
  useEffect(() => {
    const loadIdeaDetail = async () => {
      if (!selectedIdeaId) {
        setSelectedIdeaDetail(null);
        return;
      }

      setLoadingDetail(true);
      try {
        const detail = await getIdeaDetails(selectedIdeaId);
        setSelectedIdeaDetail(detail);
      } catch (err) {
        setSelectedIdeaDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };

    loadIdeaDetail();
  }, [selectedIdeaId, getIdeaDetails]);

  const handleSaveTextRecording = async (data: {
    transcription: string;
    duration: number;
  }) => {
    try {
      console.log('handleSaveTextRecording llamado con:', data);
      
      const processingIdea: ProcessingIdea = {
        id: `processing-${Date.now()}`,
        transcription: data.transcription,
        createdAt: new Date(),
        progress: 0,
      };

      setProcessingIdeas((prev) => [processingIdea, ...prev]);

      const newIdea = await createIdea({
        transcription: data.transcription,
        duration: data.duration,
      });

      console.log('Nueva idea creada:', newIdea);
      setProcessingIdeas((prev) => prev.filter((idea) => idea.id !== processingIdea.id));

      if (!newIdea) {
        console.error('Error creando idea');
      }
    } catch (error) {
      console.error('Error en handleSaveTextRecording:', error);
    }
  };

  const handleSaveAudioRecording = async (data: {
    audioBlob: Blob;
    duration: number;
  }) => {
    try {
      console.log('handleSaveAudioRecording llamado con:', { duration: data.duration, blobSize: data.audioBlob.size });
      
      const processingIdea: ProcessingIdea = {
        id: `processing-${Date.now()}`,
        transcription: `Audio grabado (${data.duration}s)`,
        createdAt: new Date(),
        progress: 0,
      };

      setProcessingIdeas((prev) => [processingIdea, ...prev]);

      console.log('Enviando audio al servidor...');
      const newIdea = await createIdeaWithAudio(data);
      
      if (newIdea) {
        console.log('Audio guardado exitosamente:', newIdea);
      } else {
        console.error('Error al guardar el audio');
      }

      setProcessingIdeas((prev) => prev.filter((idea) => idea.id !== processingIdea.id));
    } catch (error) {
      console.error('Error en handleSaveAudioRecording:', error);
    }
  };

  // Si hay una idea seleccionada, mostrar el detalle
  if (selectedIdeaId && selectedIdeaDetail) {
    return (
      <IdeaDetail
        idea={selectedIdeaDetail as any}
        onClose={() => {
          setSelectedIdeaId(null);
          setSelectedIdeaDetail(null);
          navigate('/inicio', { replace: true });
        }}
        onUpdate={(_id, _updates) => {}}
        onDelete={onDelete}
      />
    );
  }

  // Mostrar loading mientras se carga el detalle
  if (selectedIdeaId && loadingDetail) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  // Filtrar ideas según búsqueda
  const filteredIdeas = searchValue && searchValue.trim().length > 0
    ? ideas.filter(idea =>
        idea.transcription?.toLowerCase().includes(searchValue.toLowerCase()) ||
        idea.title?.toLowerCase().includes(searchValue.toLowerCase())
      )
    : ideas;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:ml-auto lg:mr-0 lg:pr-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Ideas</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            {new Date().toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <span className="text-xs sm:text-sm text-gray-500 font-medium">
          {filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'}
        </span>
      </div>

      {/* Ideas procesando */}
      {processingIdeas.length > 0 && (
        <ProcessingIdeas ideas={processingIdeas} />
      )}

      {/* Ideas de la categoría seleccionada */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea as any}
              onClick={() => setSelectedIdeaId(idea.id)}
              onArchive={(id) => onArchive(id, true)}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg">
            No hay ideas que coincidan con tu búsqueda.
          </p>
        </div>
      )}

      {/* Audio Recorder */}
      <RecordingModal
        isOpen={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
        onSaveText={handleSaveTextRecording}
        onSaveAudio={handleSaveAudioRecording}
      />

      {/* Floating Action Button */}
      <button
        onClick={() => setIsRecordingModalOpen(true)}
        className="fixed bottom-24 lg:bottom-8 right-4 sm:right-8 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center z-40"
        title="Nueva idea"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

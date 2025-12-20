import { Archive } from 'lucide-react';
import { useArchivedIdeas } from '../../../hooks/useArchivedIdeas';
import IdeaCard from '../../components/IdeaCard';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function Archivados() {
  const { archivedIdeas, loading, error, deleteArchivedIdea, unarchiveIdea } = useArchivedIdeas();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Cargando ideas archivadas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Archive className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-red-600 font-semibold mb-2">Error al cargar las ideas archivadas</p>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ideas Archivadas</h1>
        <p className="text-gray-600">
          Aquí puedes ver todas tus ideas archivadas. Puedes desarchivarlas para volver a trabajar en ellas o eliminarlas permanentemente.
        </p>
      </div>

      {archivedIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Archive className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay ideas archivadas</h2>
          <p className="text-gray-500 text-center max-w-md">
            Las ideas que archives aparecerán aquí. Puedes archivar ideas desde la vista principal para mantener tu espacio de trabajo organizado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUnarchive={unarchiveIdea}
              onDelete={deleteArchivedIdea}
            />
          ))}
        </div>
      )}
    </div>
  );
}

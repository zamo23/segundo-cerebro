import { Mic, Clock, Sparkles, Archive, Trash2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { Idea } from '../../types/domain';
import { formatDate, formatDuration, truncateText } from '../../utils/formatters';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function IdeaCard({ idea, onClick, onArchive, onUnarchive, onDelete }: IdeaCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  const handleUnarchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHiding(true);
    setTimeout(() => {
      if (onUnarchive) {
        onUnarchive(idea.id);
      }
    }, 250); // Duración de la animación
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHiding(true);
    setTimeout(() => {
      if (onArchive) {
        onArchive(idea.id);
      }
    }, 250); // Duración de la animación
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHiding(true);
    setTimeout(() => {
      if (onDelete) {
        onDelete(idea.id);
      }
      setShowConfirmDelete(false);
    }, 250);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all relative group duration-300 ease-in-out ${isHiding ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
      style={{ transitionProperty: 'opacity, transform' }}
    >
      {/* Botones de acción - visibles al hacer hover */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onUnarchive && (
          <button
            onClick={handleUnarchive}
            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            title="Desarchivar idea"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        {onArchive && (
          <button
            onClick={handleArchive}
            className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="Archivar idea"
          >
            <Archive className="w-4 h-4" />
          </button>
        )}
        {onDelete && !showConfirmDelete && (
          <button
            onClick={handleDeleteClick}
            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="Eliminar idea"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Confirmación de eliminación */}
      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center gap-3 p-4 z-10">
          <p className="text-sm text-gray-700 font-medium text-center">
            ¿Eliminar esta idea?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Contenido clickeable */}
      <div onClick={onClick} className="cursor-pointer">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">{formatDate(idea.createdAt)}</span>
            {idea.audioDuration && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatDuration(idea.audioDuration)}
              </span>
            )}
          </div>
          {idea.aiProcessed && (
            <Sparkles className="w-4 h-4 text-green-500" />
          )}
        </div>

        {/* Título */}
        {idea.title && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {idea.title}
          </p>
        )}

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {idea.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {idea.tags.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{idea.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Categoría */}
        {idea.category && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-blue-600 font-medium capitalize">{idea.category}</p>
          </div>
        )}
      </div>
    </div>
  );
}

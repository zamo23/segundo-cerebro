import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { useIdeas } from '../hooks/useIdeas';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Idea } from '../types/domain';

import { useState } from 'react';

export default function Dashboard() {
  const { ideas, loading, error, updateIdea, deleteIdea, archiveIdea, createIdea, createIdeaWithAudio, getIdeaDetails } = useIdeas();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header searchValue={search} onSearchChange={setSearch} ideas={ideas} onResultClick={idea => navigate(`/inicio/idea/${idea.id}`)} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header searchValue={search} onSearchChange={setSearch} ideas={ideas} onResultClick={idea => navigate(`/inicio/idea/${idea.id}`)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-2">Error al cargar las ideas</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header searchValue={search} onSearchChange={setSearch} ideas={ideas} onResultClick={idea => navigate(`/inicio/idea/${idea.id}`)} />

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Sidebar desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8 pb-24 sm:pb-24 lg:pb-8">
          <Outlet context={{ ideas, onUpdate: updateIdea, onDelete: deleteIdea, onArchive: archiveIdea, createIdea, createIdeaWithAudio, getIdeaDetails, search }} />
        </main>
      </div>

      {/* Bottom navigation mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <Sidebar isMobile={true} />
      </nav>
    </div>
  );
}

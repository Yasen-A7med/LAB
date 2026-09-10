import React, { useState } from 'react';
import { Cpu, Plus, Trash2, RefreshCw } from 'lucide-react';
import type { ProjectItem } from '../types';
import { DEFAULT_PROJECT_ID } from '../services/eventService';

interface ProjectSelectorProps {
  projects: ProjectItem[];
  selectedProjectId: string;
  loading: boolean;
  onSelectProject: (project: ProjectItem) => void;
  onCreateProject: (name: string) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProjectId,
  loading,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreating(true);
    await onCreateProject(newProjectName.trim());
    setNewProjectName('');
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create Project Card */}
      <div className="bg-[#0b0b14]/80 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Create Event Project</h3>
          <p className="text-xs text-gray-400">
            Initialize a new isolated project environment for attendee check-in & event management.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project / Event Name..."
            className="bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {creating ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>Create</span>
          </button>
        </form>
      </div>

      {/* Projects Grid */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          All Projects ({projects.length})
        </span>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-gray-500 text-sm">
            <RefreshCw size={18} className="animate-spin mr-2" />
            Loading projects...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p) => {
              const isSelected = p.id === selectedProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-[#0b0b14]/50 border-white/10 hover:border-white/20 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-amber-500 text-black' : 'bg-white/[0.04] text-gray-400'
                      }`}
                    >
                      <Cpu size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{p.name}</h4>
                      <span className="text-[11px] text-gray-400 font-mono block">ID: {p.id.slice(0, 8)}...</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-400 px-2.5 py-1 rounded-full border border-amber-400/30">
                        Selected
                      </span>
                    )}
                    {p.id !== DEFAULT_PROJECT_ID && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(p.id);
                        }}
                        className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

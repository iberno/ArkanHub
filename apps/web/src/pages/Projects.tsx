import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Calendar, User } from 'lucide-react';
import { projectsService } from '../services/projects';
import { ProjectCreateModal } from '../components/projects/ProjectCreateModal';
import type { Project } from '../types/api';

const statusColor: Record<string, string> = {
  Draft: 'badge-ghost',
  Planned: 'badge-info',
  'In Progress': 'badge-warning',
  Completed: 'badge-success',
  Cancelled: 'badge-error',
};

export function Projects() {
  const createRef = useRef<HTMLDialogElement | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.findAll(),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projetos</h1>
        <button className="btn btn-primary btn-sm gap-1" onClick={() => createRef.current?.showModal()}>
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      <ProjectCreateModal modalRef={createRef} />

      {isLoading ? <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
        : !projects?.length ? <div className="text-center py-12 text-base-content/40">Nenhum projeto cadastrado</div>
        : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
      }
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`}
      className="block bg-base-100 rounded-box shadow-sm border border-base-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <FolderKanban size={20} className="text-primary shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate">{project.name}</h3>
          {project.description && <p className="text-xs text-base-content/50 line-clamp-2 mt-0.5">{project.description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-base-content/40 mb-2">
        <span className={`badge badge-xs ${statusColor[project.status] || 'badge-ghost'}`}>{project.status}</span>
        <span className="badge badge-xs badge-outline">{project.priority}</span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-base-content/40">
        <span className="flex items-center gap-1"><User size={10} /> {project.manager?.name}</span>
        {project.startDate && <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(project.startDate).toLocaleDateString('pt-BR')}</span>}
        <span className="ml-auto">{project._count?.tickets ?? 0} tickets</span>
      </div>
    </Link>
  );
}

import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Plus } from 'lucide-react';
import { slasService } from '../services/slas';
import { SlaCreateModal } from '../components/slas/SlaCreateModal';

export function Slas() {
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const { data: slas, isLoading } = useQuery({
    queryKey: ['slas'],
    queryFn: slasService.findAll,
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">SLAs</h1>
        <button className="btn btn-primary" onClick={() => modalRef.current?.showModal()}>
          <Plus size={18} />
          Novo SLA
        </button>
      </div>

      <SlaCreateModal modalRef={modalRef} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(!slas || slas.length === 0) ? (
            <div className="col-span-full text-center text-base-content/50 py-12 bg-base-100 rounded-box border border-base-200">
              Nenhum SLA configurado
            </div>
          ) : (
            slas.map((sla) => (
              <div key={sla.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-primary" />
                  <h3 className="font-semibold">{sla.name}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">1ª Resposta</span>
                    <span className="font-medium">{sla.responseTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Resolução</span>
                    <span className="font-medium">{sla.resolutionTime} min</span>
                  </div>
                  {sla.rules && sla.rules.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-base-200">
                      {sla.rules.map((r) => (
                        <span key={r.id} className="badge badge-sm badge-outline">
                          {r.priority}/{r.impact}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

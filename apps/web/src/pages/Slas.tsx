import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slasService } from '../services/slas';

export function Slas() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [responseTime, setResponseTime] = useState(60);
  const [resolutionTime, setResolutionTime] = useState(240);
  const queryClient = useQueryClient();

  const { data: slas, isLoading } = useQuery({
    queryKey: ['slas'],
    queryFn: slasService.findAll,
  });

  const createMutation = useMutation({
    mutationFn: () => slasService.create({ name, responseTime, resolutionTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slas'] });
      setName('');
      setResponseTime(60);
      setResolutionTime(240);
      setShowForm(false);
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">SLAs</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Novo SLA'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6 mb-6 space-y-4 max-w-lg"
        >
          <div className="form-control">
            <label className="label"><span className="label-text">Nome</span></label>
            <input type="text" className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Tempo de resposta (min)</span></label>
              <input type="number" className="input input-bordered" value={responseTime} onChange={(e) => setResponseTime(Number(e.target.value))} min={1} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Tempo de resolução (min)</span></label>
              <input type="number" className="input input-bordered" value={resolutionTime} onChange={(e) => setResolutionTime(Number(e.target.value))} min={1} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm border border-base-200">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Resposta</th>
                <th>Resolução</th>
              </tr>
            </thead>
            <tbody>
              {(!slas || slas.length === 0) ? (
                <tr>
                  <td colSpan={3} className="text-center text-base-content/50 py-8">
                    Nenhum SLA configurado
                  </td>
                </tr>
              ) : (
                slas.map((sla) => (
                  <tr key={sla.id} className="hover">
                    <td>{sla.name}</td>
                    <td>{sla.responseTime} min</td>
                    <td>{sla.resolutionTime} min</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

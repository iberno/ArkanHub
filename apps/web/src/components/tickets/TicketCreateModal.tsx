import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from '../../services/tickets';
import { useAuthStore } from '../../store/auth';
import { api } from '../../services/api';
import type { TicketStatus, TicketPriority } from '../../types/api';

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>;
}

export function TicketCreateModal({ modalRef }: Props) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('');
  const [priorityId, setPriorityId] = useState('');

  const { data: statuses } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => api.get<TicketStatus[]>('/ticket-statuses').then((r) => r.data),
  });

  const { data: priorities } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => api.get<TicketPriority[]>('/ticket-priorities').then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: () =>
      ticketsService.create({ title, description, requesterId: user!.id, statusId, priorityId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      closeModal();
    },
  });

  const closeModal = () => {
    setTitle('');
    setDescription('');
    setStatusId('');
    setPriorityId('');
    modalRef.current?.close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box w-full max-w-lg">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-6">Novo Ticket</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Título</span></label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Ex: Não consigo acessar o sistema"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Descrição</span></label>
            <textarea
              className="textarea textarea-bordered"
              rows={4}
              placeholder="Descreva detalhadamente o problema ou solicitação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Status</span></label>
              <select className="select select-bordered" value={statusId} onChange={(e) => setStatusId(e.target.value)} required>
                <option value="">Selecione...</option>
                {statuses?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Prioridade</span></label>
              <select className="select select-bordered" value={priorityId} onChange={(e) => setPriorityId(e.target.value)} required>
                <option value="">Selecione...</option>
                {priorities?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar Ticket'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>fechar</button>
      </form>
    </dialog>
  );
}

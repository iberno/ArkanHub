import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ticketsService } from '../services/tickets';
import { useAuthStore } from '../store/auth';
import { api } from '../services/api';
import type { TicketStatus, TicketPriority } from '../types/api';

export function TicketNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const relatedTo = searchParams.get('relatedTo');
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('');
  const [priorityId, setPriorityId] = useState('');

  const { data: relatedTicket } = useQuery({
    queryKey: ['ticket', relatedTo],
    queryFn: () => ticketsService.findOne(relatedTo!),
    enabled: !!relatedTo,
  });

  const { data: statuses } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => api.get<TicketStatus[]>('/ticket-statuses').then((r) => r.data),
  });

  const { data: priorities } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => api.get<TicketPriority[]>('/ticket-priorities').then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        title,
        description,
        requesterId: user!.id,
        statusId,
        priorityId,
      };
      if (relatedTo) {
        return ticketsService.createRelated(relatedTo, body);
      }
      return ticketsService.create(body);
    },
    onSuccess: (ticket) => {
      navigate(`/tickets/${ticket.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link to="/tickets" className="link link-hover text-sm">&larr; Voltar</Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">
        {relatedTo ? 'Novo Ticket Relacionado' : 'Novo Ticket'}
      </h1>

      {relatedTicket && (
        <div className="alert alert-info mb-4 text-sm">
          <span>
            Este ticket será criado como relacionado ao ticket{' '}
            <strong>{relatedTicket.protocol}</strong> — {relatedTicket.title}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6 space-y-4">
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
            rows={5}
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

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/tickets" className="btn btn-ghost">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

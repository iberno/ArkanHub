import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { ticketsService } from '../services/tickets';

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsService.findOne(id!),
    enabled: !!id,
  });

  const commentMutation = useMutation({
    mutationFn: () => ticketsService.addComment(id!, newComment, isInternal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setNewComment('');
      setIsInternal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!ticket) {
    return <p className="text-base-content/50">Ticket não encontrado</p>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link to="/tickets" className="link link-hover text-sm inline-flex items-center gap-1"><ArrowLeft size={14} /> Voltar para tickets</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{ticket.title}</h1>
                <p className="text-sm text-base-content/60 mt-1">
                  {ticket.protocol} &middot; Aberto em {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <p className="text-base-content/80 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6">
            <h2 className="font-semibold mb-4">Comentários</h2>

            {(ticket.comments?.length ?? 0) === 0 ? (
              <p className="text-sm text-base-content/50 mb-4">Nenhum comentário ainda</p>
            ) : (
              <div className="space-y-3 mb-6">
                {ticket.comments?.map((c) => (
                  <div key={c.id} className={`p-3 rounded-lg ${c.internal ? 'bg-warning/5 border border-warning/20' : 'bg-base-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{c.user.name}</span>
                      {c.internal && <span className="badge badge-warning badge-xs">Interno</span>}
                      <span className="text-xs text-base-content/40 ml-auto">
                        {new Date(c.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/80">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <textarea
                className="textarea textarea-bordered"
                rows={3}
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  <span className="text-xs">Comentário interno</span>
                </label>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => commentMutation.mutate()}
                  disabled={!newComment.trim() || commentMutation.isPending}
                >
                  {commentMutation.isPending ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : 'Comentar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6">
            <h3 className="font-semibold mb-3">Informações</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-base-content/60">Status</dt>
                <dd>
                  <span
                    className="badge badge-sm"
                    style={{ backgroundColor: ticket.status?.color ?? '#888', color: '#fff' }}
                  >
                    {ticket.status?.name}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-base-content/60">Prioridade</dt>
                <dd>{ticket.priority?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-base-content/60">Solicitante</dt>
                <dd>{ticket.requester?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-base-content/60">Atribuído para</dt>
                <dd>{ticket.assignee?.name || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

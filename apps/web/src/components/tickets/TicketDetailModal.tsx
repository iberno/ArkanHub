import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, CheckCircle, XCircle, Clock, Paperclip, Download, UserCog, Star } from 'lucide-react';
import { ticketsService } from '../../services/tickets';
import { approvalsService } from '../../services/approvals';
import { usersService } from '../../services/users';
import { departmentsService } from '../../services/departments';
import { satisfactionService } from '../../services/satisfaction';
import { useAuthStore } from '../../store/auth';
import { FileUpload } from '../ui/FileUpload';
import { StarRating } from '../ui/StarRating';

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  ticketId: string | null;
  onClose?: () => void;
}

export function TicketDetailModal({ modalRef, ticketId, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [deptId, setDeptId] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsService.findOne(ticketId!),
    enabled: !!ticketId,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.findAll(),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.findAll(),
  });

  const { data: attachments, refetch: refetchAttachments } = useQuery({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: () => ticketsService.getAttachments(ticketId!),
    enabled: !!ticketId,
  });

  const { data: approvals } = useQuery({
    queryKey: ['ticket-approvals', ticketId],
    queryFn: () => approvalsService.findByTicket(ticketId!),
    enabled: !!ticketId,
  });

  const isResolvedOrClosed = ticket && (ticket.status?.name === 'Resolvido' || ticket.status?.name === 'Fechado');

  const { data: satisfaction, refetch: refetchSatisfaction } = useQuery({
    queryKey: ['ticket-satisfaction', ticketId],
    queryFn: () => satisfactionService.findByTicket(ticketId!),
    enabled: !!ticketId && !!isResolvedOrClosed,
  });

  const [satisfactionRating, setSatisfactionRating] = useState(0);
  const [satisfactionComment, setSatisfactionComment] = useState('');

  useEffect(() => {
    if (satisfaction) {
      setSatisfactionRating(satisfaction.rating);
      setSatisfactionComment(satisfaction.comment || '');
    } else if (isResolvedOrClosed) {
      setSatisfactionRating(0);
      setSatisfactionComment('');
    }
  }, [satisfaction, isResolvedOrClosed]);

  const satisfactionMutation = useMutation({
    mutationFn: () => satisfactionService.upsert(ticketId!, { rating: satisfactionRating, comment: satisfactionComment || undefined }),
    onSuccess: () => refetchSatisfaction(),
  });

  useEffect(() => {
    if (ticket) {
      setAssigneeId(ticket.assignedTo || '');
      setDeptId(ticket.departmentId || '');
    }
  }, [ticket]);

  const commentMutation = useMutation({
    mutationFn: () => ticketsService.addComment(ticketId!, newComment, isInternal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setNewComment('');
      setIsInternal(false);
    },
  });

  const attachmentMutation = useMutation({
    mutationFn: (file: File) => ticketsService.uploadAttachment(ticketId!, file),
    onSuccess: () => refetchAttachments(),
  });

  const reassignMutation = useMutation({
    mutationFn: () => ticketsService.update(ticketId!, {
      assignedTo: assigneeId || null,
      departmentId: deptId || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (reqId: string) => approvalsService.approve(reqId, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket-approvals', ticketId] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (reqId: string) => approvalsService.reject(reqId, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket-approvals', ticketId] }),
  });

  useEffect(() => {
    if (!modalRef.current?.open) {
      setNewComment('');
      setIsInternal(false);
    }
  }, [ticketId, modalRef]);

  const closeModal = () => {
    onClose?.();
    modalRef.current?.close();
  };

  const isAssignedToMe = ticket?.assignedTo === user?.id;
  const isUnassigned = !ticket?.assignedTo;

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box w-full max-w-4xl p-0 overflow-hidden">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10" onClick={closeModal}>
          ✕
        </button>

        {isLoading || !ticket ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="max-h-[85vh] overflow-y-auto">
            <div className="p-6 pb-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold break-words">{ticket.title}</h2>
                  <p className="text-sm text-base-content/50 mt-0.5">
                    {ticket.protocol} &middot; {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-base-content/70 whitespace-pre-wrap mb-4">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              <div className="lg:col-span-2 space-y-4 p-6 pt-0">
                {/* Reassign */}
                <section>
                  <div className="flex items-center gap-2 font-semibold mb-3 text-sm">
                    <UserCog size={16} />
                    Reatribuição
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs">Responsável</span></label>
                      <select className="select select-bordered select-sm" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                        <option value="">Não atribuído</option>
                        {users?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label py-1"><span className="label-text text-xs">Departamento</span></label>
                      <select className="select select-bordered select-sm" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
                        <option value="">Selecione...</option>
                        {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUnassigned && !isAssignedToMe && (
                      <button
                        className="btn btn-primary btn-xs gap-1"
                        onClick={() => { setAssigneeId(user!.id); reassignMutation.mutate(); }}
                      >
                        Pegar ticket
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-xs gap-1"
                      onClick={() => reassignMutation.mutate()}
                      disabled={reassignMutation.isPending || (assigneeId === (ticket.assignedTo || '') && deptId === (ticket.departmentId || ''))}
                    >
                      {reassignMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar reatribuição'}
                    </button>
                  </div>
                </section>

                {/* Comments */}
                <section>
                  <div className="flex items-center gap-2 font-semibold mb-3 text-sm">
                    <MessageSquare size={16} />
                    Comentários
                  </div>
                  {(ticket.comments?.length ?? 0) === 0 ? (
                    <p className="text-xs text-base-content/40 mb-3">Nenhum comentário</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {ticket.comments?.map((c) => (
                        <div key={c.id} className={`p-3 rounded-lg text-sm ${c.internal ? 'bg-warning/5 border border-warning/20' : 'bg-base-200'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">{c.user.name}</span>
                            {c.internal && <span className="badge badge-warning badge-xs">Interno</span>}
                            <span className="text-[10px] text-base-content/40 ml-auto">{new Date(c.createdAt).toLocaleString('pt-BR')}</span>
                          </div>
                          <p className="text-xs text-base-content/70">{c.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <textarea className="textarea textarea-bordered text-sm" rows={2} placeholder="Escreva um comentário..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="checkbox checkbox-xs" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                        <span className="text-xs">Interno</span>
                      </label>
                      <button className="btn btn-primary btn-sm" onClick={() => commentMutation.mutate()} disabled={!newComment.trim() || commentMutation.isPending}>
                        {commentMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Comentar'}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Attachments */}
                <section>
                  <div className="flex items-center gap-2 font-semibold mb-3 text-sm">
                    <Paperclip size={16} />
                    Anexos
                  </div>
                  <div className="mb-3">
                    <FileUpload
                      onFileSelect={(file) => attachmentMutation.mutate(file)}
                      accept="*/*"
                      preview={false}
                    />
                  </div>
                  {(!attachments || attachments.length === 0) ? (
                    <p className="text-xs text-base-content/40">Nenhum anexo</p>
                  ) : (
                    <div className="space-y-1">
                      {attachments.map((a) => (
                        <a
                          key={a.id}
                          href={`/api/tickets/${ticketId}/attachments/${a.id}/download`}
                          className="flex items-center gap-2 text-xs text-primary hover:underline p-1.5 rounded hover:bg-base-200"
                        >
                          <Download size={12} />
                          {a.fileName}
                          <span className="text-base-content/30 ml-auto">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </section>

                {/* Satisfaction Survey */}
                {isResolvedOrClosed && (
                  <section>
                    <div className="flex items-center gap-2 font-semibold mb-3 text-sm">
                      <Star size={16} />
                      Avaliação
                    </div>
                    {satisfaction ? (
                      <div className="bg-base-200 rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <StarRating rating={satisfaction.rating} readonly size={22} />
                          <span className="text-xs text-base-content/50">
                            {new Date(satisfaction.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {satisfaction.comment && (
                          <p className="text-xs text-base-content/70">{satisfaction.comment}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-base-200 rounded-lg p-3">
                        <p className="text-xs text-base-content/50 mb-2">Como você avalia o atendimento deste ticket?</p>
                        <StarRating rating={satisfactionRating} onChange={setSatisfactionRating} size={28} />
                        <textarea
                          className="textarea textarea-bordered text-sm mt-2 w-full"
                          rows={2}
                          placeholder="Deixe um comentário (opcional)..."
                          value={satisfactionComment}
                          onChange={(e) => setSatisfactionComment(e.target.value)}
                        />
                        <button
                          className="btn btn-primary btn-sm mt-2 gap-1"
                          onClick={() => satisfactionMutation.mutate()}
                          disabled={satisfactionRating === 0 || satisfactionMutation.isPending}
                        >
                          {satisfactionMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Enviar avaliação'}
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {/* Approvals */}
                {(approvals ?? []).length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 font-semibold mb-3 text-sm">
                      <CheckCircle size={16} />
                      Aprovações
                    </div>
                    <div className="space-y-2">
                      {approvals?.map((req) => {
                        const totalSteps = req.flow?.steps?.length ?? 0;
                        return (
                          <div key={req.id} className="bg-base-200 rounded-lg p-3 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs">{req.flow?.name}</span>
                              <span className={`badge badge-sm ${
                                req.status === 'approved' ? 'badge-success' :
                                req.status === 'rejected' ? 'badge-error' : 'badge-ghost'
                              }`}>{req.status}</span>
                            </div>
                            <p className="text-[10px] text-base-content/40 mb-2">
                              Etapa {req.currentStep}/{totalSteps}
                            </p>
                            {req.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <button className="btn btn-success btn-xs gap-1" onClick={() => approveMutation.mutate(req.id)} disabled={approveMutation.isPending}>
                                  <CheckCircle size={12} /> Aprovar
                                </button>
                                <button className="btn btn-error btn-xs gap-1" onClick={() => rejectMutation.mutate(req.id)} disabled={rejectMutation.isPending}>
                                  <XCircle size={12} /> Rejeitar
                                </button>
                              </div>
                            )}
                            {req.histories && req.histories.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {req.histories.map((h) => (
                                  <p key={h.id} className="text-[10px] text-base-content/50">
                                    {h.action === 'approved' ? 'Aprovado' : 'Rejeitado'} por {h.approvedBy} {h.comments && `— ${h.comments}`}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              <div className="border-t lg:border-t-0 lg:border-l border-base-200 p-6 space-y-4">
                <section>
                  <div className="flex items-center gap-2 font-semibold mb-3 text-sm">
                    <Clock size={16} />
                    Informações
                  </div>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-base-content/50 text-xs">Status</dt>
                      <dd>
                        <span className="badge badge-sm" style={{ backgroundColor: ticket.status?.color ?? '#888', color: '#fff' }}>{ticket.status?.name}</span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-base-content/50 text-xs">Prioridade</dt>
                      <dd className="text-xs font-medium">{ticket.priority?.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-base-content/50 text-xs">Categoria</dt>
                      <dd className="text-xs">{ticket.category?.name || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-base-content/50 text-xs">Solicitante</dt>
                      <dd className="text-xs">{ticket.requester?.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-base-content/50 text-xs">Atribuído</dt>
                      <dd className="text-xs">{ticket.assignee?.name || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-base-content/50 text-xs">Cliente</dt>
                      <dd className="text-xs">{ticket.client?.name || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-base-content/50 text-xs">Beneficiário</dt>
                      <dd className="text-xs">{ticket.onBehalfOf?.name || '-'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-base-content/50 text-xs">Departamento</dt>
                      <dd className="text-xs">{ticket.department?.name || '-'}</dd>
                    </div>
                  </dl>
                </section>

                {isUnassigned && (
                  <button
                    className="btn btn-primary btn-sm w-full gap-1"
                    onClick={() => { setAssigneeId(user!.id); reassignMutation.mutate(); }}
                  >
                    Pegar ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>fechar</button>
      </form>
    </dialog>
  );
}

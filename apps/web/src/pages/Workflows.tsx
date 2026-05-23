import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Workflow, Plus, Trash2, ToggleLeft, ToggleRight, History } from 'lucide-react';
import { workflowService } from '../services/workflow';

const FIELD_OPTIONS = [
  { value: 'statusId', label: 'Status ID' },
  { value: 'priorityId', label: 'Prioridade ID' },
  { value: 'categoryId', label: 'Categoria ID' },
  { value: 'assignedTo', label: 'Responsável ID' },
  { value: 'status_name', label: 'Nome do Status' },
  { value: 'priority_level', label: 'Nível da Prioridade' },
  { value: 'category_name', label: 'Nome da Categoria' },
];

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Igual' },
  { value: 'not_equals', label: 'Diferente' },
  { value: 'contains', label: 'Contém' },
  { value: 'in', label: 'Em (separado por ,)' },
  { value: 'gt', label: 'Maior que' },
  { value: 'lt', label: 'Menor que' },
];

const ACTION_OPTIONS = [
  { value: 'change_status', label: 'Alterar Status' },
  { value: 'change_priority', label: 'Alterar Prioridade' },
  { value: 'assign_user', label: 'Atribuir Usuário' },
  { value: 'add_comment', label: 'Adicionar Comentário' },
  { value: 'send_notification', label: 'Enviar Notificação' },
];

export function Workflows() {
  const queryClient = useQueryClient();
  const createRef = useRef<HTMLDialogElement | null>(null);
  const condRef = useRef<HTMLDialogElement | null>(null);
  const actionRef = useRef<HTMLDialogElement | null>(null);
  const execRef = useRef<HTMLDialogElement | null>(null);

  const [name, setName] = useState('');
  const [condFields, setCondFields] = useState({ workflowId: '', field: '', operator: '', value: '' });
  const [actionFields, setActionFields] = useState({ workflowId: '', actionType: '', payload: '{}' });
  const [executions, setExecutions] = useState<any[]>([]);

  const { data: rules, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: workflowService.findAll,
  });

  const createRule = useMutation({
    mutationFn: () => workflowService.create(name),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workflows'] }); setName(''); createRef.current?.close(); },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => workflowService.update(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const deleteRule = useMutation({
    mutationFn: (id: string) => workflowService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const addCondition = useMutation({
    mutationFn: () => workflowService.addCondition(condFields.workflowId, { field: condFields.field, operator: condFields.operator, value: condFields.value }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workflows'] }); condRef.current?.close(); setCondFields({ workflowId: '', field: '', operator: '', value: '' }); },
  });

  const removeCondition = useMutation({
    mutationFn: (id: string) => workflowService.removeCondition(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  const addAction = useMutation({
    mutationFn: () => workflowService.addAction(actionFields.workflowId, { actionType: actionFields.actionType, payload: actionFields.payload }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workflows'] }); actionRef.current?.close(); setActionFields({ workflowId: '', actionType: '', payload: '{}' }); },
  });

  const removeAction = useMutation({
    mutationFn: (id: string) => workflowService.removeAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });

  async function openExecutions() {
    const data = await workflowService.findExecutions();
    setExecutions(data);
    execRef.current?.showModal();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Workflow size={24} className="text-primary" />
          <h1 className="text-3xl font-bold">Workflows</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm gap-1" onClick={openExecutions}>
            <History size={16} /> Histórico
          </button>
          <button className="btn btn-primary" onClick={() => { setName(''); createRef.current?.showModal(); }}>
            <Plus size={18} /> Nova Regra
          </button>
        </div>
      </div>

      {/* Create Modal */}
      <dialog ref={createRef} className="modal">
        <div className="modal-box max-w-sm">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => createRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">Nova Regra</h3>
          <form onSubmit={(e) => { e.preventDefault(); createRule.mutate(); }} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Nome</span></label>
              <input type="text" className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => createRef.current?.close()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={createRule.isPending}>
                {createRule.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Condition Modal */}
      <dialog ref={condRef} className="modal">
        <div className="modal-box max-w-sm">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => condRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">Adicionar Condição</h3>
          <form onSubmit={(e) => { e.preventDefault(); addCondition.mutate(); }} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Campo</span></label>
              <select className="select select-bordered" value={condFields.field} onChange={(e) => setCondFields({ ...condFields, field: e.target.value })} required>
                <option value="">Selecione</option>
                {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Operador</span></label>
              <select className="select select-bordered" value={condFields.operator} onChange={(e) => setCondFields({ ...condFields, operator: e.target.value })} required>
                <option value="">Selecione</option>
                {OPERATOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Valor</span></label>
              <input type="text" className="input input-bordered" value={condFields.value} onChange={(e) => setCondFields({ ...condFields, value: e.target.value })} required />
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => condRef.current?.close()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={addCondition.isPending}>
                {addCondition.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Action Modal */}
      <dialog ref={actionRef} className="modal">
        <div className="modal-box max-w-lg">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => actionRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">Adicionar Ação</h3>
          <form onSubmit={(e) => { e.preventDefault(); addAction.mutate(); }} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Tipo</span></label>
              <select className="select select-bordered" value={actionFields.actionType} onChange={(e) => {
                const p = e.target.value === 'add_comment' ? '{"comment": "", "userId": ""}' :
                         e.target.value === 'send_notification' ? '{"title": "", "body": "", "userId": ""}' :
                         e.target.value === 'change_status' ? '{"statusId": ""}' :
                         e.target.value === 'change_priority' ? '{"priorityId": ""}' :
                         e.target.value === 'assign_user' ? '{"userId": ""}' : '{}';
                setActionFields({ ...actionFields, actionType: e.target.value, payload: p });
              }} required>
                <option value="">Selecione</option>
                {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Payload (JSON)</span></label>
              <textarea className="textarea textarea-bordered h-28 font-mono text-sm" value={actionFields.payload} onChange={(e) => setActionFields({ ...actionFields, payload: e.target.value })} required />
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => actionRef.current?.close()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={addAction.isPending}>
                {addAction.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Executions Modal */}
      <dialog ref={execRef} className="modal">
        <div className="modal-box max-w-2xl max-h-[85vh] overflow-y-auto">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => execRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-4">Histórico de Execuções</h3>
          {executions.length === 0 ? (
            <p className="text-base-content/50">Nenhuma execução</p>
          ) : (
            <div className="space-y-2">
              {executions.map((ex: any) => (
                <div key={ex.id} className="p-3 bg-base-200 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ex.workflow?.name}</span>
                    <span className="text-xs text-base-content/50">— {new Date(ex.executedAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-xs text-base-content/70 mt-1">Ticket: {ex.ticketId} — Resultado: {ex.result}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </dialog>

      {/* Rules List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : !rules || rules.length === 0 ? (
        <div className="text-center text-base-content/50 py-12 bg-base-100 rounded-box border border-base-200">
          Nenhuma regra de workflow configurada
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rules.map((r) => (
            <div key={r.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Workflow size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{r.name}</h3>
                    <p className="text-xs text-base-content/50">{r._count?.executions ?? 0} execuções</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="btn btn-ghost btn-xs"
                    onClick={() => toggleActive.mutate({ id: r.id, active: !r.active })}>
                    {r.active ? <ToggleRight size={16} className="text-success" /> : <ToggleLeft size={16} />}
                  </button>
                  <button className="btn btn-ghost btn-xs text-error"
                    onClick={() => { if (confirm(`Remover regra "${r.name}"?`)) deleteRule.mutate(r.id); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Conditions */}
              <div className="border-t border-base-200 pt-3 space-y-2">
                <p className="text-xs text-base-content/50 mb-1">Condições ({(r.conditions ?? []).length})</p>
                {(r.conditions ?? []).length === 0 ? (
                  <p className="text-xs text-base-content/30 italic">Nenhuma condição</p>
                ) : (
                  (r.conditions ?? []).map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 p-2 bg-base-200 rounded-lg text-xs">
                      <span className="truncate">{c.field} {c.operator} {c.value}</span>
                      <button className="btn btn-ghost btn-xs text-error p-0 min-h-0 h-5 w-5"
                        onClick={() => removeCondition.mutate(c.id)}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))
                )}
                <button className="btn btn-ghost btn-xs w-full gap-1 mt-1" onClick={() => {
                  setCondFields({ ...condFields, workflowId: r.id });
                  condRef.current?.showModal();
                }}>
                  <Plus size={12} /> Condição
                </button>
              </div>

              {/* Actions */}
              <div className="border-t border-base-200 pt-3 mt-3 space-y-2">
                <p className="text-xs text-base-content/50 mb-1">Ações ({(r.actions ?? []).length})</p>
                {(r.actions ?? []).length === 0 ? (
                  <p className="text-xs text-base-content/30 italic">Nenhuma ação</p>
                ) : (
                  (r.actions ?? []).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 p-2 bg-base-200 rounded-lg text-xs">
                      <span className="truncate">{a.actionType}</span>
                      <button className="btn btn-ghost btn-xs text-error p-0 min-h-0 h-5 w-5"
                        onClick={() => removeAction.mutate(a.id)}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))
                )}
                <button className="btn btn-ghost btn-xs w-full gap-1 mt-1" onClick={() => {
                  setActionFields({ ...actionFields, workflowId: r.id });
                  actionRef.current?.showModal();
                }}>
                  <Plus size={12} /> Ação
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

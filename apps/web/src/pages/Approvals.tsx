import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { approvalsService } from '../services/approvals';

export function Approvals() {
  const queryClient = useQueryClient();
  const flowRef = useRef<HTMLDialogElement | null>(null);
  const [flowName, setFlowName] = useState('');
  const [stepApprover, setStepApprover] = useState('');

  const { data: flows, isLoading } = useQuery({
    queryKey: ['approval-flows'],
    queryFn: approvalsService.findAllFlows,
  });

  const createFlow = useMutation({
    mutationFn: () => approvalsService.createFlow({ name: flowName, entityType: 'ticket' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-flows'] });
      setFlowName('');
      flowRef.current?.close();
    },
  });

  const deleteFlow = useMutation({
    mutationFn: (id: string) => approvalsService.removeFlow(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-flows'] }),
  });

  const addStep = useMutation({
    mutationFn: ({ flowId }: { flowId: string }) =>
      approvalsService.addStep(flowId, { stepOrder: 1, approverType: stepApprover }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['approval-flows'] });
      setStepApprover('');
      const dialog = document.getElementById(`step-modal-${vars.flowId}`) as HTMLDialogElement;
      dialog?.close();
    },
  });

  const removeStep = useMutation({
    mutationFn: ({ flowId, stepId }: { flowId: string; stepId: string }) =>
      approvalsService.removeStep(flowId, stepId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-flows'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList size={24} className="text-primary" />
          <h1 className="text-3xl font-bold">Aprovações</h1>
        </div>
        <button className="btn btn-primary" onClick={() => flowRef.current?.showModal()}>
          <Plus size={18} />
          Novo Fluxo
        </button>
      </div>

      <dialog ref={flowRef} className="modal">
        <div className="modal-box max-w-md">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => flowRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">Novo Fluxo de Aprovação</h3>
          <form onSubmit={(e) => { e.preventDefault(); createFlow.mutate(); }} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Nome</span></label>
              <input type="text" className="input input-bordered" value={flowName} onChange={(e) => setFlowName(e.target.value)} required />
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => flowRef.current?.close()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={createFlow.isPending}>
                {createFlow.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {isLoading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : !flows || flows.length === 0 ? (
        <div className="text-center text-base-content/50 py-12 bg-base-100 rounded-box border border-base-200">
          Nenhum fluxo de aprovação configurado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {flows.map((flow) => (
            <div key={flow.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ClipboardList size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{flow.name}</h3>
                    <p className="text-xs text-base-content/50">{flow.entityType}</p>
                  </div>
                </div>
                <button className="btn btn-ghost btn-xs text-error shrink-0"
                  onClick={() => { if (confirm(`Remover fluxo "${flow.name}"?`)) deleteFlow.mutate(flow.id); }}>
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="border-t border-base-200 pt-3 space-y-2">
                <p className="text-xs text-base-content/50 mb-1">
                  Etapas ({(flow.steps ?? []).length})
                </p>
                {(flow.steps ?? []).length === 0 ? (
                  <p className="text-xs text-base-content/30 italic">Nenhuma etapa</p>
                ) : (
                  (flow.steps ?? []).map((step) => (
                    <div key={step.id} className="flex items-center justify-between gap-2 p-2 bg-base-200 rounded-lg text-sm">
                      <span>#{step.stepOrder} — {step.approverType}</span>
                      <button className="btn btn-ghost btn-xs text-error"
                        onClick={() => removeStep.mutate({ flowId: flow.id, stepId: step.id })}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
                <button className="btn btn-ghost btn-xs w-full gap-1 mt-1" onClick={() => {
                  const d = document.getElementById(`step-modal-${flow.id}`) as HTMLDialogElement;
                  d?.showModal();
                }}>
                  <Plus size={12} /> Adicionar Etapa
                </button>
              </div>

              <dialog id={`step-modal-${flow.id}`} className="modal">
                <div className="modal-box max-w-sm">
                  <h3 className="font-bold text-lg mb-4">Adicionar Etapa — {flow.name}</h3>
                  <form onSubmit={(e) => { e.preventDefault(); addStep.mutate({ flowId: flow.id }); }} className="space-y-4">
                    <div className="form-control">
                      <label className="label"><span className="label-text">Aprovador (role ou user:id)</span></label>
                      <input type="text" className="input input-bordered" value={stepApprover} onChange={(e) => setStepApprover(e.target.value)} placeholder="role:supervisor" required />
                    </div>
                    <div className="modal-action">
                      <button type="button" className="btn btn-ghost" onClick={() => {
                        const d = document.getElementById(`step-modal-${flow.id}`) as HTMLDialogElement;
                        d?.close();
                      }}>Cancelar</button>
                      <button type="submit" className="btn btn-primary" disabled={addStep.isPending}>
                        {addStep.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Adicionar'}
                      </button>
                    </div>
                  </form>
                </div>
              </dialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

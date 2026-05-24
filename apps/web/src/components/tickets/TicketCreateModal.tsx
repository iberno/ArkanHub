import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from '../../services/tickets';
import { departmentsService } from '../../services/departments';
import { clientsService } from '../../services/clients';
import { useAuthStore } from '../../store/auth';
import { api } from '../../services/api';
import { FileUpload } from '../ui/FileUpload';
import { assetsService } from '../../services/assets';
import { FormInput, FormSelect, FormTextarea } from '../ui/forms';
import type { TicketStatus, TicketPriority, Category } from '../../types/api';

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
  const [parentCat, setParentCat] = useState('');
  const [subCatId, setSubCatId] = useState('');
  const [clientId, setClientId] = useState('');
  const [onBehalfOfId, setOnBehalfOfId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const { data: statuses } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => api.get<TicketStatus[]>('/ticket-statuses').then((r) => r.data),
  });

  const { data: priorities } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => api.get<TicketPriority[]>('/ticket-priorities').then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories').then((r) => r.data),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.findAll(),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsService.findAll(),
  });

  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetsService.findAll(),
  });

  useEffect(() => {
    if (statuses && !statusId) {
      const aberto = statuses.find(s => s.name === 'Aberto');
      if (aberto) setStatusId(aberto.id);
    }
  }, [statuses]);

  useEffect(() => {
    if (priorities && !priorityId) {
      const media = priorities.find(p => p.name === 'Média');
      if (media) setPriorityId(media.id);
    }
  }, [priorities]);

  const rootCategories = categories?.filter(c => !c.parentId) ?? [];
  const subCategories = parentCat ? categories?.filter(c => c.parentId === parentCat) ?? [] : [];
  const hasChildren = subCategories.length > 0;
  const categoryId = hasChildren ? subCatId : parentCat;

  const mutation = useMutation({
    mutationFn: async () => {
      const ticket = await ticketsService.create({
        title, description, requesterId: user!.id, statusId, priorityId,
        categoryId: categoryId || undefined,
        clientId: clientId || undefined,
        onBehalfOfId: onBehalfOfId || undefined,
        departmentId: departmentId || undefined,
        assetIds: assetIds.length > 0 ? assetIds : undefined,
      });
      if (attachmentFile) {
        await ticketsService.uploadAttachment(ticket.id, attachmentFile);
      }
      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      closeModal();
    },
  });

  const closeModal = () => {
    setTitle(''); setDescription(''); setStatusId(''); setPriorityId('');
    setParentCat(''); setSubCatId('');
    setClientId(''); setOnBehalfOfId(''); setDepartmentId('');
    setAssetIds([]); setAttachmentFile(null);
    modalRef.current?.close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box w-full max-w-xl">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>✕</button>
        </form>
        <h3 className="font-bold text-lg mb-6">Novo Ticket</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Título" value={title} onChange={setTitle}
            placeholder="Ex: Não consigo acessar o sistema" required />

          <FormTextarea label="Descrição" value={description} onChange={setDescription}
            placeholder="Descreva detalhadamente o problema ou solicitação..." required />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect label="Status" value={statusId} onChange={setStatusId} required
              options={statuses?.map((s) => ({ value: s.id, label: s.name })) ?? []} />
            <FormSelect label="Prioridade" value={priorityId} onChange={setPriorityId} required
              options={priorities?.map((p) => ({ value: p.id, label: p.name })) ?? []} />
            <div className="form-control">
              <label className="label"><span className="label-text">Categoria</span></label>
              <select className="select select-bordered" value={parentCat}
                onChange={(e) => { setParentCat(e.target.value); setSubCatId(''); }}>
                <option value="">Selecione...</option>
                {rootCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {hasChildren && (
              <FormSelect label="Subcategoria" value={subCatId} onChange={setSubCatId} required
                options={subCategories.map((c) => ({ value: c.id, label: c.name }))} />
            )}
            <FormSelect label="Cliente solicitante" value={clientId} onChange={setClientId}
              options={clients?.map((c) => ({ value: c.id, label: `${c.name}${c.company ? ` (${c.company.name})` : ''}` })) ?? []} />
            <FormSelect label="Beneficiário" value={onBehalfOfId} onChange={setOnBehalfOfId}
              options={[
                { value: '', label: 'Ninguém (solicitação própria)' },
                ...(clients?.filter(c => c.id !== clientId).map((c) => ({ value: c.id, label: c.name })) ?? []),
              ]} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect label="Departamento" value={departmentId} onChange={setDepartmentId}
              options={departments?.map((d) => ({ value: d.id, label: `${d.name}${d.company ? ` (${d.company.name})` : ''}` })) ?? []} />
            <div className="form-control">
              <label className="label"><span className="label-text">Ativos vinculados</span></label>
              <div className="max-h-32 overflow-y-auto border border-base-300 rounded-lg p-2 space-y-1">
                {assets?.length === 0 && <p className="text-xs text-base-content/50">Nenhum ativo cadastrado</p>}
                {assets?.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer hover:bg-base-200 rounded px-1">
                    <input type="checkbox" className="checkbox checkbox-xs" checked={assetIds.includes(a.id)}
                      onChange={(e) => setAssetIds(e.target.checked ? [...assetIds, a.id] : assetIds.filter((id) => id !== a.id))} />
                    <span className="text-xs"><span className="font-mono text-[10px] opacity-60">{a.tag}</span> {a.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Anexo</span></label>
              <FileUpload onFileSelect={(f) => setAttachmentFile(f)} accept="*/*" preview={false} />
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

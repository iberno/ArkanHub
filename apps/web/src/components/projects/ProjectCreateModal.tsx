import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../../services/projects';
import { usersService } from '../../services/users';
import { useAuthStore } from '../../store/auth';
import { FormInput, FormSelect, FormTextarea } from '../ui/forms';

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>;
}

export function ProjectCreateModal({ modalRef }: Props) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [priority, setPriority] = useState('Média');
  const [startDate, setStartDate] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.findAll(),
  });

  useEffect(() => {
    if (users && !managerId) {
      setManagerId(user?.id ?? '');
    }
  }, [users]);

  const mutation = useMutation({
    mutationFn: () => projectsService.create({
      name,
      description: description || undefined,
      managerId,
      priority,
      startDate: startDate || undefined,
      targetEndDate: targetEndDate || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeModal();
    },
  });

  const closeModal = () => {
    setName(''); setDescription(''); setManagerId(''); setPriority('Média');
    setStartDate(''); setTargetEndDate('');
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
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>✕</button>
        </form>
        <h3 className="font-bold text-lg mb-6">Novo Projeto</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Nome" value={name} onChange={setName}
            placeholder="Ex: Migração de servidores" required />

          <FormTextarea label="Descrição" value={description} onChange={setDescription}
            placeholder="Descreva o objetivo do projeto..." />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect label="Gerente" value={managerId} onChange={setManagerId} required
              options={users?.filter((u) => u.active).map((u) => ({ value: u.id, label: u.name })) ?? []} />
            <FormSelect label="Prioridade" value={priority} onChange={setPriority}
              options={[
                { value: 'Baixa', label: 'Baixa' },
                { value: 'Média', label: 'Média' },
                { value: 'Alta', label: 'Alta' },
                { value: 'Crítica', label: 'Crítica' },
              ]} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Data de início</span></label>
              <input type="date" className="input input-bordered" value={startDate}
                onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Previsão de término</span></label>
              <input type="date" className="input input-bordered" value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)} />
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar Projeto'}
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

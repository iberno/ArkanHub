import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/users';
import { companiesService } from '../../services/companies';
import { departmentsService } from '../../services/departments';
import type { Company } from '../../types/api';

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>;
}

export function UserCreateModal({ modalRef }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [active, setActive] = useState(true);

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesService.findAll(),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', companyId],
    queryFn: () => departmentsService.findAll(companyId || undefined),
    enabled: !!companyId,
  });

  const mutation = useMutation({
    mutationFn: () => usersService.create({
      name, email, password,
      phone: phone || undefined,
      position: position || undefined,
      companyId: companyId || undefined,
      departmentId: departmentId || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
  });

  const closeModal = () => {
    setName(''); setEmail(''); setPassword('');
    setPhone(''); setPosition(''); setCompanyId(''); setDepartmentId('');
    setActive(true);
    modalRef.current?.close();
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box w-full max-w-lg">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
          ✕
        </button>
        <h3 className="font-bold text-lg mb-6">Novo Usuário</h3>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Nome</span></label>
              <input type="text" className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" className="input input-bordered" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Senha</span></label>
              <input type="password" className="input input-bordered" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Telefone</span></label>
              <input type="text" className="input input-bordered" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Cargo</span></label>
              <input type="text" className="input input-bordered" placeholder="Analista de TI" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Empresa</span></label>
              <select className="select select-bordered" value={companyId} onChange={(e) => { setCompanyId(e.target.value); setDepartmentId(''); }}>
                <option value="">Selecione...</option>
                {companies?.filter((c: Company) => c.active !== false).map((c: Company) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Departamento</span></label>
              <select className="select select-bordered" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} disabled={!companyId}>
                <option value="">Selecione...</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Status</span></label>
              <select className="select select-bordered" value={active ? 'true' : 'false'} onChange={(e) => setActive(e.target.value === 'true')}>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar'}
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

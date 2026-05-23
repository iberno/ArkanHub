import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/users';

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>;
}

export function UserCreateModal({ modalRef }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => usersService.create({ name, email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
  });

  const closeModal = () => {
    setName('');
    setEmail('');
    setPassword('');
    modalRef.current?.close();
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box w-full max-w-md">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
          ✕
        </button>
        <h3 className="font-bold text-lg mb-6">Novo Usuário</h3>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Nome</span></label>
            <input type="text" className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Email</span></label>
            <input type="email" className="input input-bordered" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Senha</span></label>
            <input type="password" className="input input-bordered" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
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

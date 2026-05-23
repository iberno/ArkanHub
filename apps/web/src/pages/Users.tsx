import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users';

export function Users() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.findAll,
  });

  const createMutation = useMutation({
    mutationFn: () => usersService.create({ name, email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setName('');
      setEmail('');
      setPassword('');
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Usuários</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Novo Usuário'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6 mb-6 space-y-4 max-w-lg">
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
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm border border-base-200">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Criado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(!users || users.length === 0) ? (
                <tr>
                  <td colSpan={5} className="text-center text-base-content/50 py-8">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover">
                    <td>{u.name}</td>
                    <td className="text-sm">{u.email}</td>
                    <td>
                      <span className={`badge badge-sm ${u.active ? 'badge-success' : 'badge-ghost'}`}>
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/60">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => { if (confirm('Remover usuário?')) deleteMutation.mutate(u.id); }}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

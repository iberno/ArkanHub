import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCircle, Save } from 'lucide-react';
import { usersService } from '../services/users';
import { FileUpload } from '../components/ui/FileUpload';
import { useAuthStore } from '../store/auth';

export function Profile() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [password, setPassword] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersService.me(),
    enabled: !!user,
  });

  useState(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone || '');
      setPosition(profile.position || '');
    }
  });

  const updateMutation = useMutation({
    mutationFn: () => usersService.update(user!.id, {
      name, email,
      phone: phone || null,
      position: position || null,
      ...(password ? { password } : {}),
    } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setPassword('');
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => usersService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <UserCircle size={28} className="text-primary" />
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
      </div>

      <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6 space-y-6">
        <div className="flex flex-col items-center gap-4">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle size={48} className="text-primary" />
            </div>
          )}
          <div className="w-64">
            <FileUpload
              onFileSelect={(file) => avatarMutation.mutate(file)}
              currentUrl={profile?.avatarUrl}
            />
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-4">
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
              <label className="label"><span className="label-text">Telefone</span></label>
              <input type="text" className="input input-bordered" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Cargo</span></label>
              <input type="text" className="input input-bordered" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Nova senha <span className="text-base-content/40">(deixe vazio para manter)</span></span></label>
            <input type="password" className="input input-bordered" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
          </div>

          {profile && (
            <div className="flex items-center gap-4 text-sm text-base-content/50 pt-2">
              <span>Empresa: {profile.company?.name || '-'}</span>
              <span>Departamento: {profile.department?.name || '-'}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary gap-2" disabled={updateMutation.isPending}>
              <Save size={16} />
              {updateMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

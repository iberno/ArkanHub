import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { useAuthStore } from '../store/auth';
import { getDefaultRoute } from '../config/navigation';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      setAuth(data);
      navigate(getDefaultRoute(data.user.roles));
    } catch {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm">
        <div className="card-body">
          <div className="text-center mb-6">
            <Link to="/landing" className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-content font-bold text-xl mx-auto mb-3">
              A
            </Link>
            <h2 className="text-2xl font-bold">ArkanHub</h2>
            <p className="text-base-content/60 text-sm mt-1">
              Plataforma de gerenciamento de tickets
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error mb-4 py-2 text-sm">{error}</div>
            )}

            <div className="form-control mb-4">
              <label className="label py-1">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                placeholder="admin@arkanhub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control mb-6">
              <label className="label py-1">
                <span className="label-text">Senha</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner" /> : 'Entrar'}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link to="/landing" className="link link-hover text-xs text-base-content/40">&larr; Voltar para a página inicial</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

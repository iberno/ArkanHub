export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-4">Alka ITSM</h2>
          <form>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" className="input input-bordered" placeholder="email@exemplo.com" />
            </div>
            <div className="form-control mb-6">
              <label className="label"><span className="label-text">Senha</span></label>
              <input type="password" className="input input-bordered" placeholder="••••••" />
            </div>
            <button type="submit" className="btn btn-primary w-full">Entrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

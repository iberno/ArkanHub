export function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat bg-base-100 rounded-box shadow-sm">
          <div className="stat-title">Tickets Abertos</div>
          <div className="stat-value text-primary">0</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow-sm">
          <div className="stat-title">Críticos</div>
          <div className="stat-value text-error">0</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow-sm">
          <div className="stat-title">SLA Violados</div>
          <div className="stat-value text-warning">0</div>
        </div>
      </div>
    </div>
  );
}

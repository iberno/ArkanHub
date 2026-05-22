export function Slas() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SLAs</h1>
        <button className="btn btn-primary">Novo SLA</button>
      </div>
      <div className="bg-base-100 rounded-box shadow-sm p-6">
        <p className="text-base-content/50">Nenhum SLA configurado</p>
      </div>
    </div>
  );
}

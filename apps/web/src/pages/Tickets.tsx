import { Link } from 'react-router-dom';

export function Tickets() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Link to="/tickets/new" className="btn btn-primary">Novo Ticket</Link>
      </div>
      <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm">
        <table className="table">
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Título</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center text-base-content/50 py-8">
                Nenhum ticket encontrado
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

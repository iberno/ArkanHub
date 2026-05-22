import { useParams, Link } from 'react-router-dom';

export function TicketDetail() {
  const { id } = useParams();

  return (
    <div>
      <div className="mb-4">
        <Link to="/tickets" className="link link-hover text-sm">&larr; Voltar</Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Ticket #{id?.slice(0, 8)}</h1>
      <div className="bg-base-100 rounded-box shadow-sm p-6">
        <p className="text-base-content/50">Carregando...</p>
      </div>
    </div>
  );
}

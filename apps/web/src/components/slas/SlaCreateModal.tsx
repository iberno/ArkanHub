import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { slasService } from '../../services/slas';

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>;
}

export function SlaCreateModal({ modalRef }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [responseTime, setResponseTime] = useState(60);
  const [resolutionTime, setResolutionTime] = useState(480);

  const mutation = useMutation({
    mutationFn: () => slasService.create({ name, responseTime, resolutionTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slas'] });
      closeModal();
    },
  });

  const closeModal = () => {
    setName('');
    setResponseTime(60);
    setResolutionTime(480);
    modalRef.current?.close();
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box w-full max-w-md">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
          ✕
        </button>
        <h3 className="font-bold text-lg mb-6">Novo SLA</h3>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Nome</span></label>
            <input type="text" className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Resposta (min)</span></label>
              <input type="number" className="input input-bordered" value={responseTime} onChange={(e) => setResponseTime(Number(e.target.value))} min={1} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Resolução (min)</span></label>
              <input type="number" className="input input-bordered" value={resolutionTime} onChange={(e) => setResolutionTime(Number(e.target.value))} min={1} required />
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

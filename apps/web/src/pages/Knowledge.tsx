import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Trash2, History, RotateCcw, FileText } from 'lucide-react';
import { knowledgeService } from '../services/knowledge';
import { useAuthStore } from '../store/auth';
import type { KnowledgeArticle, KnowledgeVersion } from '../types/api';

export function Knowledge() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const createRef = useRef<HTMLDialogElement | null>(null);
  const detailRef = useRef<HTMLDialogElement | null>(null);
  const versionRef = useRef<HTMLDialogElement | null>(null);
  const catRef = useRef<HTMLDialogElement | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [articleCat, setArticleCat] = useState('');
  const [catName, setCatName] = useState('');
  const [selected, setSelected] = useState<KnowledgeArticle | null>(null);
  const [versions, setVersions] = useState<KnowledgeVersion[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['knowledge-articles', catFilter],
    queryFn: () => knowledgeService.findAllArticles(catFilter || undefined),
  });

  const { data: categories } = useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: knowledgeService.findAllCategories,
  });

  const createArticle = useMutation({
    mutationFn: () => knowledgeService.createArticle({ title, content, categoryId: articleCat || undefined, authorId: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      setTitle(''); setContent(''); setArticleCat(''); setEditId(null);
      createRef.current?.close();
    },
  });

  const updateArticle = useMutation({
    mutationFn: () => knowledgeService.updateArticle(editId!, { title, content, categoryId: articleCat || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      setTitle(''); setContent(''); setArticleCat(''); setEditId(null);
      createRef.current?.close();
    },
  });

  const deleteArticle = useMutation({
    mutationFn: (id: string) => knowledgeService.removeArticle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] }),
  });

  const createCat = useMutation({
    mutationFn: () => knowledgeService.createCategory(catName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-categories'] });
      setCatName(''); catRef.current?.close();
    },
  });

  const deleteCat = useMutation({
    mutationFn: (id: string) => knowledgeService.removeCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge-categories'] }),
  });

  const restoreVersion = useMutation({
    mutationFn: ({ articleId, versionId }: { articleId: string; versionId: string }) =>
      knowledgeService.restoreVersion(articleId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      versionRef.current?.close();
    },
  });

  function openCreate() {
    setEditId(null); setTitle(''); setContent(''); setArticleCat('');
    createRef.current?.showModal();
  }

  function openEdit(a: KnowledgeArticle) {
    setEditId(a.id); setTitle(a.title); setContent(a.content); setArticleCat(a.categoryId || '');
    createRef.current?.showModal();
  }

  async function openDetail(a: KnowledgeArticle) {
    const full = await knowledgeService.findArticle(a.id);
    setSelected(full);
    detailRef.current?.showModal();
  }

  async function openVersions(a: KnowledgeArticle) {
    const v = await knowledgeService.findVersions(a.id);
    setVersions(v);
    versionRef.current?.showModal();
  }

  const isPending = createArticle.isPending || updateArticle.isPending;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BookOpen size={24} className="text-primary" />
          <h1 className="text-3xl font-bold">Base de Conhecimento</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => catRef.current?.showModal()}>
            <Plus size={16} /> Categoria
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Novo Artigo
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className={`btn btn-xs ${!catFilter ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCatFilter('')}>
          Todas
        </button>
        {(categories ?? []).map((c) => (
          <div key={c.id} className="flex items-center gap-1">
            <button
              className={`btn btn-xs ${catFilter === c.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCatFilter(c.id)}
            >
              {c.name} ({c._count?.articles ?? 0})
            </button>
            <button className="btn btn-ghost btn-xs text-error p-0 min-h-0 h-5 w-5"
              onClick={() => { if (confirm(`Remover categoria "${c.name}"?`)) deleteCat.mutate(c.id); }}>
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>

      {/* New Category Modal */}
      <dialog ref={catRef} className="modal">
        <div className="modal-box max-w-sm">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => catRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">Nova Categoria</h3>
          <form onSubmit={(e) => { e.preventDefault(); createCat.mutate(); }} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Nome</span></label>
              <input type="text" className="input input-bordered" value={catName} onChange={(e) => setCatName(e.target.value)} required />
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => catRef.current?.close()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={createCat.isPending}>
                {createCat.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Create/Edit Modal */}
      <dialog ref={createRef} className="modal">
        <div className="modal-box max-w-2xl">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => createRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">{editId ? 'Editar' : 'Novo'} Artigo</h3>
          <form onSubmit={(e) => { e.preventDefault(); editId ? updateArticle.mutate() : createArticle.mutate(); }} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Título</span></label>
              <input type="text" className="input input-bordered" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Categoria</span></label>
              <select className="select select-bordered" value={articleCat} onChange={(e) => setArticleCat(e.target.value)}>
                <option value="">Sem categoria</option>
                {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Conteúdo</span></label>
              <textarea className="textarea textarea-bordered h-60 font-mono text-sm" value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => createRef.current?.close()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? <span className="loading loading-spinner loading-xs" /> : editId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Article List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : !articles || articles.length === 0 ? (
        <div className="text-center text-base-content/50 py-12 bg-base-100 rounded-box border border-base-200">
          Nenhum artigo encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {articles.map((a) => (
            <div key={a.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-5 flex flex-col">
              <div className="flex items-start gap-3 min-w-0 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <button className="font-semibold truncate block text-left hover:text-primary transition-colors w-full"
                    onClick={() => openDetail(a)}>
                    {a.title}
                  </button>
                  <p className="text-xs text-base-content/50 mt-0.5">
                    {a.category?.name ?? 'Sem categoria'} &middot; {a.author?.name}
                  </p>
                </div>
              </div>
              <p className="text-sm text-base-content/70 line-clamp-3 flex-1">{a.content}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-base-200">
                <button className="btn btn-ghost btn-xs" onClick={() => openVersions(a)}>
                  <History size={12} /> Versões
                </button>
                <button className="btn btn-ghost btn-xs ml-auto" onClick={() => openEdit(a)}>Editar</button>
                <button className="btn btn-ghost btn-xs text-error"
                  onClick={() => { if (confirm(`Remover "${a.title}"?`)) deleteArticle.mutate(a.id); }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <dialog ref={detailRef} className="modal">
        <div className="modal-box max-w-3xl max-h-[85vh] overflow-y-auto">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => detailRef.current?.close()}>✕</button>
          {selected && (
            <>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen size={24} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold">{selected.title}</h2>
                  <p className="text-sm text-base-content/50 mt-1">
                    {selected.category?.name ?? 'Sem categoria'} &middot; {selected.author?.name} &middot; {new Date(selected.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="border-t border-base-200 pt-4">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">{selected.content}</div>
              </div>
              {selected.versions && selected.versions.length > 0 && (
                <div className="border-t border-base-200 mt-4 pt-4">
                  <h4 className="font-semibold text-sm mb-2">Histórico de versões</h4>
                  <div className="space-y-1">
                    {selected.versions.slice(0, 5).map((v) => (
                      <div key={v.id} className="flex items-center justify-between text-sm p-2 bg-base-200 rounded-lg">
                        <span>v{v.version} — {new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </dialog>

      {/* Versions Modal */}
      <dialog ref={versionRef} className="modal">
        <div className="modal-box max-w-lg">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => versionRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-4">Versões</h3>
          {versions.length === 0 ? (
            <p className="text-base-content/50">Nenhuma versão anterior</p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2 p-3 bg-base-200 rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">v{v.version}</p>
                    <p className="text-xs text-base-content/50">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <button className="btn btn-ghost btn-xs gap-1"
                    onClick={() => restoreVersion.mutate({ articleId: v.articleId, versionId: v.id })}>
                    <RotateCcw size={12} /> Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}

import { Link } from 'react-router-dom';
import {
  TicketCheck, FolderKanban, BarChart3, Brain, MessageSquareText,
  Shield, Server, Users, GitBranch, Clock, ChevronRight, Star,
} from 'lucide-react';

const features = [
  {
    icon: TicketCheck, title: 'Service Desk',
    desc: 'Gestão completa de tickets com SLA inteligente, aprovações multietapas e fluxos de trabalho automatizados.',
  },
  {
    icon: FolderKanban, title: 'Gestão de Projetos',
    desc: 'Módulo PMI completo com Kanban, riscos, stakeholders, marcos e integração total com tickets.',
  },
  {
    icon: Server, title: 'CMDB — Ativos',
    desc: 'Inventário de ativos de TI com categorias hierárquicas, garantia e vinculação a tickets.',
  },
  {
    icon: Brain, title: 'Classificação por IA',
    desc: 'Categorização automática de tickets usando NLP, sugerindo categoria e prioridade.',
  },
  {
    icon: MessageSquareText, title: 'Chatbot Inteligente',
    desc: 'Assistente virtual para criação de tickets, consultas e pesquisa na base de conhecimento.',
  },
  {
    icon: BarChart3, title: 'BI & Relatórios',
    desc: 'Dashboard com MTTR, MTTA, SLA, satisfação, tendências e desempenho por departamento.',
  },
  {
    icon: Shield, title: 'Segurança e Controle',
    desc: 'RBAC com 8 papéis e 22+ permissões, autenticação JWT + refresh token, auditoria completa.',
  },
  {
    icon: GitBranch, title: 'Problemas e Mudanças',
    desc: 'Gestão de problemas com RCA, erros conhecidos e mudanças com aprovação CAB.',
  },
  {
    icon: Users, title: 'Multi-empresa',
    desc: 'Suporte a múltiplas empresas com departamentos, gerentes e clientes isolados por tenant.',
  },
  {
    icon: Clock, title: 'SLA com Horário Comercial',
    desc: 'Cálculo automático de SLA respeitando dias úteis e horário comercial, com auto-close.',
  },
  {
    icon: Star, title: 'Pesquisa de Satisfação',
    desc: 'Avaliação de atendimento com NPS, auto-fechamento por nota e relatórios de satisfação.',
  },
  {
    icon: FolderKanban, title: 'Base de Conhecimento',
    desc: 'Artigos com versionamento, categorias, restauração de versões anteriores e busca全文.',
  },
];

const stats = [
  { value: '100%', label: 'Customizável' },
  { value: '8', label: 'Papéis de Acesso' },
  { value: '22+', label: 'Permissões Granulares' },
  { value: 'Open', label: 'Source' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-base-200">
      {/* ── Navbar ───────────────────────────────────────────── */}
      <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content font-bold text-sm">
              A
            </div>
            <span className="font-bold text-lg">ArkanHub</span>
          </div>
        </div>
        <div className="navbar-end gap-2">
          <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
          <Link to="/login" className="btn btn-primary btn-sm">Começar</Link>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="hero bg-base-100 border-b border-base-200">
        <div className="hero-content text-center py-24 md:py-32 max-w-4xl">
          <div className="max-w-2xl mx-auto">
            <div className="badge badge-primary badge-outline mb-4">v1.0 — ITSM + PMI</div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Plataforma Completa de{' '}
              <span className="text-primary">Service Desk</span>
            </h1>
            <p className="text-lg md:text-xl text-base-content/60 mt-6 leading-relaxed">
              Tickets, Projetos, Ativos, BI, IA e Chatbot em um único sistema.
              Open source, multi-empresa e pronto para o seu negócio.
            </p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Link to="/login" className="btn btn-primary btn-lg gap-2">
                Acessar o Sistema <ChevronRight size={18} />
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">Conheça mais</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="bg-base-100 border-b border-base-200 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-base-content/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-16 md:py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">Tudo que você precisa</h2>
          <p className="text-base-content/60 mt-3 max-w-xl mx-auto">
            Do atendimento ao cliente à gestão de projetos, o ArkanHub unifica
            sua operação de TI em uma plataforma só.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((f) => (
            <div key={f.title} className="card bg-base-100 border border-base-200 hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="card-title text-base">{f.title}</h3>
                <p className="text-sm text-base-content/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-content">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Pronto para começar?</h2>
          <p className="text-lg text-primary-content/80 mt-4 max-w-lg mx-auto">
            Acesse o sistema agora e descubra como o ArkanHub pode transformar
            a gestão de TI da sua empresa.
          </p>
          <Link to="/login" className="btn btn-lg bg-white text-primary hover:bg-base-200 mt-8 gap-2">
            Acessar Agora <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-base-300 text-base-content/60 text-sm py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-content font-bold text-[10px]">A</div>
            <span className="font-semibold text-base-content">ArkanHub</span>
          </div>
          <p>&copy; {new Date().getFullYear()} ArkanHub. Open source sob licença MIT.</p>
          <div className="flex items-center gap-4">
            <span>ITSM + PMI</span>
            <span>v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

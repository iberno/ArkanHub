import {
  LayoutDashboard, Ticket, Users, Building2, Building, UserPlus, Tags,
  Clock, ClipboardList, BookOpen, Workflow, BarChart3,
  AlertTriangle, GitPullRequest, Monitor, Archive, FolderKanban,
} from 'lucide-react';
import type { FC } from 'react';

export interface NavItem {
  label: string;
  path: string;
  icon: FC<{ size?: number }>;
  requiredPermission?: string;
}

export interface NavCategory {
  title?: string;
  items: NavItem[];
}

export const navCategories: NavCategory[] = [
  {
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Atendimento',
    items: [
      { label: 'Tickets', path: '/tickets', icon: Ticket, requiredPermission: 'ticket.create' },
      { label: 'Tickets Fechados', path: '/tickets/closed', icon: Archive, requiredPermission: 'ticket.create' },
      { label: 'Clientes', path: '/clients', icon: UserPlus, requiredPermission: 'ticket.create' },
    ],
  },
  {
    title: 'Ativos',
    items: [
      { label: 'Ativos', path: '/assets', icon: Monitor, requiredPermission: 'ticket.create' },
    ],
  },
  {
    title: 'Projetos',
    items: [
      { label: 'Projetos', path: '/projects', icon: FolderKanban, requiredPermission: 'project.manage' },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Categorias', path: '/categories', icon: Tags },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Usuários', path: '/users', icon: Users, requiredPermission: 'user.create' },
      { label: 'Empresas', path: '/companies', icon: Building2, requiredPermission: 'user.create' },
      { label: 'Departamentos', path: '/departments', icon: Building, requiredPermission: 'user.create' },
      { label: 'SLAs', path: '/slas', icon: Clock, requiredPermission: 'sla.manage' },
      { label: 'Workflows', path: '/workflows', icon: Workflow, requiredPermission: 'workflow.manage' },
    ],
  },
  {
    title: 'Processos',
    items: [
      { label: 'Aprovações', path: '/approvals', icon: ClipboardList, requiredPermission: 'approval.manage' },
      { label: 'Conhecimento', path: '/knowledge', icon: BookOpen, requiredPermission: 'knowledge.manage' },
      { label: 'Problemas', path: '/problems', icon: AlertTriangle, requiredPermission: 'ticket.create' },
      { label: 'Mudanças', path: '/changes', icon: GitPullRequest, requiredPermission: 'change.approve' },
    ],
  },
  {
    title: 'Relatórios',
    items: [
      { label: 'BI & Relatórios', path: '/reports', icon: BarChart3, requiredPermission: 'report.view' },
    ],
  },
];

export const roleDefaultRoutes: Record<string, string> = {
  admin: '/',
  supervisor: '/tickets',
  technician: '/tickets',
  requester: '/tickets',
  gestor: '/approvals',
  gestor_ti: '/tickets',
  coord_access: '/tickets',
  coord_projetos: '/changes',
};

export function getDefaultRoute(roles: string[]): string {
  for (const role of roles) {
    if (roleDefaultRoutes[role]) return roleDefaultRoutes[role];
  }
  return '/tickets';
}

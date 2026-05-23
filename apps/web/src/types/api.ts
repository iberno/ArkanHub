export interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  roles?: { role: Pick<Role, 'id' | 'name'> }[];
}

export interface Ticket {
  id: string;
  protocol: string;
  title: string;
  description: string;
  requesterId: string;
  assignedTo?: string;
  statusId: string;
  priorityId: string;
  categoryId?: string;
  slaId?: string;
  openedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  requester?: Pick<User, 'id' | 'name' | 'email'>;
  assignee?: Pick<User, 'id' | 'name' | 'email'>;
  comments?: TicketComment[];
}

export interface TicketStatus {
  id: string;
  name: string;
  color: string;
}

export interface TicketPriority {
  id: string;
  name: string;
  level: number;
}

export interface TicketCategory {
  id: string;
  name: string;
  parentId?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  comment: string;
  internal: boolean;
  createdAt: string;
  user: Pick<User, 'id' | 'name'>;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: { permission: Permission }[];
  users?: { user: Pick<User, 'id' | 'name' | 'email'> }[];
}

export interface Permission {
  id: string;
  key: string;
  description?: string;
}

export interface Sla {
  id: string;
  name: string;
  responseTime: number;
  resolutionTime: number;
  rules?: SlaRule[];
}

export interface SlaRule {
  id: string;
  slaId: string;
  priority: string;
  impact: string;
}

export interface ApprovalFlow {
  id: string;
  name: string;
  entityType: string;
  createdAt: string;
  steps?: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  flowId: string;
  stepOrder: number;
  approverType: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  ticketId: string;
  flowId: string;
  status: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  flow?: ApprovalFlow;
  histories?: ApprovalHistory[];
}

export interface ApprovalHistory {
  id: string;
  requestId: string;
  stepOrder: number;
  approvedBy: string;
  action: string;
  comments?: string;
  createdAt: string;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  _count?: { articles: number };
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  category?: KnowledgeCategory;
  author?: Pick<User, 'id' | 'name'>;
  versions?: KnowledgeVersion[];
}

export interface KnowledgeVersion {
  id: string;
  articleId: string;
  content: string;
  version: number;
  createdAt: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  conditions?: WorkflowCondition[];
  actions?: WorkflowAction[];
  _count?: { executions: number };
}

export interface WorkflowCondition {
  id: string;
  workflowId: string;
  field: string;
  operator: string;
  value: string;
}

export interface WorkflowAction {
  id: string;
  workflowId: string;
  actionType: string;
  payload: string;
}

export interface BiOverview {
  total: number;
  abertos: number;
  emAndamento: number;
  aguardando: number;
  resolvidos: number;
  fechados: number;
  backlog: number;
  criticos: number;
  mttr: number | null;
  mtta: number | null;
  slaCompliance: number | null;
}

export interface BiDistribution {
  byStatus: { name: string; count: number }[];
  byPriority: { name: string; count: number }[];
  byCategory: { name: string; count: number }[];
}

export interface BiTrend {
  date: string;
  created: number;
  resolved: number;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  status: string;
  impact?: string;
  urgency?: string;
  priority?: string;
  rootCause?: string;
  solution?: string;
  workaround?: string;
  category?: string;
  detectedAt: string;
  resolvedAt?: string;
  reporterId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: Pick<User, 'id' | 'name' | 'email'>;
  assignee?: Pick<User, 'id' | 'name' | 'email'>;
  tickets?: { id: string; protocol: string; title: string; status: { name: string; color: string } }[];
  knownErrors?: KnownError[];
  _count?: { tickets: number; knownErrors: number };
}

export interface KnownError {
  id: string;
  problemId?: string;
  title: string;
  description: string;
  workaround?: string;
  createdAt: string;
  problem?: Pick<Problem, 'id' | 'title'>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  ticketId: string;
  result: string;
  executedAt: string;
  workflow?: Pick<WorkflowRule, 'id' | 'name'>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string };
}

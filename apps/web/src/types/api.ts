export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  avatarUrl?: string;
  active: boolean;
  companyId?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt?: string;
  company?: Pick<Company, 'id' | 'name'>;
  department?: Pick<Department, 'id' | 'name'>;
  roles?: { role: Pick<Role, 'id' | 'name'> }[];
}

export interface Company {
  id: string;
  name: string;
  document?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  departments?: Department[];
  _count?: { departments: number; clients: number; users: number };
}

export interface Department {
  id: string;
  name: string;
  companyId: string;
  managerId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Pick<Company, 'id' | 'name'>;
  manager?: Pick<User, 'id' | 'name' | 'email'>;
  _count?: { users: number; clients: number; tickets: number };
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyId: string;
  departmentId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Pick<Company, 'id' | 'name'>;
  department?: Pick<Department, 'id' | 'name'>;
  _count?: { tickets: number };
}

export interface Ticket {
  id: string;
  protocol: string;
  title: string;
  description: string;
  requesterId: string;
  assignedTo?: string;
  clientId?: string;
  onBehalfOfId?: string;
  departmentId?: string;
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
  client?: Pick<Client, 'id' | 'name' | 'email'>;
  onBehalfOf?: Pick<Client, 'id' | 'name' | 'email'>;
  department?: Pick<Department, 'id' | 'name'>;
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

export interface Change {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority?: string;
  riskLevel?: string;
  impact?: string;
  justification?: string;
  implementationPlan?: string;
  rollbackPlan?: string;
  testPlan?: string;
  scheduledAt?: string;
  implementedAt?: string;
  closedAt?: string;
  requesterId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  requester?: Pick<User, 'id' | 'name' | 'email'>;
  assignee?: Pick<User, 'id' | 'name' | 'email'>;
  approvals?: ChangeApproval[];
  _count?: { approvals: number };
}

export interface ChangeApproval {
  id: string;
  changeId: string;
  approvedBy: string;
  role: string;
  status: string;
  comments?: string;
  createdAt: string;
  approver?: Pick<User, 'id' | 'name' | 'email'>;
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

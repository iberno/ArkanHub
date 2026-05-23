export interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
}

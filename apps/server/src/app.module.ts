import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SlaModule } from './modules/sla/sla.module';
import { AuditModule } from './modules/audit/audit.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { BiModule } from './modules/bi/bi.module';
import { ProblemsModule } from './modules/problems/problems.module';
import { ChangesModule } from './modules/changes/changes.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ClientsModule } from './modules/clients/clients.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TicketCategoriesModule } from './modules/ticket-categories/ticket-categories.module';

import { SatisfactionModule } from './modules/satisfaction/satisfaction.module';
import { AiModule } from './modules/ai/ai.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 30,
    }]),
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    TicketsModule,
    RolesModule,
    PermissionsModule,
    SlaModule,
    AuditModule,
    ApprovalsModule,
    KnowledgeModule,
    BiModule,
    ProblemsModule,
    ChangesModule,
    CompaniesModule,
    DepartmentsModule,
    ClientsModule,
    WorkflowModule,
    NotificationsModule,
    WebsocketModule,
    TicketCategoriesModule,
    SatisfactionModule,
    AiModule,
    AssetsModule,
    ProjectsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

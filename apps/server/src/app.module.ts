import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SlaModule } from './modules/sla/sla.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    TicketsModule,
    RolesModule,
    PermissionsModule,
    SlaModule,
    AuditModule,
  ],
})
export class AppModule {}

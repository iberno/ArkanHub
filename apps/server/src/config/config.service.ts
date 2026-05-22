import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'arkanhub-secret-dev';
  }

  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '15m';
  }

  get jwtRefreshExpiresIn(): string {
    return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  get databaseUrl(): string {
    return (
      process.env.DATABASE_URL ||
      'postgresql://iberno:postgres@localhost:5432/arkanhub'
    );
  }

  get port(): number {
    return Number(process.env.PORT) || 3000;
  }
}

import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { Public } from '@infra/http/decorators/public.decorator';
import { PrismaService } from '@infra/database/prisma/prisma.service';

interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
    };
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthCheckResponse> {
    const timestamp = new Date().toISOString();
    let databaseStatus: 'up' | 'down' = 'down';
    let databaseResponseTime: number | undefined;

    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      databaseResponseTime = Date.now() - startTime;
      databaseStatus = 'up';
    } catch (error) {
      databaseStatus = 'down';
    }

    const overallStatus = databaseStatus === 'up' ? 'ok' : 'error';

    return {
      status: overallStatus,
      timestamp,
      services: {
        database: {
          status: databaseStatus,
          ...(databaseResponseTime !== undefined && {
            responseTime: databaseResponseTime,
          }),
        },
      },
    };
  }
}

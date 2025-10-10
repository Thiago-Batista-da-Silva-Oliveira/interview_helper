# STEP 4 - Rate Limiting, Segurança e Otimizações

## Objetivo
Implementar **rate limiting** para proteger a API contra abuso e spam, além de adicionar otimizações de performance, segurança e monitoramento.

> **NOTA IMPORTANTE:** Este step foca em melhorias de **produção**, **performance** e **segurança**. A lógica de negócio (STEP2) e camada HTTP (STEP3) já estão completas.

---

## ✅ Já Implementado (STEP1, STEP2, STEP3)

**Funcionalidades Core:**
- ✅ Sistema de autenticação JWT completo
- ✅ 6 Use cases de entrevistas com IA
- ✅ 7 rotas REST documentadas
- ✅ Validação de inputs com class-validator
- ✅ Exception filters e error handling
- ✅ Logging estruturado
- ✅ Health check endpoint

---

## 📋 Tarefas (STEP4)

### 4.1 - Rate Limiting Global e por Rota ⭐ PRIORITÁRIO

#### 4.1.1 - Instalar Dependências

- [ ] Instalar `@nestjs/throttler`:
  ```bash
  npm install @nestjs/throttler
  ```

#### 4.1.2 - Configurar Throttler Module

- [ ] Criar `src/infra/http/config/throttler.config.ts`:
  ```typescript
  import { ThrottlerModuleOptions } from '@nestjs/throttler';

  export const throttlerConfig: ThrottlerModuleOptions = {
    throttlers: [
      {
        name: 'default',
        ttl: 60000, // 1 minuto em ms
        limit: 100, // 100 requests por minuto (global)
      },
    ],
  };
  ```

- [ ] Atualizar `src/app.module.ts`:
  ```typescript
  import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
  import { APP_GUARD } from '@nestjs/core';
  import { throttlerConfig } from '@infra/http/config/throttler.config';

  @Module({
    imports: [
      ThrottlerModule.forRoot(throttlerConfig),
      // ... outros imports
    ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      },
      // ... outros providers
    ],
  })
  export class AppModule {}
  ```

#### 4.1.3 - Rate Limits Customizados por Rota

- [ ] Criar arquivo de configuração `src/infra/http/config/rate-limits.ts`:
  ```typescript
  export const RATE_LIMITS = {
    // Autenticação - mais restritivo
    AUTH_LOGIN: {
      ttl: 60000, // 1 minuto
      limit: 5, // 5 tentativas de login por minuto
    },
    AUTH_REGISTER: {
      ttl: 3600000, // 1 hora
      limit: 3, // 3 registros por hora
    },

    // Entrevistas
    CREATE_INTERVIEW: {
      ttl: 3600000, // 1 hora
      limit: 10, // 10 entrevistas por hora
    },
    SEND_MESSAGE: {
      ttl: 60000, // 1 minuto
      limit: 30, // 30 mensagens por minuto (conversa rápida)
    },
    COMPLETE_INTERVIEW: {
      ttl: 60000, // 1 minuto
      limit: 5, // 5 finalizações por minuto
    },

    // Consultas - menos restritivo
    LIST_INTERVIEWS: {
      ttl: 60000, // 1 minuto
      limit: 60, // 60 listagens por minuto
    },
    GET_INTERVIEW: {
      ttl: 60000, // 1 minuto
      limit: 60, // 60 consultas por minuto
    },
  };
  ```

- [ ] Aplicar rate limits customizados no `AuthController`:
  ```typescript
  import { Throttle, SkipThrottle } from '@nestjs/throttler';
  import { RATE_LIMITS } from '@infra/http/config/rate-limits';

  @Controller('auth')
  export class AuthController {
    @Public()
    @Post('register')
    @Throttle({ default: RATE_LIMITS.AUTH_REGISTER })
    async register(@Body() dto: RegisterUserDto) { ... }

    @Public()
    @Post('login')
    @Throttle({ default: RATE_LIMITS.AUTH_LOGIN })
    async login(@Body() dto: LoginUserDto) { ... }

    @Get('me')
    @SkipThrottle() // Não aplicar rate limit (já tem global)
    async me(@CurrentUser() user: UserResponseDto) { ... }
  }
  ```

- [ ] Aplicar rate limits customizados no `InterviewController`:
  ```typescript
  import { Throttle } from '@nestjs/throttler';
  import { RATE_LIMITS } from '@infra/http/config/rate-limits';

  @Controller('interviews')
  export class InterviewController {
    @Post()
    @Throttle({ default: RATE_LIMITS.CREATE_INTERVIEW })
    async create(...) { ... }

    @Post(':id/messages')
    @Throttle({ default: RATE_LIMITS.SEND_MESSAGE })
    async sendMessage(...) { ... }

    @Post(':id/complete')
    @Throttle({ default: RATE_LIMITS.COMPLETE_INTERVIEW })
    async complete(...) { ... }

    @Get(':id')
    @Throttle({ default: RATE_LIMITS.GET_INTERVIEW })
    async findOne(...) { ... }

    @Get()
    @Throttle({ default: RATE_LIMITS.LIST_INTERVIEWS })
    async findAll(...) { ... }
  }
  ```

- [ ] Aplicar no `HealthController`:
  ```typescript
  @Controller('health')
  export class HealthController {
    @Public()
    @SkipThrottle() // Health check não deve ter rate limit
    @Get()
    async check() { ... }
  }
  ```

#### 4.1.4 - Custom Throttler Exception Filter

- [ ] Criar `src/infra/http/filters/throttler-exception.filter.ts`:
  ```typescript
  import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
  import { ThrottlerException } from '@nestjs/throttler';
  import { Response } from 'express';

  @Catch(ThrottlerException)
  export class ThrottlerExceptionFilter implements ExceptionFilter {
    catch(exception: ThrottlerException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      response.status(429).json({
        statusCode: 429,
        message: 'Muitas requisições. Tente novamente em alguns instantes.',
        error: 'Too Many Requests',
        timestamp: new Date().toISOString(),
        path: request.url,
        retryAfter: '60s', // Informar quando pode tentar novamente
      });
    }
  }
  ```

- [ ] Registrar no `HttpModule`:
  ```typescript
  import { APP_FILTER } from '@nestjs/core';
  import { ThrottlerExceptionFilter } from './filters/throttler-exception.filter';

  providers: [
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
  ]
  ```

---

### 4.2 - Rate Limiting com Storage Externo (Redis) - OPCIONAL

> **Importante:** Por padrão, o ThrottlerModule usa memória local. Para ambientes com múltiplas instâncias (load balancer), use Redis.

#### 4.2.1 - Instalar Dependências

- [ ] Instalar pacotes Redis:
  ```bash
  npm install @nestjs/throttler-storage-redis ioredis
  npm install -D @types/ioredis
  ```

#### 4.2.2 - Configurar Redis Storage

- [ ] Atualizar `.env`:
  ```bash
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=
  ```

- [ ] Criar `src/infra/http/config/throttler-redis.config.ts`:
  ```typescript
  import { ThrottlerModuleOptions } from '@nestjs/throttler';
  import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';
  import Redis from 'ioredis';

  export const throttlerRedisConfig: ThrottlerModuleOptions = {
    throttlers: [
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ],
    storage: new ThrottlerStorageRedisService(
      new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      }),
    ),
  };
  ```

- [ ] Atualizar `app.module.ts` para usar Redis:
  ```typescript
  import { throttlerRedisConfig } from '@infra/http/config/throttler-redis.config';

  @Module({
    imports: [
      ThrottlerModule.forRoot(throttlerRedisConfig),
    ],
  })
  ```

---

### 4.3 - Helmet (Segurança HTTP Headers)

- [ ] Instalar Helmet:
  ```bash
  npm install helmet
  ```

- [ ] Atualizar `src/main.ts`:
  ```typescript
  import helmet from 'helmet';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Helmet - Security headers
    app.use(helmet({
      contentSecurityPolicy: false, // Desabilitar se usar frontend SPA
    }));

    // ... resto da configuração
  }
  ```

---

### 4.4 - Compressão de Respostas (gzip)

- [ ] Instalar compression:
  ```bash
  npm install compression
  npm install -D @types/compression
  ```

- [ ] Atualizar `src/main.ts`:
  ```typescript
  import compression from 'compression';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Compression (gzip)
    app.use(compression());

    // ... resto da configuração
  }
  ```

---

### 4.5 - Request ID (Rastreamento de Requisições)

- [ ] Criar middleware `src/infra/http/middlewares/request-id.middleware.ts`:
  ```typescript
  import { Injectable, NestMiddleware } from '@nestjs/common';
  import { Request, Response, NextFunction } from 'express';
  import { randomUUID } from 'crypto';

  @Injectable()
  export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request & { id?: string }, res: Response, next: NextFunction) {
      const requestId = req.headers['x-request-id'] as string || randomUUID();
      req.id = requestId;
      res.setHeader('X-Request-ID', requestId);
      next();
    }
  }
  ```

- [ ] Aplicar no `HttpModule`:
  ```typescript
  export class HttpModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(RequestIdMiddleware).forRoutes('*');
      // ... outros middlewares
    }
  }
  ```

- [ ] Atualizar `LoggingInterceptor` para incluir Request ID:
  ```typescript
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const requestId = request.id || 'unknown';

    this.logger.log(
      `[${method}] ${url} - User: ${userId} - RequestID: ${requestId}`
    );
  }
  ```

---

### 4.6 - Cache para Listagens (Opcional)

#### 4.6.1 - Cache com Redis

- [ ] Instalar cache-manager:
  ```bash
  npm install @nestjs/cache-manager cache-manager
  npm install cache-manager-redis-store
  npm install -D @types/cache-manager
  ```

- [ ] Criar `src/infra/cache/cache.module.ts`:
  ```typescript
  import { Module } from '@nestjs/common';
  import { CacheModule } from '@nestjs/cache-manager';
  import { redisStore } from 'cache-manager-redis-store';

  @Module({
    imports: [
      CacheModule.registerAsync({
        isGlobal: true,
        useFactory: async () => ({
          store: await redisStore({
            socket: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
            },
          }),
          ttl: 60, // 60 segundos
        }),
      }),
    ],
  })
  export class AppCacheModule {}
  ```

- [ ] Usar cache no `ListUserInterviewsService`:
  ```typescript
  import { CACHE_MANAGER } from '@nestjs/cache-manager';
  import { Cache } from 'cache-manager';

  export class ListUserInterviewsService {
    constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async execute(request: IListUserInterviewsRequest) {
      const cacheKey = `interviews:user:${request.userId}:${JSON.stringify(request)}`;

      // Tentar buscar do cache
      const cached = await this.cacheManager.get<IListInterviewsResult>(cacheKey);
      if (cached) {
        return cached;
      }

      // Buscar do banco
      const result = await this.interviewRepository.findByUserId(...);

      // Salvar no cache (60 segundos)
      await this.cacheManager.set(cacheKey, result, 60);

      return result;
    }
  }
  ```

---

### 4.7 - Database Indexes (Performance)

- [ ] Criar migration para adicionar índices:
  ```bash
  npx prisma migrate dev --name add_performance_indexes
  ```

- [ ] Atualizar `prisma/schema.prisma`:
  ```prisma
  model User {
    id        String   @id @default(cuid())
    email     String   @unique
    createdAt DateTime @default(now())

    @@index([email])
    @@index([createdAt])
    @@map("users")
  }

  model Interview {
    id        String          @id @default(cuid())
    userId    String
    status    InterviewStatus @default(PENDING)
    type      InterviewType   @default(TEXT)
    createdAt DateTime        @default(now())

    @@index([userId, status])
    @@index([userId, type])
    @@index([userId, createdAt])
    @@index([status])
    @@map("interviews")
  }

  model Message {
    id          String   @id @default(cuid())
    interviewId String
    role        MessageRole
    createdAt   DateTime @default(now())

    @@index([interviewId, createdAt])
    @@index([interviewId, role])
    @@map("messages")
  }

  model UserUsage {
    id      String @id @default(cuid())
    userId  String
    month   String

    @@unique([userId, month])
    @@index([userId, month])
    @@map("user_usages")
  }
  ```

---

### 4.8 - Monitoring e Observabilidade

#### 4.8.1 - Métricas com Prometheus (Opcional)

- [ ] Instalar dependências:
  ```bash
  npm install @willsoto/nestjs-prometheus prom-client
  ```

- [ ] Criar `src/infra/monitoring/prometheus.module.ts`:
  ```typescript
  import { Module } from '@nestjs/common';
  import { PrometheusModule } from '@willsoto/nestjs-prometheus';

  @Module({
    imports: [
      PrometheusModule.register({
        path: '/metrics',
        defaultMetrics: {
          enabled: true,
        },
      }),
    ],
  })
  export class MonitoringModule {}
  ```

- [ ] Adicionar métricas customizadas:
  ```typescript
  import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

  providers: [
    makeCounterProvider({
      name: 'interviews_created_total',
      help: 'Total de entrevistas criadas',
      labelNames: ['type', 'plan'],
    }),
    makeHistogramProvider({
      name: 'interview_duration_seconds',
      help: 'Duração das entrevistas em segundos',
      labelNames: ['status'],
      buckets: [30, 60, 120, 300, 600, 1200], // 30s até 20min
    }),
  ]
  ```

#### 4.8.2 - APM com Sentry (Opcional)

- [ ] Instalar Sentry:
  ```bash
  npm install @sentry/node @sentry/profiling-node
  ```

- [ ] Configurar `src/main.ts`:
  ```typescript
  import * as Sentry from '@sentry/node';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
      });
    }

    // ... resto da configuração
  }
  ```

---

### 4.9 - Graceful Shutdown

- [ ] Atualizar `src/main.ts`:
  ```typescript
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // ... configurações

    await app.listen(process.env.PORT ?? 3001);

    // Graceful shutdown
    app.enableShutdownHooks();

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });
  }
  ```

---

### 4.10 - Environment Validation

- [ ] Instalar dependências:
  ```bash
  npm install @nestjs/config joi
  npm install -D @types/joi
  ```

- [ ] Criar `src/config/env.validation.ts`:
  ```typescript
  import * as Joi from 'joi';

  export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(3001),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required().min(32),
    JWT_EXPIRES_IN: Joi.string().default('7d'),
    AI_PROVIDER: Joi.string().valid('openai').default('openai'),
    AI_API_KEY: Joi.string().required(),
    AI_MODEL: Joi.string().default('gpt-4o-mini'),
    AI_MAX_TOKENS: Joi.number().default(2000),
    FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
    REDIS_HOST: Joi.string().optional(),
    REDIS_PORT: Joi.number().optional(),
    SENTRY_DSN: Joi.string().uri().optional(),
  });
  ```

- [ ] Atualizar `app.module.ts`:
  ```typescript
  import { ConfigModule } from '@nestjs/config';
  import { envValidationSchema } from './config/env.validation';

  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        validationSchema: envValidationSchema,
      }),
      // ... outros imports
    ],
  })
  ```

---

### 4.11 - Swagger Documentation (Opcional)

- [ ] Instalar dependências:
  ```bash
  npm install @nestjs/swagger swagger-ui-express
  ```

- [ ] Configurar `src/main.ts`:
  ```typescript
  import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Swagger (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('IA Assistant API')
        .setDescription('API para simulações de entrevistas com IA')
        .setVersion('1.0')
        .addTag('auth', 'Autenticação e registro')
        .addTag('interviews', 'Gerenciamento de entrevistas')
        .addTag('health', 'Monitoramento')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);

      console.log('Swagger disponível em: http://localhost:3001/api/docs');
    }

    await app.listen(process.env.PORT ?? 3001);
  }
  ```

- [ ] Adicionar decorators nos DTOs e Controllers:
  ```typescript
  import { ApiProperty, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

  export class StartInterviewDto {
    @ApiProperty({
      description: 'Descrição do currículo do candidato',
      minLength: 50,
      maxLength: 5000,
      example: 'Desenvolvedor Full Stack com 5 anos...',
    })
    @IsString()
    @MinLength(50)
    resumeDescription: string;
  }

  @ApiTags('interviews')
  @Controller('interviews')
  export class InterviewController {
    @ApiOperation({ summary: 'Criar nova entrevista' })
    @ApiResponse({ status: 201, description: 'Entrevista criada com sucesso' })
    @ApiResponse({ status: 403, description: 'Sem créditos disponíveis' })
    @Post()
    async create(...) { ... }
  }
  ```

---

### 4.12 - Testes E2E com Rate Limiting

- [ ] Criar `test/rate-limiting.e2e-spec.ts`:
  ```typescript
  describe('Rate Limiting E2E', () => {
    it('should block after exceeding login rate limit', async () => {
      const loginDto = { email: 'test@test.com', password: 'wrong' };

      // Tentar logar 6 vezes (limite é 5/min)
      for (let i = 0; i < 6; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto);

        if (i < 5) {
          expect(response.status).toBe(401); // Unauthorized
        } else {
          expect(response.status).toBe(429); // Too Many Requests
          expect(response.body.message).toContain('Muitas requisições');
        }
      }
    });

    it('should allow requests after TTL expires', async () => {
      // ... implementar teste de expiração
    });
  });
  ```

---

## Checklist Final

**Rate Limiting:**
- [ ] ThrottlerModule instalado e configurado
- [ ] Rate limits globais aplicados
- [ ] Rate limits customizados por rota
- [ ] ThrottlerExceptionFilter customizado
- [ ] Redis storage configurado (opcional)
- [ ] Testes E2E de rate limiting

**Segurança:**
- [ ] Helmet configurado (security headers)
- [ ] CORS configurado corretamente
- [ ] Environment validation com Joi
- [ ] Request ID para rastreamento

**Performance:**
- [ ] Compressão gzip habilitada
- [ ] Database indexes criados
- [ ] Cache Redis implementado (opcional)
- [ ] Graceful shutdown configurado

**Monitoramento:**
- [ ] Métricas Prometheus (opcional)
- [ ] APM Sentry (opcional)
- [ ] Logs estruturados com Request ID

**Documentação:**
- [ ] Swagger configurado (opcional)
- [ ] API_GUIDE.md atualizado com rate limits
- [ ] README atualizado

---

## Configurações de Rate Limiting Recomendadas

### Produção

```typescript
const PRODUCTION_LIMITS = {
  GLOBAL: { ttl: 60000, limit: 200 }, // 200 req/min

  AUTH_LOGIN: { ttl: 60000, limit: 3 }, // 3 tentativas/min
  AUTH_REGISTER: { ttl: 3600000, limit: 1 }, // 1 registro/hora

  CREATE_INTERVIEW: { ttl: 3600000, limit: 5 }, // 5/hora
  SEND_MESSAGE: { ttl: 60000, limit: 20 }, // 20 mensagens/min
  COMPLETE_INTERVIEW: { ttl: 60000, limit: 3 }, // 3/min

  LIST_INTERVIEWS: { ttl: 60000, limit: 30 }, // 30/min
  GET_INTERVIEW: { ttl: 60000, limit: 30 }, // 30/min
};
```

### Desenvolvimento

```typescript
const DEVELOPMENT_LIMITS = {
  GLOBAL: { ttl: 60000, limit: 1000 }, // Muito permissivo

  AUTH_LOGIN: { ttl: 60000, limit: 100 },
  AUTH_REGISTER: { ttl: 60000, limit: 100 },

  CREATE_INTERVIEW: { ttl: 60000, limit: 100 },
  SEND_MESSAGE: { ttl: 60000, limit: 100 },
  // ... todos permissivos
};
```

---

## Dependências a Instalar

```bash
# Rate Limiting (obrigatório)
npm install @nestjs/throttler

# Redis Storage (opcional - para múltiplas instâncias)
npm install @nestjs/throttler-storage-redis ioredis
npm install -D @types/ioredis

# Segurança
npm install helmet

# Performance
npm install compression
npm install -D @types/compression

# Cache (opcional)
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
npm install -D @types/cache-manager

# Validação de Env
npm install @nestjs/config joi
npm install -D @types/joi

# Monitoring (opcional)
npm install @willsoto/nestjs-prometheus prom-client
npm install @sentry/node @sentry/profiling-node

# Swagger (opcional)
npm install @nestjs/swagger swagger-ui-express
```

---

## Variáveis de Ambiente (.env)

```bash
# Existing variables...

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Monitoring (opcional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

---

## Próximos Passos Após STEP4

**STEP5 - Testes e Qualidade:**
- Testes unitários para todos os use cases
- Testes E2E completos (70%+ coverage)
- Testes de integração com AI mock
- CI/CD pipeline

**STEP6 - Features Avançadas:**
- Entrevistas por áudio (Speech-to-Text)
- Sistema de pagamentos (Stripe)
- Dashboard analytics
- Modo empresa (múltiplos usuários RH)

**STEP7 - Deploy e Produção:**
- Docker e Docker Compose
- Deploy na AWS/GCP/Vercel
- CI/CD com GitHub Actions
- Monitoring e alertas

---

## Notas Técnicas

- **Rate Limiting Storage:** Use Redis em produção com load balancer
- **Cache:** Apenas para dados que não mudam frequentemente (listagens, consultas)
- **Indexes:** Cruciais para queries com WHERE, ORDER BY, JOIN
- **Monitoring:** Sentry para erros, Prometheus para métricas
- **Swagger:** Desabilitar em produção por segurança

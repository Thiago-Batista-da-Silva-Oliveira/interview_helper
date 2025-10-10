# STEP 3 - Camada HTTP para Entrevistas

## Objetivo
Implementar a **camada de apresentação HTTP** para expor os use cases de entrevistas através de uma API REST completa, com validações, middlewares, exception handling e testes E2E.

> **NOTA IMPORTANTE:** A lógica de negócio (use cases, entidades, repositórios, IA) já foi implementada no STEP2. Este step foca **exclusivamente na camada HTTP/REST**.

---

## ✅ Já Implementado no STEP2

**Lógica de Negócio (Domain + Application Layer):**
- ✅ 6 Use Cases (Start, SendMessage, Complete, GetHistory, List, Cancel)
- ✅ 2 Use Cases de controle de uso (CheckUserUsage, IncrementUserUsage)
- ✅ Entidades (Interview, Message)
- ✅ Repositórios (PrismaInterviewRepository, PrismaMessageRepository)
- ✅ Provider de IA (OpenAIProvider)
- ✅ Prompts do sistema
- ✅ Validações de negócio (ownership, status, créditos)

---

## ✅ STATUS: PARCIALMENTE CONCLUÍDO
**Data de Conclusão Parcial:** 2025-10-09
**Build Status:** ✅ Passou (0 erros)
**Lint Status:** ✅ 52 warnings não-críticos

### 📊 Implementado Neste STEP (17 arquivos criados)

**DTOs de Validação (3 arquivos):**
- ✅ StartInterviewDto.ts (resumeDescription, jobDescription, type)
- ✅ SendMessageDto.ts (content)
- ✅ ListInterviewsQueryDto.ts (status, type, pagination, sorting)

**Presenters (3 arquivos):**
- ✅ InterviewPresenter (toHTTP, toHTTPList)
- ✅ MessagePresenter (toHTTP, toHTTPList)
- ✅ PaginationPresenter (toHTTP com metadata)

**Exception Filters (2 arquivos):**
- ✅ HttpExceptionFilter (captura HttpExceptions, formata respostas)
- ✅ AllExceptionsFilter (captura erros não tratados, 500)

**Pipes (1 arquivo):**
- ✅ ParseUUIDPipe (validação de UUID)

**Interceptors (2 arquivos):**
- ✅ TransformResponseInterceptor (padroniza formato { success, data, timestamp })
- ✅ LoggingInterceptor (registra método, URL, userId, tempo de execução)

**Middlewares (1 arquivo):**
- ✅ CheckInterviewOwnerMiddleware (valida ownership, otimiza req.interview)

**Controllers (2 arquivos):**
- ✅ InterviewController (6 rotas REST completas)
- ✅ HealthController (GET /health com check de database)

**Configuração (2 arquivos):**
- ✅ HttpModule atualizado (controllers, filters, interceptors via APP_* providers)
- ✅ Main.ts configurado (global prefix 'api', ValidationPipe, CORS)

**Dependências Instaladas:**
- ✅ Nenhuma adicional (todas já estavam instaladas)

### 🎯 Rotas Disponíveis

Todas as rotas têm prefixo `/api`:

1. **POST /api/interviews** - Criar nova entrevista
2. **POST /api/interviews/:id/messages** - Enviar mensagem
3. **POST /api/interviews/:id/complete** - Finalizar entrevista
4. **GET /api/interviews/:id** - Buscar entrevista com histórico
5. **GET /api/interviews** - Listar entrevistas (com filtros e paginação)
6. **PATCH /api/interviews/:id/cancel** - Cancelar entrevista
7. **GET /api/health** - Health check (público, sem autenticação)

### 🔒 Segurança e Validação

- ✅ JWT Auth Guard aplicado globalmente
- ✅ @Public() decorator para rotas públicas (health)
- ✅ ValidationPipe global (whitelist, forbidNonWhitelisted, transform)
- ✅ CheckInterviewOwnerMiddleware nas rotas sensíveis
- ✅ ParseUUIDPipe para validação de IDs
- ✅ Exception filters para respostas de erro padronizadas

### 📝 Pendente

**Testes E2E (prioritário):**
- [ ] Criar test/interview.e2e-spec.ts
- [ ] Testar todas as 7 rotas (happy paths + error cases)
- [ ] Validar autenticação, ownership, validações

**Opcional:**
- [ ] Rate limiting (ThrottlerModule)
- [ ] Swagger documentation
- [ ] Postman collection

---

## Tarefas (Camada HTTP)

### 3.1 - DTOs de Validação HTTP ✅
> DTOs para validar requisições HTTP usando `class-validator`

- [x] Criar `src/infra/http/dtos/interview/StartInterviewDto.ts`
  ```typescript
  - resumeDescription: string (required, minLength: 50, maxLength: 5000)
  - jobDescription: string (required, minLength: 50, maxLength: 5000)
  - type: enum InterviewType (optional, default: TEXT)
  - Validações: @IsString(), @MinLength(), @MaxLength(), @IsEnum(), @IsNotEmpty()
  ```

- [x] Criar `src/infra/http/dtos/interview/SendMessageDto.ts`
  ```typescript
  - content: string (required, minLength: 1, maxLength: 2000)
  - Validações: @IsString(), @MinLength(), @MaxLength(), @IsNotEmpty()
  ```

- [x] Criar `src/infra/http/dtos/interview/ListInterviewsQueryDto.ts`
  ```typescript
  - status: enum InterviewStatus (optional)
  - type: enum InterviewType (optional)
  - page: number (optional, default: 1, min: 1)
  - limit: number (optional, default: 10, min: 1, max: 50)
  - sortBy: string (optional, default: 'createdAt')
  - sortOrder: 'asc' | 'desc' (optional, default: 'desc')
  - Validações: @IsOptional(), @IsEnum(), @IsInt(), @Min(), @Max()
  ```

- [ ] Criar `src/infra/http/dtos/interview/UpdateInterviewDto.ts` (se necessário)

---

### 3.2 - Presenters (Response Formatters) ✅
> Formatadores para transformar entidades de domínio em responses HTTP

- [x] Criar `src/infra/http/presenters/interview.presenter.ts`
  ```typescript
  export class InterviewPresenter {
    static toHTTP(interview: Interview): InterviewResponse
    static toHTTPList(interviews: Interview[]): InterviewListResponse
  }
  - Formatar datas para ISO 8601
  - Ocultar campos sensíveis (se houver)
  - Estrutura limpa e consistente
  ```

- [x] Criar `src/infra/http/presenters/message.presenter.ts`
  ```typescript
  export class MessagePresenter {
    static toHTTP(message: Message): MessageResponse
    static toHTTPList(messages: Message[]): MessageResponse[]
  }
  - Formatar metadata
  - Formatar datas
  ```

- [x] Criar `src/infra/http/presenters/pagination.presenter.ts`
  ```typescript
  export class PaginationPresenter {
    static toHTTP(data: IListInterviewsResult): PaginationResponse
  }
  - Formatar metadata de paginação
  ```

---

### 3.3 - Exception Filters ✅
> Interceptar exceções e formatar respostas de erro padronizadas

- [x] Criar `src/infra/http/filters/http-exception.filter.ts`
  ```typescript
  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost)
  }
  - Capturar todas as HttpExceptions
  - Retornar formato: { statusCode, message, timestamp, path, error }
  - Incluir stack trace apenas em desenvolvimento
  ```

- [x] Criar `src/infra/http/filters/all-exceptions.filter.ts`
  ```typescript
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter
  - Capturar exceções não tratadas
  - Retornar 500 Internal Server Error
  - Logar erro completo
  ```

- [ ] Criar exceções customizadas (se necessário):
  ```typescript
  - InterviewNotFoundException extends NotFoundException
  - InterviewAlreadyCompletedException extends ConflictException
  - InsufficientCreditsException extends ForbiddenException
  - InvalidInterviewStatusException extends BadRequestException
  ```

- [x] Aplicar filters globalmente via HttpModule providers (APP_FILTER)
  ```typescript
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );
  ```

---

### 3.4 - Pipes de Transformação ✅
> Pipes para validar e transformar dados de entrada

- [x] Criar `src/infra/http/pipes/parse-uuid.pipe.ts`
  ```typescript
  @Injectable()
  export class ParseUUIDPipe implements PipeTransform
  - Validar formato UUID
  - Lançar BadRequestException se inválido
  - Retornar UUID validado
  ```

- [x] Configurar ValidationPipe global no `main.ts`:
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  ```

---

### 3.5 - Interceptors ✅
> Interceptors para transformar responses e adicionar logging

- [x] Criar `src/infra/http/interceptors/transform-response.interceptor.ts`
  ```typescript
  @Injectable()
  export class TransformResponseInterceptor implements NestInterceptor
  - Padronizar formato de resposta de sucesso:
    {
      success: true,
      data: {...},
      timestamp: ISO 8601
    }
  - Aplicar a todas as respostas
  ```

- [x] Criar `src/infra/http/interceptors/logging.interceptor.ts`
  ```typescript
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor
  - Logar: método, URL, userId, status, tempo de execução
  - Usar Logger do NestJS
  - Incluir request ID (se disponível)
  ```

- [x] Aplicar interceptors globalmente via HttpModule providers (APP_INTERCEPTOR)
  ```typescript
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
  );
  ```

---

### 3.6 - Middlewares HTTP ✅
> Middlewares para validações específicas antes dos controllers

- [x] Criar `src/infra/http/middlewares/check-interview-owner.middleware.ts`
  ```typescript
  @Injectable()
  export class CheckInterviewOwnerMiddleware implements NestMiddleware
  - Verificar se interview pertence ao usuário autenticado
  - Buscar interview pelo ID do param
  - Comparar interview.userId com req.user.id
  - Lançar ForbiddenException se não for o dono
  - Anexar interview ao request (req.interview) para otimização
  ```

- [x] Aplicar middleware nas rotas específicas via HttpModule.configure():
  ```typescript
  // No InterviewModule
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckInterviewOwnerMiddleware)
      .forRoutes(
        { path: 'interviews/:id/messages', method: RequestMethod.POST },
        { path: 'interviews/:id/complete', method: RequestMethod.POST },
        { path: 'interviews/:id', method: RequestMethod.GET },
        { path: 'interviews/:id/cancel', method: RequestMethod.PATCH },
      );
  }
  ```

> **NOTA:** Validação de créditos já está implementada dentro do `CheckUserUsageService` chamado pelo `StartInterviewService`, não é necessário middleware HTTP separado.

---

### 3.7 - Interview Controller ✅
> Controller REST para gerenciar entrevistas

- [x] Criar `src/infra/http/controllers/interview.controller.ts`

**Configuração base:**
```typescript
@Controller('interviews')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformResponseInterceptor)
export class InterviewController {
  constructor(
    private startInterviewService: StartInterviewService,
    private sendMessageService: SendMessageService,
    private completeInterviewService: CompleteInterviewService,
    private getInterviewHistoryService: GetInterviewHistoryService,
    private listUserInterviewsService: ListUserInterviewsService,
    private cancelInterviewService: CancelInterviewService,
  ) {}
}
```

**Rotas a implementar:**

- [x] **POST /interviews** - Iniciar nova entrevista
  ```typescript
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: StartInterviewDto,
    @CurrentUser() user: User,
  ): Promise<InterviewResponse>

  - Chamar startInterviewService.execute()
  - Usar InterviewPresenter e MessagePresenter
  - Retornar { interview, firstMessage }
  ```

- [x] **POST /interviews/:id/messages** - Enviar mensagem
  ```typescript
  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('id', ParseUUIDPipe) interviewId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: User,
  ): Promise<MessageExchangeResponse>

  - Chamar sendMessageService.execute()
  - Usar MessagePresenter
  - Retornar { userMessage, assistantMessage }
  ```

- [x] **POST /interviews/:id/complete** - Finalizar entrevista
  ```typescript
  @Post(':id/complete')
  async complete(
    @Param('id', ParseUUIDPipe) interviewId: string,
    @CurrentUser() user: User,
  ): Promise<InterviewResponse>

  - Chamar completeInterviewService.execute()
  - Usar InterviewPresenter
  - Retornar interview com feedback, insights e score
  ```

- [x] **GET /interviews/:id** - Buscar entrevista específica
  ```typescript
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) interviewId: string,
    @CurrentUser() user: User,
  ): Promise<InterviewWithMessagesResponse>

  - Chamar getInterviewHistoryService.execute()
  - Usar InterviewPresenter e MessagePresenter
  - Retornar { interview, messages }
  ```

- [x] **GET /interviews** - Listar entrevistas do usuário
  ```typescript
  @Get()
  async findAll(
    @Query() query: ListInterviewsQueryDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedInterviewsResponse>

  - Chamar listUserInterviewsService.execute()
  - Usar InterviewPresenter e PaginationPresenter
  - Retornar { interviews, metadata }
  ```

- [x] **PATCH /interviews/:id/cancel** - Cancelar entrevista
  ```typescript
  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseUUIDPipe) interviewId: string,
    @CurrentUser() user: User,
  ): Promise<InterviewResponse>

  - Chamar cancelInterviewService.execute()
  - Usar InterviewPresenter
  - Retornar interview atualizada
  ```

---

### 3.8 - Health Check Controller ✅
> Controller para monitoramento de saúde da aplicação

- [x] Criar `src/infra/http/controllers/health.controller.ts`
  ```typescript
  @Controller('health')
  @Public() // Decorator para permitir acesso sem autenticação
  export class HealthController {
    @Get()
    check(): HealthCheckResponse
  }
  ```

- [x] Implementar health checks:
  ```typescript
  - Verificar conexão com banco (Prisma.$queryRaw)
  - Verificar disponibilidade da API de IA (opcional)
  - Retornar status geral: { status: 'ok', timestamp, services: {...} }
  ```

---

### 3.9 - Atualizar HTTP Module ✅
> Registrar controllers e providers no HttpModule

- [x] Atualizar `src/infra/http/http.module.ts`:
  ```typescript
  @Module({
    imports: [UserModule, InterviewModule],
    controllers: [
      AuthController,
      InterviewController,
      HealthController,
    ],
    providers: [
      { provide: APP_GUARD, useClass: JwtAuthGuard },
      { provide: APP_FILTER, useClass: AllExceptionsFilter },
      { provide: APP_FILTER, useClass: HttpExceptionFilter },
      { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
      { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    ],
  })
  export class HttpModule {}
  ```

---

### 3.10 - Testes E2E
> Testes end-to-end para todas as rotas

- [ ] Criar `test/interview.e2e-spec.ts`

**Setup:**
```typescript
beforeAll(async () => {
  // Inicializar app de teste
  // Criar usuário de teste
  // Fazer login e obter token JWT
});

beforeEach(async () => {
  // Limpar banco de dados
});
```

**Testes a implementar:**

- [ ] **POST /interviews**
  - ✅ Sucesso: criar interview com dados válidos
  - ❌ Erro 400: resumeDescription muito curto (<50 chars)
  - ❌ Erro 400: jobDescription muito curto (<50 chars)
  - ❌ Erro 401: sem token de autenticação
  - ❌ Erro 403: sem créditos disponíveis (testar plano FREE)
  - ✅ Sucesso: validar que primeira mensagem da IA foi criada

- [ ] **POST /interviews/:id/messages**
  - ✅ Sucesso: enviar mensagem e receber resposta da IA
  - ❌ Erro 400: UUID inválido
  - ❌ Erro 400: content vazio
  - ❌ Erro 401: sem autenticação
  - ❌ Erro 403: interview não pertence ao usuário
  - ❌ Erro 404: interview não existe
  - ❌ Erro 409: interview já está COMPLETED
  - ❌ Erro 409: interview está CANCELLED

- [ ] **POST /interviews/:id/complete**
  - ✅ Sucesso: finalizar interview e receber feedback
  - ✅ Sucesso: validar que feedback, insights e score foram gerados
  - ✅ Sucesso: validar que status mudou para COMPLETED
  - ❌ Erro 400: UUID inválido
  - ❌ Erro 401: sem autenticação
  - ❌ Erro 403: interview não pertence ao usuário
  - ❌ Erro 404: interview não existe
  - ❌ Erro 409: interview já está COMPLETED

- [ ] **GET /interviews/:id**
  - ✅ Sucesso: buscar interview com histórico completo
  - ✅ Sucesso: validar que todas as mensagens estão presentes
  - ❌ Erro 400: UUID inválido
  - ❌ Erro 401: sem autenticação
  - ❌ Erro 403: interview não pertence ao usuário
  - ❌ Erro 404: interview não existe

- [ ] **GET /interviews**
  - ✅ Sucesso: listar interviews do usuário
  - ✅ Sucesso: filtrar por status (COMPLETED)
  - ✅ Sucesso: filtrar por type (TEXT)
  - ✅ Sucesso: paginação funciona (page=1, limit=10)
  - ✅ Sucesso: ordenação funciona (sortBy=createdAt, sortOrder=desc)
  - ✅ Sucesso: metadata de paginação está correta (total, totalPages)
  - ❌ Erro 401: sem autenticação
  - ✅ Sucesso: lista vazia se não tem interviews

- [ ] **PATCH /interviews/:id/cancel**
  - ✅ Sucesso: cancelar interview IN_PROGRESS
  - ✅ Sucesso: validar que status mudou para CANCELLED
  - ✅ Sucesso: validar que crédito NÃO foi devolvido
  - ❌ Erro 400: UUID inválido
  - ❌ Erro 401: sem autenticação
  - ❌ Erro 403: interview não pertence ao usuário
  - ❌ Erro 404: interview não existe
  - ❌ Erro 409: interview já está COMPLETED

- [ ] **GET /health**
  - ✅ Sucesso: retorna status 200 e { status: 'ok' }
  - ✅ Sucesso: não requer autenticação

---

### 3.11 - Rate Limiting (Opcional)
> Proteger contra spam e abuso

- [ ] Instalar dependência:
  ```bash
  npm install @nestjs/throttler
  ```

- [ ] Configurar `ThrottlerModule` no `app.module.ts`:
  ```typescript
  @Module({
    imports: [
      ThrottlerModule.forRoot({
        ttl: 60, // 1 minuto
        limit: 10, // 10 requests
      }),
    ],
  })
  ```

- [ ] Aplicar throttler específico para rotas de mensagens:
  ```typescript
  @Throttle(10, 60) // 10 mensagens por minuto
  @Post(':id/messages')
  async sendMessage(...)
  ```

---

### 3.12 - Swagger Documentation (Opcional)
> Documentação automática da API

- [ ] Instalar dependências:
  ```bash
  npm install @nestjs/swagger swagger-ui-express
  ```

- [ ] Configurar Swagger no `main.ts`:
  ```typescript
  const config = new DocumentBuilder()
    .setTitle('IA Assistant API')
    .setDescription('API para simulações de entrevistas com IA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  ```

- [ ] Adicionar decorators nos DTOs:
  ```typescript
  export class StartInterviewDto {
    @ApiProperty({
      description: 'Descrição do currículo do candidato',
      minLength: 50,
      maxLength: 5000,
      example: 'Desenvolvedor Full Stack com 5 anos...',
    })
    @IsString()
    @MinLength(50)
    @MaxLength(5000)
    resumeDescription: string;
  }
  ```

- [ ] Adicionar decorators no controller:
  ```typescript
  @ApiTags('interviews')
  @ApiBearerAuth()
  @Controller('interviews')
  export class InterviewController {

    @ApiOperation({ summary: 'Iniciar nova entrevista' })
    @ApiResponse({ status: 201, description: 'Interview criada' })
    @ApiResponse({ status: 403, description: 'Sem créditos' })
    @Post()
    async create(...)
  }
  ```

---

### 3.13 - Configuração do Main.ts ✅
> Configurar aplicação com todos os pipes, filters e interceptors

- [x] Atualizar `src/main.ts`:
  ```typescript
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    });

    // Cookie Parser
    app.use(cookieParser());

    // Global Prefix
    app.setGlobalPrefix('api');

    // Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Exception Filters (já configurados via providers)
    // Interceptors (já configurados via providers)

    await app.listen(process.env.PORT || 3001);
  }
  ```

---

## Checklist Final

**DTOs e Validação:**
- [x] DTOs HTTP criados (Start, SendMessage, List)
- [x] Validações com class-validator configuradas
- [x] ValidationPipe global configurado

**Formatação de Respostas:**
- [x] Presenters criados (Interview, Message, Pagination)
- [x] TransformResponseInterceptor implementado
- [x] Formato padronizado: { success, data, timestamp }

**Error Handling:**
- [x] HttpExceptionFilter implementado
- [x] AllExceptionsFilter implementado
- [ ] Exceções customizadas criadas (não necessário por enquanto)
- [x] Filters aplicados globalmente

**Controllers:**
- [x] InterviewController com 6 rotas implementado
- [x] HealthController implementado
- [x] Todos os use cases integrados

**Middlewares e Guards:**
- [x] CheckInterviewOwnerMiddleware implementado
- [x] JwtAuthGuard aplicado globalmente (já estava desde STEP1)
- [x] @Public() decorator funcionando (já estava desde STEP1)

**Pipes e Interceptors:**
- [x] ParseUUIDPipe implementado
- [x] LoggingInterceptor implementado
- [x] Interceptors aplicados globalmente

**Testes:**
- [ ] Testes E2E para todas as rotas
- [ ] Happy paths testados
- [ ] Error cases testados
- [ ] Cobertura mínima de 80%

**Documentação:**
- [ ] Swagger configurado (opcional)
- [ ] README com exemplos de uso atualizado
- [ ] Postman collection criada (opcional)

**Extras:**
- [ ] Rate limiting configurado (opcional)
- [x] Health check funcionando
- [x] Logs estruturados

---

## Estrutura de Resposta Padronizada

**Sucesso:**
```json
{
  "success": true,
  "data": {
    // ... dados da response
  },
  "timestamp": "2025-10-09T22:30:00.000Z"
}
```

**Erro:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2025-10-09T22:30:00.000Z",
  "path": "/api/interviews"
}
```

---

## Códigos de Status HTTP

| Código | Uso | Exemplo |
|--------|-----|---------|
| 200 | Sucesso (GET, PATCH) | Buscar interview, cancelar |
| 201 | Criado (POST) | Criar interview, enviar mensagem |
| 400 | Bad Request | Dados inválidos, UUID inválido |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Sem créditos, sem permissão |
| 404 | Not Found | Interview não existe |
| 409 | Conflict | Interview já completada |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro no servidor |

---

## Próximos Passos Após STEP3

**Fase de Testes e Qualidade:**
- Testes unitários para use cases
- Mocks do AIProvider
- Aumentar cobertura de testes

**Otimizações:**
- Cache de histórico de mensagens (Redis)
- Compressão de responses (gzip)
- Database indexes

**Features Futuras:**
- Entrevistas por áudio (STEP4)
- Sistema de pagamentos (Stripe)
- Dashboard analytics
- Modo empresa (RH)

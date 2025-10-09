# STEP 3 - Implementação da Entrevista por Texto

## Objetivo
Implementar a interface HTTP completa para entrevistas por texto, incluindo controllers, validações, middlewares e testes E2E.

---

## Tarefas

### 3.1 - Implementar DTOs de Validação
- [ ] Criar `src/infra/http/dtos/StartInterviewDto.ts`
  - resumeDescription (string, required, minLength: 50, maxLength: 5000)
  - jobDescription (string, required, minLength: 50, maxLength: 5000)
  - type (enum: TEXT, default: TEXT)
  - Validar formato e conteúdo

- [ ] Criar `src/infra/http/dtos/SendMessageDto.ts`
  - content (string, required, minLength: 1, maxLength: 2000)
  - Validar caracteres especiais permitidos

- [ ] Criar `src/infra/http/dtos/ListInterviewsQueryDto.ts`
  - status (enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED, optional)
  - type (enum: TEXT, AUDIO, optional)
  - page (number, optional, default: 1, min: 1)
  - limit (number, optional, default: 10, min: 1, max: 50)
  - sortBy (string, optional, default: 'createdAt')
  - sortOrder (enum: ASC, DESC, optional, default: DESC)

- [ ] Criar `src/infra/http/dtos/InterviewResponseDto.ts`
  - Estrutura de resposta padronizada para interviews

### 3.2 - Implementar Controller de Entrevistas
- [ ] Criar `src/infra/http/controllers/interview.controller.ts`
  - Configurar rota base `/interviews`
  - Aplicar guard de autenticação em todas as rotas
  - Aplicar validation pipe global

- [ ] **POST /interviews** - Iniciar nova entrevista
  - Receber StartInterviewDto no body
  - Validar créditos disponíveis
  - Chamar StartInterviewService
  - Retornar interview criada + primeira mensagem da IA
  - Status: 201 Created

- [ ] **POST /interviews/:id/messages** - Enviar mensagem
  - Receber SendMessageDto no body
  - Validar UUID do interviewId
  - Chamar SendMessageService
  - Retornar mensagem do usuário + resposta da IA
  - Status: 201 Created

- [ ] **POST /interviews/:id/complete** - Finalizar entrevista
  - Validar UUID do interviewId
  - Chamar CompleteInterviewService
  - Retornar interview completa com feedback e insights
  - Status: 200 OK

- [ ] **GET /interviews/:id** - Buscar entrevista específica
  - Validar UUID do interviewId
  - Chamar GetInterviewHistoryService
  - Retornar interview com todas as mensagens
  - Status: 200 OK

- [ ] **GET /interviews** - Listar entrevistas do usuário
  - Receber ListInterviewsQueryDto como query params
  - Chamar ListUserInterviewsService
  - Retornar lista paginada de interviews
  - Incluir metadata de paginação (total, pages, current)
  - Status: 200 OK

- [ ] **PATCH /interviews/:id/cancel** - Cancelar entrevista
  - Validar UUID do interviewId
  - Chamar CancelInterviewService
  - Retornar interview atualizada
  - Status: 200 OK

### 3.3 - Implementar Middlewares de Validação
- [ ] Criar `src/infra/http/middlewares/check-interview-credits.middleware.ts`
  - Verificar se usuário tem créditos disponíveis (FREE: 1, PREMIUM: 20)
  - Buscar usage do mês atual
  - Lançar ForbiddenException se não tiver créditos
  - Passar para próximo middleware se tiver créditos

- [ ] Criar `src/infra/http/middlewares/check-interview-owner.middleware.ts`
  - Verificar se interview pertence ao usuário autenticado
  - Lançar ForbiddenException se não for o dono
  - Passar interviewId adiante

- [ ] Aplicar middlewares nas rotas correspondentes
  - check-interview-credits em POST /interviews
  - check-interview-owner em rotas específicas de interview

### 3.4 - Implementar Exception Filters
- [ ] Criar `src/infra/http/filters/http-exception.filter.ts`
  - Capturar exceções HTTP
  - Formatar resposta de erro padronizada
  - Incluir timestamp, path, message, statusCode

- [ ] Criar exceções customizadas:
  - `InterviewNotFoundException`
  - `InterviewAlreadyCompletedException`
  - `InsufficientCreditsException`
  - `InvalidInterviewStatusException`

### 3.5 - Implementar Pipes de Transformação
- [ ] Criar `src/infra/http/pipes/parse-uuid.pipe.ts`
  - Validar formato UUID em params
  - Lançar BadRequestException se inválido

- [ ] Aplicar ParseUUIDPipe em rotas com :id

### 3.6 - Implementar Interceptors
- [ ] Criar `src/infra/http/interceptors/transform-response.interceptor.ts`
  - Padronizar formato de resposta de sucesso
  - Estrutura: { success: true, data: {...}, timestamp: ... }

- [ ] Criar `src/infra/http/interceptors/logging.interceptor.ts`
  - Logar requests e responses
  - Incluir tempo de execução
  - Logar erros com stack trace

### 3.7 - Criar Serviços de Formatação de Resposta
- [ ] Criar `src/infra/http/presenters/interview.presenter.ts`
  - Formatar entidade Interview para response
  - Ocultar campos sensíveis se necessário
  - Formatar datas para ISO 8601

- [ ] Criar `src/infra/http/presenters/message.presenter.ts`
  - Formatar entidade Message para response
  - Incluir metadata formatado

### 3.8 - Implementar Validações de Regras de Negócio
- [ ] Validar que interview está IN_PROGRESS ao enviar mensagem
- [ ] Validar que interview não está CANCELLED ou COMPLETED
- [ ] Validar que usuário não excedeu limite de caracteres
- [ ] Validar que currículo e vaga têm conteúdo relevante (não apenas espaços)

### 3.9 - Implementar Sistema de Rate Limiting (Opcional)
- [ ] Instalar `@nestjs/throttler`
- [ ] Configurar rate limiting para rotas de messages
  - Limite: 10 mensagens por minuto por usuário
  - Proteger contra spam

### 3.10 - Implementar Testes E2E
- [ ] Criar `test/interview.e2e-spec.ts`
  - Setup: criar usuário de teste, fazer login, obter token

- [ ] Testar POST /interviews
  - Sucesso: criar interview com dados válidos
  - Erro: sem créditos disponíveis
  - Erro: dados inválidos (resumeDescription curto)
  - Erro: sem autenticação

- [ ] Testar POST /interviews/:id/messages
  - Sucesso: enviar mensagem e receber resposta da IA
  - Erro: interview não existe
  - Erro: interview não pertence ao usuário
  - Erro: interview já está COMPLETED
  - Erro: mensagem vazia

- [ ] Testar POST /interviews/:id/complete
  - Sucesso: finalizar interview e receber feedback
  - Sucesso: validar que feedback e insights foram gerados
  - Erro: interview já está COMPLETED
  - Erro: interview não pertence ao usuário

- [ ] Testar GET /interviews/:id
  - Sucesso: buscar interview com histórico completo
  - Erro: interview não existe
  - Erro: interview não pertence ao usuário

- [ ] Testar GET /interviews
  - Sucesso: listar interviews do usuário
  - Sucesso: filtrar por status (COMPLETED)
  - Sucesso: paginação funciona corretamente
  - Sucesso: ordenação por data

- [ ] Testar PATCH /interviews/:id/cancel
  - Sucesso: cancelar interview IN_PROGRESS
  - Sucesso: validar que crédito não foi devolvido
  - Erro: interview já está COMPLETED

### 3.11 - Documentação das Rotas
- [ ] Documentar payloads de exemplo para cada rota
- [ ] Documentar responses de sucesso
- [ ] Documentar responses de erro
- [ ] Criar exemplos de uso com cURL/Postman

### 3.12 - Criar Swagger Documentation (Opcional)
- [ ] Instalar `@nestjs/swagger`
- [ ] Adicionar decorators nos DTOs (@ApiProperty)
- [ ] Adicionar decorators no controller (@ApiTags, @ApiOperation)
- [ ] Configurar Swagger module no main.ts
- [ ] Gerar documentação em /api/docs

### 3.13 - Implementar Health Check
- [ ] Criar `src/infra/http/controllers/health.controller.ts`
  - GET /health - Status da aplicação
  - Verificar conexão com banco
  - Verificar conexão com IA provider
  - Retornar status geral

---

## Exemplos de Payloads

### POST /interviews
```json
{
  "resumeDescription": "Desenvolvedor Full Stack com 5 anos de experiência em Node.js, React e TypeScript. Trabalhei em projetos de e-commerce e sistemas bancários...",
  "jobDescription": "Vaga para Desenvolvedor Sênior em empresa de fintech. Requisitos: Node.js, TypeScript, NestJS, PostgreSQL, Docker...",
  "type": "TEXT"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "interview": {
      "id": "uuid-123",
      "userId": "user-uuid",
      "type": "TEXT",
      "status": "IN_PROGRESS",
      "resumeDescription": "...",
      "jobDescription": "...",
      "createdAt": "2025-01-15T10:00:00Z"
    },
    "firstMessage": {
      "id": "msg-uuid-1",
      "role": "ASSISTANT",
      "content": "Olá! Sou seu entrevistador virtual. Analisei seu currículo e a descrição da vaga. Vamos começar?...",
      "createdAt": "2025-01-15T10:00:01Z"
    }
  },
  "timestamp": "2025-01-15T10:00:01Z"
}
```

### POST /interviews/:id/messages
```json
{
  "content": "Sim, estou pronto para começar!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "msg-uuid-2",
      "role": "USER",
      "content": "Sim, estou pronto para começar!",
      "createdAt": "2025-01-15T10:01:00Z"
    },
    "assistantMessage": {
      "id": "msg-uuid-3",
      "role": "ASSISTANT",
      "content": "Ótimo! Vamos começar com uma pergunta sobre sua experiência...",
      "createdAt": "2025-01-15T10:01:02Z"
    }
  },
  "timestamp": "2025-01-15T10:01:02Z"
}
```

### POST /interviews/:id/complete
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interview": {
      "id": "uuid-123",
      "status": "COMPLETED",
      "score": 85,
      "feedback": "Você teve um desempenho muito bom. Pontos fortes: comunicação clara, conhecimento técnico sólido...",
      "insights": "Seu currículo está bem alinhado com a vaga. Sugestões: adicionar mais detalhes sobre projetos com Docker...",
      "completedAt": "2025-01-15T10:30:00Z"
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### GET /interviews?status=COMPLETED&page=1&limit=10
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interviews": [
      {
        "id": "uuid-123",
        "type": "TEXT",
        "status": "COMPLETED",
        "score": 85,
        "createdAt": "2025-01-15T10:00:00Z",
        "completedAt": "2025-01-15T10:30:00Z"
      }
    ],
    "metadata": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  },
  "timestamp": "2025-01-15T11:00:00Z"
}
```

---

## Regras de Validação

### StartInterviewDto
- `resumeDescription`: 50-5000 caracteres, não pode ser apenas espaços
- `jobDescription`: 50-5000 caracteres, não pode ser apenas espaços
- `type`: deve ser enum válido (TEXT ou AUDIO)

### SendMessageDto
- `content`: 1-2000 caracteres, não pode ser vazio ou apenas espaços

### ListInterviewsQueryDto
- `page`: número inteiro, mínimo 1
- `limit`: número inteiro, mínimo 1, máximo 50
- `status`: deve ser enum válido se fornecido
- `type`: deve ser enum válido se fornecido

---

## Códigos de Erro HTTP

| Código | Erro | Descrição |
|--------|------|-----------|
| 400 | Bad Request | Dados de entrada inválidos |
| 401 | Unauthorized | Token JWT inválido ou ausente |
| 403 | Forbidden | Sem créditos ou sem permissão |
| 404 | Not Found | Interview não encontrada |
| 409 | Conflict | Interview já está COMPLETED |
| 422 | Unprocessable Entity | Regra de negócio violada |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro interno do servidor |

---

## Fluxo Completo de Uso (Happy Path)

1. **Usuário se autentica** → Recebe JWT token
2. **POST /interviews** → Cria interview, recebe primeira mensagem da IA
3. **POST /interviews/:id/messages** (múltiplas vezes) → Conversa com IA
4. **POST /interviews/:id/complete** → Finaliza e recebe feedback completo
5. **GET /interviews/:id** → Visualiza histórico completo
6. **GET /interviews** → Lista todas suas entrevistas

---

## Dependências Adicionais

```bash
# Rate limiting (opcional)
npm install @nestjs/throttler

# Swagger documentation (opcional)
npm install @nestjs/swagger swagger-ui-express
```

---

## Checklist Final

- [ ] Todos os controllers implementados
- [ ] Todos os DTOs validados
- [ ] Middlewares de segurança aplicados
- [ ] Exception filters configurados
- [ ] Testes E2E passando
- [ ] Documentação completa
- [ ] Rate limiting configurado
- [ ] Health check funcionando
- [ ] Logs implementados
- [ ] Respostas padronizadas

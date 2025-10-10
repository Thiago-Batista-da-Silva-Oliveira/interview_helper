# Guia de Uso - IA Assistant API

## 🚀 Como Iniciar o Aplicativo

### 1. Configurar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` está configurado:

```bash
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# AI Provider
AI_PROVIDER="openai"
AI_API_KEY="sk-your-openai-api-key"
AI_MODEL="gpt-4o-mini"
AI_MAX_TOKENS="2000"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### 2. Instalar Dependências e Executar Migrations

```bash
# Instalar dependências
npm install

# Executar migrations do Prisma
npx prisma migrate dev

# (Opcional) Visualizar banco de dados
npx prisma studio
```

### 3. Iniciar o Servidor

```bash
# Modo desenvolvimento (com hot reload)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

O servidor estará rodando em: **http://localhost:3001**

---

## 📋 Fluxo Completo de Uso da API

### **PASSO 1: Registrar Novo Usuário**

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "plan": "FREE"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "name": "João Silva",
    "email": "joao@example.com",
    "plan": "FREE",
    "createdAt": "2025-10-09T10:00:00.000Z"
  },
  "timestamp": "2025-10-09T10:00:00.000Z"
}
```

> **Nota:** Planos disponíveis: `FREE` (1 entrevista/mês) ou `PREMIUM` (20 entrevistas/mês)

---

### **PASSO 2: Fazer Login**

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "name": "João Silva",
    "email": "joao@example.com",
    "plan": "FREE"
  },
  "timestamp": "2025-10-09T10:01:00.000Z"
}
```

> **Importante:** O token JWT é retornado via **HTTP-only cookie** chamado `token`. Você não precisa gerenciá-lo manualmente - o navegador fará isso automaticamente.

---

### **PASSO 3: Verificar Autenticação**

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Cookie: token=<jwt-token-do-login>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "name": "João Silva",
    "email": "joao@example.com",
    "plan": "FREE"
  },
  "timestamp": "2025-10-09T10:02:00.000Z"
}
```

---

### **PASSO 4: Criar Nova Entrevista**

**Endpoint:** `POST /api/interviews`

**Headers:**
```
Cookie: token=<jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "resumeDescription": "Desenvolvedor Full Stack com 5 anos de experiência em Node.js, React e TypeScript. Trabalhei em empresas de tecnologia desenvolvendo APIs RESTful, aplicações web responsivas e sistemas de microserviços. Tenho experiência com Docker, Kubernetes e CI/CD. Formado em Ciência da Computação.",
  "jobDescription": "Procuramos um Desenvolvedor Senior Full Stack para liderar projetos de alta complexidade. Requisitos: Node.js, React, TypeScript, arquitetura de microserviços, experiência com cloud (AWS/GCP), liderança técnica. Diferenciais: conhecimento em sistemas distribuídos e alta escalabilidade.",
  "type": "TEXT"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "interview": {
      "id": "clx456...",
      "userId": "clx123...",
      "type": "TEXT",
      "status": "IN_PROGRESS",
      "resumeDescription": "Desenvolvedor Full Stack com 5 anos...",
      "jobDescription": "Procuramos um Desenvolvedor Senior...",
      "feedback": null,
      "insights": null,
      "score": null,
      "startedAt": "2025-10-09T10:03:00.000Z",
      "completedAt": null,
      "createdAt": "2025-10-09T10:03:00.000Z",
      "updatedAt": "2025-10-09T10:03:00.000Z"
    },
    "firstMessage": {
      "id": "clx789...",
      "interviewId": "clx456...",
      "role": "ASSISTANT",
      "content": "Olá! Sou seu entrevistador virtual. Analisei seu currículo e a descrição da vaga. Vamos começar a entrevista! Primeira pergunta: Conte-me sobre sua experiência com arquitetura de microserviços. Quais foram os principais desafios que você enfrentou?",
      "metadata": null,
      "createdAt": "2025-10-09T10:03:05.000Z"
    }
  },
  "timestamp": "2025-10-09T10:03:05.000Z"
}
```

> **Validações:**
> - `resumeDescription` e `jobDescription` devem ter entre 50-5000 caracteres
> - `type` pode ser `TEXT` ou `AUDIO` (padrão: TEXT)
> - Usuário FREE pode criar apenas 1 entrevista de texto por mês
> - Usuário PREMIUM pode criar 20 entrevistas de texto por mês

---

### **PASSO 5: Conversar com a IA (Enviar Mensagens)**

**Endpoint:** `POST /api/interviews/:id/messages`

**Headers:**
```
Cookie: token=<jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "content": "Trabalhei com microserviços em um projeto de e-commerce. Dividimos o monolito em serviços de Pedidos, Pagamento, Inventário e Notificações. O maior desafio foi garantir a consistência de dados entre serviços usando Event Sourcing e SAGA pattern."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "clx999...",
      "interviewId": "clx456...",
      "role": "USER",
      "content": "Trabalhei com microserviços em um projeto...",
      "metadata": null,
      "createdAt": "2025-10-09T10:05:00.000Z"
    },
    "assistantMessage": {
      "id": "clx111...",
      "interviewId": "clx456...",
      "role": "ASSISTANT",
      "content": "Excelente! Event Sourcing e SAGA são padrões avançados. Pode me dar um exemplo específico de como você implementou o SAGA pattern? E como lidou com a compensação de transações em caso de falha?",
      "metadata": null,
      "createdAt": "2025-10-09T10:05:03.000Z"
    }
  },
  "timestamp": "2025-10-09T10:05:03.000Z"
}
```

> **Validações:**
> - `content` deve ter entre 1-2000 caracteres
> - Entrevista deve estar com status `IN_PROGRESS`
> - Apenas o dono da entrevista pode enviar mensagens

**Continue enviando mensagens** até finalizar a conversa (recomendado: 5-10 trocas de mensagens).

---

### **PASSO 6: Finalizar Entrevista e Receber Feedback**

**Endpoint:** `POST /api/interviews/:id/complete`

**Headers:**
```
Cookie: token=<jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx456...",
    "userId": "clx123...",
    "type": "TEXT",
    "status": "COMPLETED",
    "resumeDescription": "Desenvolvedor Full Stack com 5 anos...",
    "jobDescription": "Procuramos um Desenvolvedor Senior...",
    "feedback": "**Pontos Fortes:**\n- Demonstrou conhecimento sólido em microserviços\n- Experiência prática com patterns avançados (SAGA, Event Sourcing)\n- Boa comunicação técnica\n\n**Pontos de Melhoria:**\n- Poderia aprofundar mais em métricas de performance\n- Faltou mencionar experiência com observabilidade\n\n**Análise de Comunicação:**\nRespostas claras e objetivas. Bom uso de exemplos práticos.",
    "insights": "**Análise Currículo vs Vaga:**\n- ✅ Match forte em Node.js, React, TypeScript\n- ✅ Experiência com microserviços alinhada\n- ⚠️ Não mencionou cloud (AWS/GCP) - gap importante\n- ⚠️ Não ficou claro se tem experiência com liderança\n\n**Gaps Identificados:**\n- Conhecimento em cloud providers (AWS/GCP)\n- Experiência com liderança técnica\n- Sistemas de observabilidade\n\n**Recomendações:**\n- Adicionar certificações cloud no currículo\n- Destacar projetos onde liderou tecnicamente\n- Estudar ferramentas: Prometheus, Grafana, ELK Stack",
    "score": 78,
    "startedAt": "2025-10-09T10:03:00.000Z",
    "completedAt": "2025-10-09T10:10:00.000Z",
    "createdAt": "2025-10-09T10:03:00.000Z",
    "updatedAt": "2025-10-09T10:10:00.000Z"
  },
  "timestamp": "2025-10-09T10:10:00.000Z"
}
```

> **Score (0-100):**
> - 0-40: Desempenho fraco
> - 41-60: Desempenho mediano
> - 61-80: Bom desempenho
> - 81-100: Excelente desempenho

---

### **PASSO 7: Consultar Histórico da Entrevista**

**Endpoint:** `GET /api/interviews/:id`

**Headers:**
```
Cookie: token=<jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "interview": {
      "id": "clx456...",
      "status": "COMPLETED",
      "score": 78,
      ...
    },
    "messages": [
      {
        "id": "clx789...",
        "role": "ASSISTANT",
        "content": "Olá! Sou seu entrevistador virtual...",
        "createdAt": "2025-10-09T10:03:05.000Z"
      },
      {
        "id": "clx999...",
        "role": "USER",
        "content": "Trabalhei com microserviços...",
        "createdAt": "2025-10-09T10:05:00.000Z"
      },
      ...
    ]
  },
  "timestamp": "2025-10-09T10:11:00.000Z"
}
```

---

### **PASSO 8: Listar Todas as Entrevistas**

**Endpoint:** `GET /api/interviews?status=COMPLETED&page=1&limit=10&sortOrder=desc`

**Headers:**
```
Cookie: token=<jwt-token>
```

**Query Parameters:**
- `status` (opcional): `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `type` (opcional): `TEXT`, `AUDIO`
- `page` (opcional, padrão: 1)
- `limit` (opcional, padrão: 10, max: 50)
- `sortBy` (opcional, padrão: `createdAt`)
- `sortOrder` (opcional, padrão: `desc`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "interviews": [
      {
        "id": "clx456...",
        "status": "COMPLETED",
        "score": 78,
        "createdAt": "2025-10-09T10:03:00.000Z",
        ...
      }
    ],
    "metadata": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  },
  "timestamp": "2025-10-09T10:12:00.000Z"
}
```

---

### **PASSO 9: Cancelar Entrevista (Opcional)**

**Endpoint:** `PATCH /api/interviews/:id/cancel`

**Headers:**
```
Cookie: token=<jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx456...",
    "status": "CANCELLED",
    ...
  },
  "timestamp": "2025-10-09T10:13:00.000Z"
}
```

> **Nota:** Cancelar uma entrevista **NÃO devolve o crédito** ao usuário.

---

### **PASSO 10: Logout**

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Cookie: token=<jwt-token>
```

**Response:** `204 No Content`

> O cookie `token` será removido automaticamente.

---

## 🔍 Endpoints Extras

### Health Check (Público - Não requer autenticação)

**Endpoint:** `GET /api/health`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-10-09T10:15:00.000Z",
    "services": {
      "database": {
        "status": "up",
        "responseTime": 5
      }
    }
  },
  "timestamp": "2025-10-09T10:15:00.000Z"
}
```

---

## ⚠️ Tratamento de Erros

### Formato de Erro Padrão

```json
{
  "statusCode": 400,
  "message": "Descrição do erro",
  "error": "Bad Request",
  "timestamp": "2025-10-09T10:16:00.000Z",
  "path": "/api/interviews"
}
```

### Códigos de Status HTTP

| Código | Significado | Exemplo |
|--------|-------------|---------|
| 200 | Sucesso (GET, PATCH) | Buscar entrevista |
| 201 | Criado (POST) | Criar entrevista |
| 204 | Sem conteúdo (DELETE, Logout) | Logout |
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | Token ausente/inválido |
| 403 | Forbidden | Sem créditos, sem permissão |
| 404 | Not Found | Entrevista não encontrada |
| 409 | Conflict | Entrevista já completada |
| 500 | Internal Server Error | Erro no servidor |

---

## 🛡️ Segurança

### Autenticação JWT via Cookie

- Token armazenado em **HTTP-only cookie** (não acessível via JavaScript)
- Cookie com flag `Secure` em produção (apenas HTTPS)
- Cookie com `SameSite: strict` (proteção contra CSRF)
- Validade: 7 dias

### Validações

- **Input Validation:** class-validator em todos os DTOs
- **UUID Validation:** ParseUUIDPipe para IDs
- **Ownership Validation:** Middleware verifica se entrevista pertence ao usuário
- **Status Validation:** Use cases validam status antes de operações

---

## 📊 Limites por Plano

| Recurso | FREE | PREMIUM |
|---------|------|---------|
| Entrevistas de Texto/mês | 1 | 20 |
| Entrevistas de Áudio/mês | 1 | 20 |
| Mensagens por entrevista | Ilimitado | Ilimitado |
| Histórico | Permanente | Permanente |

> Contador reseta todo dia 1º do mês (00:00 UTC)

---

## 🧪 Testando com cURL

### 1. Registrar
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "plan": "FREE"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### 3. Criar Entrevista
```bash
curl -X POST http://localhost:3001/api/interviews \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "resumeDescription": "Desenvolvedor Full Stack com 5 anos de experiência...",
    "jobDescription": "Procuramos um Desenvolvedor Senior Full Stack...",
    "type": "TEXT"
  }'
```

### 4. Enviar Mensagem
```bash
curl -X POST http://localhost:3001/api/interviews/{INTERVIEW_ID}/messages \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "content": "Sua resposta aqui..."
  }'
```

### 5. Finalizar Entrevista
```bash
curl -X POST http://localhost:3001/api/interviews/{INTERVIEW_ID}/complete \
  -b cookies.txt
```

---

## 🎯 Próximos Passos

Após familiarizar-se com a API:

1. **Implementar Frontend:** Criar interface web em React/Next.js
2. **Testes E2E:** Criar testes automatizados para todas as rotas
3. **Rate Limiting:** Adicionar proteção contra spam (STEP4)
4. **Swagger Docs:** Adicionar documentação interativa
5. **Monitoring:** Adicionar APM (Application Performance Monitoring)

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Verifique os logs do servidor
- Consulte `STEP1.md`, `STEP2.md`, `STEP3.md`
- Execute `npx prisma studio` para visualizar o banco de dados

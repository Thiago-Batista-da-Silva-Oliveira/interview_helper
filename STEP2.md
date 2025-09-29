# STEP 2 - Integração com Agente de IA para Entrevistas

## Objetivo
Implementar sistema de entrevistas simuladas por texto, onde o usuário fornece currículo e descrição da vaga, conversa com agente de IA e recebe feedback.

---

## Tarefas

### 2.1 - Modelagem do Banco de Dados (Extensão)
- [ ] Criar modelo `Interview`:
  - id (String, UUID)
  - userId (String, FK para User)
  - type (Enum: TEXT, AUDIO)
  - status (Enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  - resumeDescription (Text)
  - jobDescription (Text)
  - feedback (Text, nullable)
  - insights (Text, nullable)
  - score (Int, nullable)
  - startedAt (DateTime, nullable)
  - completedAt (DateTime, nullable)
  - createdAt (DateTime)
  - updatedAt (DateTime)

- [ ] Criar modelo `Message` para histórico de conversas:
  - id (String, UUID)
  - interviewId (String, FK para Interview)
  - role (Enum: USER, ASSISTANT, SYSTEM)
  - content (Text)
  - metadata (Json, nullable)
  - createdAt (DateTime)

- [ ] Executar migrations

### 2.2 - Criar Provider de IA
- [ ] Escolher biblioteca de IA (ex: OpenAI SDK, Anthropic SDK)
- [ ] Instalar dependências necessárias
- [ ] Criar interface `src/infra/ai/interfaces/IAIProvider.ts`
  - sendMessage(messages, context)
  - generateFeedback(interview, messages)
  - generateInsights(resume, job, performance)
  
- [ ] Criar implementação `src/infra/ai/openai/openai-ai.provider.ts` (ou Anthropic)
- [ ] Criar `src/infra/ai/ai.module.ts`
- [ ] Configurar variáveis de ambiente para API keys

### 2.3 - Criar Entidades de Domínio
- [ ] Criar `src/core/modules/interview/entities/Interview.ts`
- [ ] Criar `src/core/modules/interview/entities/Message.ts`
- [ ] Criar DTOs:
  - IInterviewDTO
  - IMessageDTO
  - IStartInterviewDTO
  - ISendMessageDTO

### 2.4 - Implementar Repositórios
- [ ] Criar `src/core/modules/interview/repositories/IInterviewRepository.ts`
  - create(data)
  - findById(id)
  - findByUserId(userId, filters?)
  - update(id, data)
  - updateStatus(id, status)
  
- [ ] Criar `src/core/modules/interview/repositories/IMessageRepository.ts`
  - create(data)
  - findByInterviewId(interviewId)
  - findLatestByInterviewId(interviewId, limit)
  
- [ ] Implementar `PrismaInterviewRepository.ts`
- [ ] Implementar `PrismaMessageRepository.ts`

### 2.5 - Implementar Use Cases
- [ ] **StartInterviewService**: Iniciar entrevista
  - Validar se usuário tem créditos disponíveis no plano
  - Validar resumeDescription e jobDescription
  - Criar registro de Interview
  - Incrementar contador de usage
  - Gerar mensagem inicial do sistema/assistente
  - Salvar mensagem no histórico
  - Retornar interview criada e primeira mensagem
  
- [ ] **SendMessageService**: Enviar mensagem na entrevista
  - Validar se interview existe e está IN_PROGRESS
  - Validar se interview pertence ao usuário
  - Salvar mensagem do usuário no histórico
  - Buscar histórico completo da conversa
  - Enviar contexto para IA (currículo, vaga, histórico)
  - Receber resposta da IA
  - Salvar resposta no histórico
  - Retornar resposta da IA
  
- [ ] **CompleteInterviewService**: Finalizar entrevista
  - Validar se interview existe e pertence ao usuário
  - Buscar todo histórico de mensagens
  - Gerar feedback usando IA
  - Gerar insights sobre currículo e performance
  - Atualizar interview com feedback, insights e status COMPLETED
  - Retornar dados completos
  
- [ ] **GetInterviewHistoryService**: Buscar histórico
  - Validar permissões
  - Retornar interview com todas as mensagens
  
- [ ] **ListUserInterviewsService**: Listar entrevistas do usuário
  - Buscar todas interviews do usuário
  - Aplicar filtros (status, type, data)
  - Retornar lista paginada
  
- [ ] **CancelInterviewService**: Cancelar entrevista
  - Validar permissões
  - Atualizar status para CANCELLED
  - Não devolver crédito ao usuário

### 2.6 - Criar Middleware de Validação de Créditos
- [ ] Criar `src/infra/http/middlewares/check-usage.middleware.ts`
  - Verificar se usuário tem créditos disponíveis
  - Lançar exceção se não tiver créditos
  
- [ ] Aplicar middleware nas rotas de criação de interview

### 2.7 - Implementar Controllers HTTP
- [ ] Criar `src/infra/http/controllers/interview.controller.ts`
  - POST `/interviews` - Iniciar entrevista (com resumeDescription e jobDescription)
  - POST `/interviews/:id/messages` - Enviar mensagem
  - POST `/interviews/:id/complete` - Finalizar e gerar feedback
  - GET `/interviews/:id` - Buscar entrevista específica com histórico
  - GET `/interviews` - Listar entrevistas do usuário
  - PATCH `/interviews/:id/cancel` - Cancelar entrevista

### 2.8 - Criar DTOs de Validação (class-validator)
- [ ] Instalar `class-validator` e `class-transformer`
- [ ] Criar `StartInterviewDto`
  - resumeDescription (string, required, min: 50)
  - jobDescription (string, required, min: 50)
  - type (enum: TEXT, default: TEXT)
  
- [ ] Criar `SendMessageDto`
  - content (string, required, min: 1)
  
- [ ] Criar `ListInterviewsQueryDto`
  - status (enum, optional)
  - type (enum, optional)
  - page (number, optional)
  - limit (number, optional)

### 2.9 - Implementar Sistema de Prompts para IA
- [ ] Criar `src/core/modules/interview/prompts/system-prompt.ts`
  - Prompt do sistema explicando o papel do assistente
  
- [ ] Criar `src/core/modules/interview/prompts/interview-prompt.ts`
  - Template para iniciar entrevista com contexto
  
- [ ] Criar `src/core/modules/interview/prompts/feedback-prompt.ts`
  - Template para gerar feedback final
  
- [ ] Criar `src/core/modules/interview/prompts/insights-prompt.ts`
  - Template para gerar insights sobre currículo

### 2.10 - Implementar Formatadores de Contexto
- [ ] Criar `src/core/modules/interview/utils/format-context.ts`
  - Formatar currículo, vaga e histórico para enviar à IA
  
- [ ] Criar `src/core/modules/interview/utils/format-messages.ts`
  - Converter mensagens do banco para formato da IA

### 2.11 - Adicionar Controle de Uso Mensal
- [ ] Criar `src/core/modules/user/useCases/CheckUserUsageService.ts`
  - Verificar se usuário pode criar nova entrevista
  - Considerar plano FREE ou PREMIUM
  - Considerar mês atual
  
- [ ] Criar `src/core/modules/user/useCases/IncrementUserUsageService.ts`
  - Incrementar contador de uso após criar entrevista
  - Criar registro de usage se não existir para o mês

### 2.12 - Implementar Cache para Histórico de Mensagens
- [ ] Cachear histórico de mensagens recente por interviewId
- [ ] Invalidar cache ao adicionar nova mensagem
- [ ] Definir TTL apropriado (ex: 30 minutos)

### 2.13 - Testes
- [ ] Criar testes unitários para todos os use cases
- [ ] Criar mock do AIProvider para testes
- [ ] Criar testes e2e para rotas de interview
- [ ] Testar limites de uso (FREE vs PREMIUM)
- [ ] Testar validações de permissões

### 2.14 - Documentação e Variáveis de Ambiente
- [ ] Adicionar ao `.env.example`:
  - AI_PROVIDER (openai, anthropic, etc)
  - AI_API_KEY
  - AI_MODEL
  - AI_MAX_TOKENS
  
- [ ] Criar documentação de uso da API no README

---

## Regras de Negócio

### Limites de Uso
- **FREE**: 1 entrevista de texto + 1 de áudio por mês
- **PREMIUM**: 20 entrevistas de texto + 20 de áudio por mês
- Contador reseta todo dia 1º do mês

### Validações
- resumeDescription: mínimo 50 caracteres
- jobDescription: mínimo 50 caracteres
- Mensagens: mínimo 1 caractere
- Apenas o dono pode acessar/modificar a entrevista
- Não é possível enviar mensagens em entrevistas COMPLETED ou CANCELLED

### Fluxo de Entrevista
1. Usuário inicia entrevista fornecendo currículo e vaga
2. Sistema valida créditos e cria interview com status IN_PROGRESS
3. IA envia mensagem inicial de apresentação e primeira pergunta
4. Usuário e IA trocam mensagens (conversa)
5. Usuário ou sistema finaliza a entrevista
6. IA gera feedback detalhado e insights
7. Status muda para COMPLETED

### Estrutura de Feedback
- Pontos fortes da entrevista
- Pontos de melhoria
- Sugestões de respostas alternativas
- Score geral (0-100)

### Estrutura de Insights
- Análise do currículo vs vaga
- Gaps de habilidades
- Sugestões de melhorias no currículo
- Destaques para enfatizar

---

## Dependências a Instalar

```bash
npm install openai
# OU
npm install @anthropic-ai/sdk

npm install class-validator class-transformer
```

---

## Prompt do Sistema (Exemplo Inicial)

```
Você é um entrevistador profissional especializado em conduzir entrevistas técnicas e comportamentais.

Seu objetivo é:
1. Conduzir uma entrevista simulada realista
2. Fazer perguntas relevantes baseadas no currículo e na vaga
3. Avaliar as respostas do candidato
4. Fornecer feedback construtivo ao final

Contexto:
- Currículo: {resumeDescription}
- Vaga: {jobDescription}

Conduza a entrevista de forma profissional, empática e construtiva.
Faça entre 5-7 perguntas variadas (técnicas, comportamentais, situacionais).
```
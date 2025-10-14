# 📋 IA Assistant - Visão Geral do Sistema e Roadmap

## 🎯 Resumo Executivo

**IA Assistant** é uma plataforma de preparação para entrevistas de emprego que utiliza IA para simular entrevistas realistas e fornecer feedback detalhado. O sistema utiliza um **banco de questões inteligente** que recomenda perguntas relevantes baseado no currículo e vaga, mantendo contexto durante toda a entrevista.

---

## 📍 ESTADO ATUAL DA IMPLEMENTAÇÃO

**Data:** 13/10/2024
**Versão:** v2.1 (com Analytics - Backend Implementado)

### ✅ O QUE ESTÁ FUNCIONANDO

#### **Core do Sistema (100% completo)**
- ✅ Sistema de autenticação e usuários
- ✅ Banco de questões inteligente (40 perguntas seedadas)
- ✅ Sistema de entrevistas (texto) com contexto
- ✅ Detecção inteligente de perguntas feitas
- ✅ Feedback automático da IA
- ✅ Build compilando sem erros

#### **Analytics - Backend (80% completo)**
- ✅ **Tabelas criadas no banco** (migrations aplicadas):
  - `interview_analytics` - métricas gerais
  - `category_scores` - scores por categoria (GENÉRICO)
  - `difficulty_scores` - scores por dificuldade (GENÉRICO)
  - `user_progress` - progresso mensal
  - `category_progress` - detalhes por categoria
  - `user_achievements` - gamificação
  - `user_streaks` - dias consecutivos

- ✅ **Entities do domínio** (com validações completas):
  - `InterviewAnalytics` - entity principal
  - `CategoryScore` - genérico para qualquer categoria
  - `DifficultyScore` - genérico para qualquer dificuldade

- ✅ **Repositórios implementados**:
  - `IInterviewAnalyticsRepository` (interface)
  - `PrismaInterviewAnalyticsRepository` (implementação)
  - Métodos CRUD completos

- ✅ **Serviço de análise criado**:
  - `AnalyzeInterviewService` (src/core/modules/analytics/useCases/AnalyzeInterview/)
  - Calcula scores por categoria automaticamente
  - Calcula scores por dificuldade
  - Métricas temporais (duração, tempo médio de resposta)
  - Estimativas de comunicação, profundidade e clareza

### ⚠️ O QUE FALTA IMPLEMENTAR

#### **Fase 1: Integração Automática (30min - 1h)**
- [ ] Integrar `AnalyzeInterviewService` no `CompleteInterviewService`
  - Atualmente o serviço existe mas não é chamado automaticamente
  - **Arquivo:** `src/core/modules/interview/useCases/CompleteInterview/CompleteInterviewService.ts`
  - **Linha sugerida:** Após salvar feedback (linha ~90)

- [ ] Criar endpoint REST para buscar analytics
  - `GET /interviews/:id/analytics` - buscar analytics de uma entrevista
  - `GET /users/:userId/analytics/summary` - resumo do usuário
  - **Local:** `src/infra/http/controllers/` (criar AnalyticsController)

#### **Fase 2: Análise de Padrões (1-2 dias)**
- [ ] `AnalyzeUserPatternsService` - detectar padrões recorrentes
- [ ] `GenerateRecommendationsService` - gerar recomendações de estudo
- [ ] `CalculateBenchmarksService` - comparar com outros usuários

#### **Fase 3: Dashboard UI (1 semana)**
- [ ] Frontend completo (React/Next.js/Vue)
- [ ] Gráficos de evolução
- [ ] Visualização de padrões

#### **Fase 4: Gamificação (2-3 dias)**
- [ ] `UnlockAchievementService` - lógica de badges
- [ ] `UpdateStreakService` - lógica de streaks

#### **Fase 5: Insights de IA (1 semana)**
- [ ] Análise avançada de texto com IA
- [ ] Relatórios mensais automatizados

### 🗂️ ARQUIVOS IMPORTANTES CRIADOS

```
src/core/modules/analytics/
├── entities/
│   ├── InterviewAnalytics.ts      ✅ CRIADO
│   ├── CategoryScore.ts           ✅ CRIADO
│   └── DifficultyScore.ts         ✅ CRIADO
├── dtos/
│   └── IInterviewAnalyticsDTO.ts  ✅ CRIADO
├── repositories/
│   ├── IInterviewAnalyticsRepository.ts  ✅ CRIADO
│   └── tokens.ts                         ✅ CRIADO
├── useCases/
│   └── AnalyzeInterview/
│       └── AnalyzeInterviewService.ts    ✅ CRIADO
└── analytics.module.ts            ✅ CRIADO

src/infra/database/prisma/
├── repositories/
│   └── PrismaInterviewAnalyticsRepository.ts  ✅ CRIADO
└── migrations/
    └── 20251014015024_add_analytics_and_gamification/  ✅ CRIADO
```

### 🎯 PRÓXIMO PASSO RECOMENDADO

**Opção A: Completar Fase 1 (recomendado)**
1. Integrar AnalyzeInterviewService no CompleteInterviewService
2. Criar endpoint REST básico
3. Testar fluxo completo de ponta a ponta

**Opção B: Iniciar Fase 2**
1. Implementar AnalyzeUserPatternsService
2. Implementar GenerateRecommendationsService

**Opção C: Pular para Frontend (Fase 3)**
1. Criar dashboard básico
2. Consumir dados já coletados

---

## 🏗️ Arquitetura Atual

### Stack Tecnológica
- **Backend**: NestJS (Node.js + TypeScript)
- **ORM**: Prisma (SQLite dev / PostgreSQL prod)
- **Autenticação**: JWT + Cookies HTTP-Only
- **IA**: OpenAI API / Anthropic Claude API
- **Cache**: Node-cache (em memória)
- **Padrões**: Clean Architecture, DDD, Repository Pattern, Dependency Injection

### Estrutura de Módulos
```
core/
├── user/           # Autenticação, perfil, planos, uso mensal
├── interview/      # Entrevistas, mensagens, perguntas usadas
└── question-bank/  # Banco de questões, seleção inteligente

infra/
├── database/       # Prisma, repositórios
├── ai/             # OpenAI provider
├── cryptography/   # BCrypt, JWT
└── cache/          # Node-cache
```

---

## ✅ Funcionalidades Implementadas

### 1. Sistema de Autenticação e Usuários
- ✅ Registro e login de usuários
- ✅ JWT com cookies HTTP-Only + Secure
- ✅ Sessões rastreáveis (logout remoto)
- ✅ Hash de senhas com BCrypt
- ✅ Sistema de planos (FREE / PREMIUM)
- ✅ Controle de uso mensal (resetado todo dia 1º)

**Limites por plano:**
| Recurso | FREE | PREMIUM |
|---------|------|---------|
| Entrevistas Texto/mês | 1 | 20 |
| Entrevistas Áudio/mês | 1 | 20 |
| Histórico | 3 últimas | Ilimitado |

---

### 2. Banco de Questões Inteligente 🆕

#### **SelectQuestionsService - Análise NLP**
Analisa currículo + vaga e detecta automaticamente:
- **Nível**: Junior, Pleno, Senior, Staff, Principal
- **Categorias**: Frontend, Backend, DevOps, Cloud, Mobile, etc.
- **Tags técnicas**: React, AWS, Docker, TypeScript, etc.

**Algoritmo:**
```typescript
Input:
- Currículo: "5 anos com React, TypeScript, Node.js"
- Vaga: "Senior Frontend Developer - React, Performance"

Detecção:
✅ Nível: SENIOR
✅ Categorias: FRONTEND, BACKEND, GENERAL
✅ Tags: React, TypeScript, Node.js, Performance

Busca no banco:
→ 5 perguntas relevantes (distribuídas entre categorias)
```

#### **Banco de Dados**
- ✅ **40 perguntas** seedadas
- ✅ Categorias: Frontend (8), Backend (8), DevOps (5), etc.
- ✅ Níveis: Junior (8), Pleno (17), Senior (15)
- ✅ Dificuldades: Easy (5), Medium (18), Hard (17)

**Exemplo de perguntas:**
```
FRONTEND + SENIOR:
- "Como funciona o reconciliation algorithm do React (Fiber)?"
- "Como você arquitetaria um micro-frontend escalável?"

BACKEND + PLENO:
- "Como você implementaria paginação eficiente com milhões de registros?"
- "Explique o padrão Repository e quando usá-lo"

GENERAL + TODOS:
- "Conte sobre uma vez que você refatorou código legado complexo"
- "Como você lida com conflitos técnicos em equipe?"
```

---

### 3. Sistema de Entrevistas

#### **StartInterviewService - Início Inteligente**
```typescript
Fluxo:
1. Valida uso mensal do usuário
2. Cria entrevista (status: PENDING)
3. ⭐ Seleciona 5 perguntas inteligentes do banco
4. ⭐ Registra perguntas em InterviewQuestion
5. Constrói prompt com perguntas sugeridas
6. IA gera primeira mensagem usando perguntas como referência
7. Incrementa contador de uso mensal

Resultado:
✅ Entrevista com perguntas relevantes
✅ IA adaptada ao contexto
✅ Rastreamento de perguntas usadas
```

#### **SendMessageService - Conversa Contextualizada**
```typescript
Fluxo:
1. Valida ownership e status da entrevista
2. Salva mensagem do usuário
3. ⭐ Busca perguntas sugeridas do banco
4. ⭐ Analisa messageHistory e detecta quais foram feitas
5. ⭐ Monta contexto com apenas perguntas restantes
6. Envia histórico completo + contexto para IA
7. Salva resposta da IA

Resultado:
✅ IA mantém contexto das perguntas durante toda entrevista
✅ IA não repete perguntas
✅ IA sabe quais perguntas ainda precisa fazer
```

**Algoritmo de Detecção de Perguntas Feitas:**
- Normaliza texto (lowercase, remove pontuação)
- Extrai keywords (remove stopwords em português)
- Calcula % de match de keywords
- **Perguntas longas** (≥3 keywords): match ≥70%
- **Perguntas curtas** (<3 keywords): match 100%

**Exemplo:**
```
Pergunta banco: "Como funciona o Virtual DOM do React?"
Mensagem IA: "Me explique o Virtual DOM e sua importância no React"
Keywords: ["funciona", "virtual", "dom", "react"]
Match: 4/4 = 100% ✅ DETECTADA
```

#### **CompleteInterviewService - Finalização com Feedback**
```typescript
Fluxo:
1. Valida entrevista
2. Busca histórico completo de mensagens
3. Envia para IA com prompt de análise
4. IA gera:
   - Feedback detalhado (pontos fortes/fracos)
   - Insights sobre currículo
   - Score 0-100
5. Salva e marca entrevista como COMPLETED

Resultado:
✅ Feedback construtivo e acionável
✅ Análise de currículo vs vaga
✅ Score quantitativo
```

#### **Outros Serviços**
- ✅ `GetInterviewHistoryService`: Busca mensagens da entrevista
- ✅ `ListUserInterviewsService`: Lista entrevistas do usuário (paginado)
- ✅ `CancelInterviewService`: Cancela entrevista em andamento

---

### 4. Sistema de Prompts Inteligentes

#### **Prompts Básicos**
- `SYSTEM_PROMPT`: Instrui IA como entrevistador profissional
- `buildInterviewStartPrompt()`: Início simples (fallback)
- `buildConversationContext()`: Contexto básico (fallback)

#### **Prompts com Questões do Banco 🆕**
- `buildInterviewStartPromptWithQuestions()`: Início com perguntas sugeridas
- `buildConversationContextWithQuestions()`: Contexto com perguntas restantes

**Exemplo de prompt:**
```
PERGUNTAS SUGERIDAS DO BANCO:
1. Como funciona o reconciliation algorithm do React (Fiber)?
2. Como você debugaria um componente que re-renderiza muito?
3. Conte sobre refatoração de código legado

Instruções:
- Use as perguntas como base, mas adapte conforme necessário
- Faça follow-ups relevantes
- Não precisa fazer TODAS as perguntas
- Priorize qualidade da conversa
```

---

### 5. Tabelas do Banco de Dados

```sql
-- Usuários e autenticação
User (id, email, password, name, plan, createdAt, updatedAt)
UserSession (id, userId, token, isActive, expiresAt)
UserUsage (id, userId, month, textInterviewsUsed, audioInterviewsUsed)

-- Entrevistas
Interview (
  id, userId, type, status,
  resumeDescription, jobDescription,
  feedback, insights, score,
  startedAt, completedAt, createdAt, updatedAt
)

Message (id, interviewId, role, content, metadata, createdAt)

-- Banco de questões 🆕
QuestionBank (
  id, category, level, difficulty,
  question, suggestedAnswer, tags,
  isActive, createdAt, updatedAt
)

-- Rastreamento de questões usadas 🆕
InterviewQuestion (
  id, interviewId, questionId, askedAt
  UNIQUE(interviewId, questionId)
)

-- Futuro: Transcrições de áudio
Transcription (id, interviewId, audioUrl, textContent)
```

---

## 🎯 Fluxo Completo do Sistema

### Jornada do Usuário

```
1. REGISTRO/LOGIN
   → User preenche email/senha
   → Sistema cria sessão JWT
   → Plano FREE por default

2. INICIAR ENTREVISTA
   → User informa currículo + vaga + tipo (TEXT/AUDIO)
   → Sistema valida uso mensal (1 FREE / 20 PREMIUM)
   → SelectQuestionsService analisa e seleciona 5 perguntas
   → IA gera primeira pergunta usando perguntas como referência
   → Estado: IN_PROGRESS

3. CONVERSAR COM IA
   → User envia respostas
   → SendMessageService mantém contexto com perguntas
   → IA detecta perguntas já feitas
   → IA faz follow-ups e próximas perguntas
   → Histórico completo salvo

4. FINALIZAR ENTREVISTA
   → User clica em "Finalizar"
   → IA analisa conversa completa
   → Gera feedback detalhado + insights + score
   → Estado: COMPLETED

5. VER HISTÓRICO
   → User vê lista de entrevistas anteriores
   → Pode revisar mensagens, feedback, score
   → FREE: últimas 3 | PREMIUM: ilimitado
```

---

## 📊 Estatísticas Atuais

### Banco de Questões
```
Total: 40 perguntas

Por Categoria:
- FRONTEND: 8
- BACKEND: 8
- DEVOPS: 5
- FULLSTACK: 2
- DATA_SCIENCE: 2
- MOBILE: 2
- SECURITY: 2
- CLOUD: 2
- TESTING: 2
- GENERAL: 3
- PRODUCT_MANAGEMENT: 2
- DESIGN: 2

Por Nível:
- JUNIOR: 8
- PLENO: 17
- SENIOR: 15

Por Dificuldade:
- EASY: 5
- MEDIUM: 18
- HARD: 17
```

---

## 🚀 PRÓXIMA FEATURE: Dashboard de Evolução do Usuário

### 🎯 Objetivo
Transformar entrevistas isoladas em uma **jornada de evolução contínua**, oferecendo:
- Visualização de progresso ao longo do tempo
- Identificação de padrões de acertos/erros
- Recomendações personalizadas de estudo
- Gamificação e senso de conquista

### ❌ Problema Atual
```
Entrevista 1: Score 65 → Feedback genérico
Entrevista 2: Score 70 → Feedback genérico
Entrevista 3: Score 68 → Feedback genérico

❌ Usuário não vê evolução
❌ Não identifica padrões
❌ Não recebe recomendações específicas
❌ Sente que está "rodando em círculos"
```

### ✅ Solução Proposta

#### **1. Dashboard de Evolução**
```typescript
Métricas principais:
- Score médio (últimas 5 entrevistas)
- Tendência (melhorando/estável/piorando)
- Total de entrevistas realizadas
- Categorias mais praticadas
- Nível de senioridade praticado
```

**Visualização:**
```
📊 Seu Progresso

Score Médio (últimas 5): 72/100 ↗️ +8 pontos

Gráfico de linha:
100 |                    •
 80 |           •    •
 60 |      •
 40 | •
  0 +---+---+---+---+---+
    1   2   3   4   5
```

#### **2. Análise de Padrões (Pattern Detection)**
```typescript
Sistema analisa:
- Categorias onde sempre erra (ex: "sempre mal em DevOps")
- Tipos de perguntas problemáticas (técnicas vs comportamentais)
- Nível de dificuldade onde trava (ex: "vai bem até Medium, trava em Hard")
- Tópicos específicos recorrentes (ex: "sempre erra em 'Performance'")
```

**Exemplo de insights:**
```
🔍 Padrões Identificados

❌ Ponto Fraco Crítico: DevOps
   - Score médio: 45/100 (geral: 72/100)
   - 4 de 5 entrevistas com perguntas de DevOps: mal
   - Tópicos problemáticos: Docker, Kubernetes, CI/CD

⚠️ Dificuldade em Perguntas Técnicas Avançadas
   - Perguntas HARD: 52/100 (MEDIUM: 78/100)
   - Especialmente em: Arquitetura, Escalabilidade

✅ Destaque: Perguntas Comportamentais
   - Score médio: 85/100
   - Pontos fortes: Liderança, Comunicação
```

#### **3. Sistema de Recomendações Personalizadas**
```typescript
Com base nos padrões, gerar:
- Tópicos de estudo prioritários
- Recursos recomendados (cursos, artigos, docs)
- Próximas entrevistas sugeridas (focar em fraquezas)
- Metas SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
```

**Exemplo:**
```
📚 Suas Recomendações Personalizadas

1. PRIORIDADE ALTA: DevOps Fundamentals
   📖 Recursos:
   - Docker para Iniciantes (Udemy)
   - Kubernetes Crash Course (YouTube)
   - CI/CD Best Practices (Medium)

   🎯 Meta: Fazer 3 entrevistas focadas em DevOps
   📅 Prazo sugerido: 2 semanas

2. PRIORIDADE MÉDIA: Arquitetura de Software
   📖 Recursos:
   - Clean Architecture (livro)
   - System Design Interview (AlgoExpert)

   🎯 Meta: Alcançar 70+ em perguntas HARD de Arquitetura

3. MANTER: Soft Skills
   ✅ Você já domina! Continue praticando.
```

#### **4. Gamificação e Conquistas**
```typescript
Badges/Conquistas:
- 🏆 "Primeira Entrevista": Completou 1 entrevista
- 🔥 "Em Chamas": 5 entrevistas em 7 dias
- 📈 "Evolução": Melhorou 20 pontos em 1 mês
- 🎯 "Especialista Frontend": 5 entrevistas Frontend com 80+
- 💪 "Superando Limites": Passou de 60 para 80 em DevOps

Streaks:
- 🔥 Streak atual: 5 dias consecutivos
- 🏅 Maior streak: 12 dias

Níveis:
- Iniciante (0-5 entrevistas)
- Intermediário (6-20 entrevistas)
- Avançado (21-50 entrevistas)
- Expert (51+ entrevistas)
```

#### **5. Comparação com Benchmarks**
```typescript
Comparar com:
- Média de usuários do mesmo nível (Junior/Pleno/Senior)
- Média de usuários na mesma categoria (Frontend/Backend)
- Top 10% de usuários

Exemplo:
"Seu score médio (72) está 8 pontos ACIMA da média de usuários Pleno (64)"
"Você está no TOP 25% em Soft Skills"
"Seu DevOps (45) está ABAIXO da média (68) - oportunidade de melhoria!"
```

---

### 🗺️ Plano de Implementação

> **🎯 Estratégia**: Arquitetura **genérica e escalável**, mas com **foco 100% em Tech** no lançamento. Isso nos permite:
> - ✅ Validar product-market fit com devs primeiro
> - ✅ Expandir para outras áreas SEM refatoração no futuro
> - ✅ Manter código limpo e reutilizável desde o início

#### **Fase 1: Coleta de Dados (Backend) - 80% COMPLETO ✅**
- [x] **Criar tabelas de Analytics (arquitetura genérica)** ✅
  - [x] `InterviewAnalytics` - métricas gerais da entrevista
  - [x] `CategoryScore` - scores por categoria (FRONTEND, BACKEND, etc)
  - [x] `DifficultyScore` - scores por dificuldade (EASY, MEDIUM, HARD)
  - [x] `UserProgress` - progresso mensal do usuário
  - [x] `CategoryProgress` - progresso detalhado por categoria
- [x] **Criar tabelas de Gamificação** ✅
  - [x] `UserAchievement` - badges/conquistas desbloqueadas
  - [x] `UserStreak` - streaks de dias consecutivos
- [x] **Serviço de análise pós-entrevista** ✅ (CRIADO mas NÃO INTEGRADO)
  - [x] `AnalyzeInterviewService` - extrai métricas do histórico
  - [x] Calcular scores por categoria (baseado em perguntas usadas)
  - [x] Calcular scores por dificuldade
  - [x] Detectar padrões de comunicação (estimativa simples)
  - [x] Salvar tudo em Analytics

**⚠️ PENDENTE (20%):**
- [ ] **Integração automática**
  - [ ] Chamar `AnalyzeInterviewService` automaticamente após `CompleteInterviewService`
  - [ ] Criar endpoints REST (`GET /interviews/:id/analytics`)
  - [ ] Testar fluxo completo de ponta a ponta

**📍 Local para integrar:**
```typescript
// src/core/modules/interview/useCases/CompleteInterview/CompleteInterviewService.ts
// Após linha ~90 (depois de interview.complete e update)

await this.analyzeInterviewService.execute({
  interviewId: interview.id.toString()
});
```

#### **Fase 2: Análise de Padrões (2-3 semanas) - 0% COMPLETO**
- [ ] **Criar `AnalyzeUserPatternsService`**
  - [ ] Buscar todas analytics do usuário
  - [ ] Agrupar por categoria e calcular médias
  - [ ] Detectar pontos fracos recorrentes (score < 60 consistente)
  - [ ] Identificar tópicos problemáticos (tags recorrentes em baixo score)
  - [ ] Calcular tendências (melhorando/estável/piorando)
  - [ ] Salvar em `UserProgress`

- [ ] **Criar `GenerateRecommendationsService`**
  - [ ] Analisar padrões detectados
  - [ ] Gerar lista de recursos recomendados (hardcoded inicialmente)
  - [ ] Sugerir próximas entrevistas focadas em fraquezas
  - [ ] Criar metas SMART automaticamente
  - [ ] Retornar JSON estruturado para o frontend

- [ ] **Criar `CalculateBenchmarksService`**
  - [ ] Calcular média global de todos usuários
  - [ ] Calcular média por nível (Junior/Pleno/Senior)
  - [ ] Calcular média por categoria
  - [ ] Calcular percentil do usuário
  - [ ] Identificar top performers (top 10%, 25%)

**📁 Arquivos a criar:**
```
src/core/modules/analytics/useCases/
├── AnalyzeUserPatterns/
│   └── AnalyzeUserPatternsService.ts
├── GenerateRecommendations/
│   └── GenerateRecommendationsService.ts
└── CalculateBenchmarks/
    └── CalculateBenchmarksService.ts
```

#### **Fase 3: Dashboard UI (2-3 semanas) - 0% COMPLETO**

**Backend REST API:**
- [ ] **Criar `AnalyticsController`**
  - [ ] `GET /users/:userId/analytics/summary` - resumo geral
  - [ ] `GET /users/:userId/analytics/patterns` - padrões detectados
  - [ ] `GET /users/:userId/analytics/recommendations` - recomendações
  - [ ] `GET /interviews/:id/analytics` - analytics de entrevista específica
  - [ ] `GET /users/:userId/progress/history` - histórico mensal

**Frontend (React/Next.js/Vue):**
- [ ] **Página de Dashboard**
  - [ ] Layout base com sidebar/header
  - [ ] Gráficos de evolução de score (Chart.js / Recharts)
  - [ ] Cards de métricas principais (score médio, total entrevistas, streak)
  - [ ] Lista de conquistas desbloqueadas

- [ ] **Seção de Análise de Padrões**
  - [ ] Cards de pontos fortes/fracos
  - [ ] Heatmap de categorias (visual de quais categorias precisa melhorar)
  - [ ] Timeline de progresso (scroll horizontal com entrevistas)
  - [ ] Gráfico de comparação por dificuldade

- [ ] **Seção de Recomendações**
  - [ ] Cards de recomendações priorizadas (ALTA/MÉDIA/BAIXA)
  - [ ] Links externos para recursos de estudo
  - [ ] Progress bars de metas
  - [ ] Botão "Começar entrevista focada" com categoria pré-selecionada

**📁 Estrutura sugerida:**
```
frontend/
├── pages/
│   └── dashboard/
│       ├── index.tsx              # Dashboard principal
│       ├── patterns.tsx           # Análise de padrões
│       └── recommendations.tsx    # Recomendações
├── components/
│   └── analytics/
│       ├── ScoreChart.tsx
│       ├── CategoryHeatmap.tsx
│       ├── PatternCard.tsx
│       └── RecommendationCard.tsx
└── services/
    └── api/
        └── analytics.ts           # Chamadas à API
```

#### **Fase 4: Gamificação (1-2 semanas) - 0% COMPLETO**
- [ ] **Sistema de Badges**
  - [ ] Criar enum de conquistas disponíveis
  - [ ] `UnlockAchievementService` - verifica condições após cada entrevista
  - [ ] Definir conquistas iniciais:
    - "Primeira Entrevista" (1 entrevista)
    - "Em Chamas" (5 entrevistas em 7 dias)
    - "Evolução" (melhorou 20 pontos em 1 mês)
    - "Especialista [Categoria]" (5 entrevistas na categoria com 80+)
    - "Superando Limites" (passou de <60 para 80+ em uma categoria)
  - [ ] Notificações de conquista (push notification ou toast)

- [ ] **Sistema de Streaks**
  - [ ] `UpdateStreakService` - executar após cada entrevista
  - [ ] Verificar se usuário fez entrevista hoje
  - [ ] Incrementar `currentStreak` se continuou
  - [ ] Atualizar `longestStreak` se quebrou recorde
  - [ ] Resetar `currentStreak` se quebrou o streak
  - [ ] Job diário à meia-noite para resetar streaks quebrados

- [ ] **Sistema de Níveis**
  - [ ] Definir sistema de XP (ex: 10 XP por entrevista)
  - [ ] Criar `CalculateUserLevelService`
  - [ ] Definir benefícios por nível:
    - Iniciante (0-5): Básico
    - Intermediário (6-20): +1 entrevista FREE
    - Avançado (21-50): Badge especial
    - Expert (51+): Acesso a features beta

**📁 Arquivos a criar:**
```
src/core/modules/gamification/
├── entities/
│   ├── Achievement.ts
│   └── UserLevel.ts
├── useCases/
│   ├── UnlockAchievement/
│   │   └── UnlockAchievementService.ts
│   ├── UpdateStreak/
│   │   └── UpdateStreakService.ts
│   └── CalculateLevel/
│       └── CalculateUserLevelService.ts
└── constants/
    └── achievements.ts    # Lista de conquistas disponíveis
```

#### **Fase 5: Insights de IA (2 semanas) - 0% COMPLETO**
- [ ] **Análise avançada de texto com IA**
  - [ ] `AnalyzeResponseQualityService` - usar IA para analisar respostas
  - [ ] Identificar tópicos específicos mencionados (além de keywords simples)
  - [ ] Detectar padrões de linguagem:
    - Muito técnico vs muito genérico
    - Respostas vagas vs específicas
    - Uso de jargão apropriado
    - Estrutura de resposta (STAR method detection)
  - [ ] Gerar sugestões de melhoria específicas por resposta
  - [ ] Salvar análise detalhada em `metadata` do analytics

- [ ] **Relatórios mensais automatizados**
  - [ ] Job/scheduler que roda dia 1º de cada mês
  - [ ] `GenerateMonthlyReportService` - cria relatório do mês anterior
  - [ ] Template de email com:
    - Resumo do progresso (quantas entrevistas, score médio)
    - Comparação com mês anterior
    - Conquistas desbloqueadas
    - Progresso em metas definidas
    - Próximos passos sugeridos
  - [ ] Integração com serviço de email (SendGrid/Mailgun)
  - [ ] Opção de desabilitar relatórios nas configurações do usuário

**🤖 Prompts de IA a criar:**
```typescript
// Análise de qualidade de resposta
const RESPONSE_QUALITY_PROMPT = `
Analise a seguinte resposta do candidato em uma entrevista técnica:

Pergunta: [question]
Resposta: [answer]

Forneça análise em JSON:
{
  "clarity": 0-100,
  "depth": 0-100,
  "specificity": 0-100,
  "topics": ["topic1", "topic2"],
  "communicationStyle": "technical|balanced|too-generic",
  "suggestions": ["sugestão específica 1", "sugestão 2"]
}
`;
```

**📦 Dependências a adicionar:**
```json
{
  "@sendgrid/mail": "^7.x",
  "node-cron": "^3.x"  // Para jobs agendados
}
```

---

### 📊 Novos Modelos de Dados

> **🏗️ Arquitetura Genérica**: Os modelos abaixo são projetados para suportar **qualquer categoria profissional** (dev, marketing, design, etc), mas o **foco inicial é 100% em Tech** (Frontend, Backend, DevOps, Cloud, Mobile).

```prisma
// Analytics por entrevista (GENÉRICO - funciona para qualquer categoria)
model InterviewAnalytics {
  id                    String   @id @default(cuid())
  interviewId           String   @unique

  // Score geral (0-100)
  overallScore          Int

  // Métricas de comunicação
  communicationQuality  Int?     // 0-100
  depthOfKnowledge      Int?     // 0-100
  clarityScore          Int?     // 0-100

  // Métricas temporais
  avgResponseTime       Int?     // Segundos
  totalDuration         Int?     // Minutos
  totalMessages         Int      @default(0)

  // Metadata adicional (JSON flexível)
  metadata              String?  // Ex: { "nervousness": "low", "confidence": "high" }

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  interview             Interview @relation(fields: [interviewId], references: [id], onDelete: Cascade)

  // 🎯 Relacionamento genérico: scores por categoria
  categoryScores        CategoryScore[]

  // 🎯 Relacionamento genérico: scores por dificuldade
  difficultyScores      DifficultyScore[]

  @@map("interview_analytics")
}

// Scores por categoria (GENÉRICO - escala para qualquer enum)
model CategoryScore {
  id          String           @id @default(cuid())
  analyticsId String
  category    QuestionCategory // Reutiliza enum existente
  score       Int              // 0-100

  // Métricas adicionais
  questionsAnswered Int @default(0)
  questionsCorrect  Int @default(0)

  analytics   InterviewAnalytics @relation(fields: [analyticsId], references: [id], onDelete: Cascade)

  @@unique([analyticsId, category])
  @@map("category_scores")
}

// Scores por dificuldade (GENÉRICO)
model DifficultyScore {
  id          String             @id @default(cuid())
  analyticsId String
  difficulty  QuestionDifficulty // Reutiliza enum existente
  score       Int                // 0-100

  questionsAnswered Int @default(0)

  analytics   InterviewAnalytics @relation(fields: [analyticsId], references: [id], onDelete: Cascade)

  @@unique([analyticsId, difficulty])
  @@map("difficulty_scores")
}

// Progresso do usuário ao longo do tempo (GENÉRICO)
model UserProgress {
  id                    String   @id @default(cuid())
  userId                String
  month                 String   // YYYY-MM

  // Métricas agregadas
  avgScore              Float
  totalInterviews       Int

  // Padrões identificados (JSON - flexível para qualquer categoria)
  // Exemplo: { "weaknesses": ["DEVOPS", "CLOUD"], "strengths": ["FRONTEND", "GENERAL"] }
  weaknesses            String   // JSON array de categorias
  strengths             String   // JSON array de categorias

  // Tendência
  trend                 String   // "improving" | "stable" | "declining"

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user                  User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 🎯 Detalhamento por categoria (genérico)
  categoryProgress      CategoryProgress[]

  @@unique([userId, month])
  @@map("user_progress")
}

// Progresso detalhado por categoria (GENÉRICO)
model CategoryProgress {
  id         String           @id @default(cuid())
  progressId String
  category   QuestionCategory
  count      Int              @default(0)
  avgScore   Float            @default(0)

  progress   UserProgress @relation(fields: [progressId], references: [id], onDelete: Cascade)

  @@unique([progressId, category])
  @@map("category_progress")
}

// Conquistas do usuário
model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String   // ID da conquista (enum ou tabela separada)
  unlockedAt    DateTime @default(now())

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@map("user_achievements")
}

// Streak de dias consecutivos
model UserStreak {
  id            String   @id @default(cuid())
  userId        String   @unique
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  lastActiveAt  DateTime

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_streaks")
}
```

---

### 🎯 Métricas de Sucesso

**Engajamento:**
- ↗️ Usuários fazem 2x mais entrevistas por mês
- ↗️ Usuários retornam 3x mais frequentemente
- ↗️ Taxa de retenção aumenta 40%

**Evolução:**
- ↗️ 70% dos usuários melhoram score em 30 dias
- ↗️ Usuários identificam e corrigem pontos fracos
- ↗️ Tempo médio até conseguir emprego diminui

**Valor Percebido:**
- ↗️ NPS (Net Promoter Score) aumenta
- ↗️ Conversão FREE → PREMIUM aumenta 2x
- ↗️ Feedback positivo sobre gamificação

---

### 💡 Diferenciais Competitivos

1. **Personalização Real**: Não é feedback genérico, é análise de VOCÊ
2. **Progresso Visível**: Gráficos e métricas tangíveis
3. **Gamificação Inteligente**: Badges baseados em conquistas reais
4. **Recomendações Acionáveis**: Não só "estude mais", mas "estude ISSO"
5. **Senso de Evolução**: Ver progresso motiva continuar

---

## 🎨 Mockups Conceituais

### Dashboard Principal
```
┌─────────────────────────────────────────────────────┐
│  📊 Dashboard de Evolução                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Score Médio: 72/100  ↗️ +8 pontos (vs mês passado)│
│                                                     │
│  🔥 Streak: 5 dias    🏆 Nível: Intermediário      │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Evolução de Score                           │  │
│  │  100┤                            •           │  │
│  │   80┤              •    •                    │  │
│  │   60┤       •                                │  │
│  │   40┤  •                                     │  │
│  │    0└──────────────────────────────────────  │  │
│  │      Jan  Fev  Mar  Abr  Mai  Jun          │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  🔍 Análise de Padrões                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ ❌ Ponto Fraco: DevOps (45/100)             │   │
│  │ ⚠️  Atenção: Perguntas HARD (52/100)        │   │
│  │ ✅ Destaque: Soft Skills (85/100)           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📚 Recomendações Personalizadas                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ 1. Docker & Kubernetes (PRIORIDADE ALTA)    │   │
│  │    📖 Recursos: 3 cursos recomendados       │   │
│  │    🎯 Meta: Alcançar 70+ em DevOps          │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Próximos Passos

### Curto Prazo (1-2 meses)
1. ✅ **Implementar Dashboard de Evolução**
2. ✅ **Sistema de Análise de Padrões**
3. ✅ **Recomendações Personalizadas**
4. ✅ **Gamificação Básica** (badges + streaks)

### Médio Prazo (3-6 meses)
1. **Entrevistas por Áudio** (transcrição automática)
2. **Sistema de Pagamentos** (Stripe integration)
3. **Dashboard de Admin** (gerenciar questões)
4. **Analytics Avançado** (ML para predições)

### Longo Prazo (6-12 meses)
1. **Mobile App** (React Native)
2. **Integração LinkedIn** (importar currículo)
3. **Modo Empresa** (para RH avaliar candidatos)
4. **Multi-idioma** (inglês, espanhol)
5. **Comunidade** (compartilhar resultados, competir)

---

## 📝 Conclusão

O **IA Assistant** evoluiu de um simples chat com IA para um **sistema inteligente e contextualizado** que:
- ✅ Seleciona perguntas relevantes automaticamente
- ✅ Mantém contexto durante toda entrevista
- ✅ Rastreia perguntas feitas para evitar repetição
- ✅ Oferece feedback detalhado e acionável

**Próximo grande salto:** Transformar entrevistas isoladas em uma **jornada de evolução contínua**, com:
- 📊 Dashboard visual de progresso
- 🔍 Identificação de padrões e fraquezas
- 📚 Recomendações personalizadas de estudo
- 🏆 Gamificação para engajamento
- 🎯 Senso tangível de evolução

**Valor para o usuário:** Não é só praticar, é **evoluir sistematicamente** e ver o progresso acontecer! 🚀

---

---

## 📋 CHECKLIST DE TAREFAS

### ✅ Completadas (Até 13/10/2024)
- [x] Arquitetura genérica definida
- [x] Schema Prisma com analytics atualizado
- [x] Migrations criadas e aplicadas
- [x] Entities do domínio (InterviewAnalytics, CategoryScore, DifficultyScore)
- [x] Repositórios implementados (interface + Prisma)
- [x] AnalyzeInterviewService criado e funcional
- [x] Module analytics integrado ao sistema
- [x] Build compilando sem erros

### 🔄 Em Andamento
- Nenhuma tarefa em andamento

### ⏳ Próximas Tarefas (Por ordem de prioridade)

**URGENTE (Completar Fase 1):**
1. [ ] Integrar AnalyzeInterviewService no CompleteInterviewService (~30min)
2. [ ] Criar AnalyticsController com endpoints REST (~1h)
3. [ ] Testar fluxo completo de ponta a ponta (~30min)

**CURTO PRAZO (1-2 semanas):**
4. [ ] Implementar AnalyzeUserPatternsService (Fase 2)
5. [ ] Implementar GenerateRecommendationsService (Fase 2)
6. [ ] Implementar CalculateBenchmarksService (Fase 2)
7. [ ] Criar endpoints REST para Fase 2

**MÉDIO PRAZO (3-4 semanas):**
8. [ ] Implementar UnlockAchievementService (Fase 4)
9. [ ] Implementar UpdateStreakService (Fase 4)
10. [ ] Criar frontend básico do dashboard (Fase 3)

**LONGO PRAZO (5-8 semanas):**
11. [ ] Análise avançada com IA (Fase 5)
12. [ ] Relatórios mensais automatizados (Fase 5)
13. [ ] Dashboard completo com todos gráficos (Fase 3)

---

_Documento criado em: Dezembro 2024_
_Última atualização: 13/10/2024_
_Versão do Sistema: v2.1 (Analytics Backend Implementado)_

# 📋 IA Assistant - Visão Geral do Sistema e Roadmap

## 🎯 Resumo Executivo

**IA Assistant** é uma plataforma de preparação para entrevistas de emprego que utiliza IA para simular entrevistas realistas e fornecer feedback detalhado. O sistema utiliza um **banco de questões inteligente** que recomenda perguntas relevantes baseado no currículo e vaga, mantendo contexto durante toda a entrevista.

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

#### **Fase 1: Coleta de Dados (1-2 semanas)**
- [ ] Criar tabela `InterviewAnalytics`
  - Armazenar métricas por categoria/dificuldade
  - Score por tipo de pergunta
  - Tempo de resposta médio
- [ ] Criar tabela `UserProgress`
  - Score histórico
  - Categorias praticadas
  - Padrões identificados
- [ ] Criar tabela `UserAchievements`
  - Badges/conquistas desbloqueadas
  - Streaks
  - Nível atual
- [ ] Serviço de análise pós-entrevista
  - Extrair métricas do histórico de mensagens
  - Classificar respostas por qualidade
  - Salvar em Analytics

#### **Fase 2: Análise de Padrões (2-3 semanas)**
- [ ] Criar `AnalyzeUserPatternsService`
  - Detectar pontos fracos recorrentes
  - Identificar tópicos problemáticos
  - Calcular tendências (melhorando/piorando)
- [ ] Criar `GenerateRecommendationsService`
  - Gerar recomendações de estudo
  - Sugerir próximas entrevistas
  - Criar metas SMART
- [ ] Criar `CalculateBenchmarksService`
  - Comparar com outros usuários
  - Calcular percentis
  - Identificar outliers

#### **Fase 3: Dashboard UI (2-3 semanas)**
- [ ] Página de Dashboard
  - Gráficos de evolução (Chart.js / Recharts)
  - Cards de métricas principais
  - Lista de conquistas
- [ ] Seção de Análise de Padrões
  - Pontos fortes/fracos
  - Heatmap de categorias
  - Timeline de progresso
- [ ] Seção de Recomendações
  - Cards de recomendações priorizadas
  - Links para recursos
  - Progresso de metas

#### **Fase 4: Gamificação (1-2 semanas)**
- [ ] Sistema de Badges
  - Definir conquistas
  - Lógica de desbloqueio
  - Notificações de conquista
- [ ] Sistema de Streaks
  - Rastrear dias consecutivos
  - Notificações de manutenção de streak
- [ ] Sistema de Níveis
  - Progressão baseada em XP
  - Benefícios por nível

#### **Fase 5: Insights de IA (2 semanas)**
- [ ] Usar IA para análise de texto
  - Identificar tópicos nas respostas do usuário
  - Detectar padrões de linguagem
  - Sugerir melhorias de comunicação
- [ ] Relatórios mensais automatizados
  - Email com resumo do mês
  - Progresso vs metas
  - Próximos passos

---

### 📊 Novos Modelos de Dados

```prisma
// Analytics por entrevista
model InterviewAnalytics {
  id                    String   @id @default(cuid())
  interviewId           String   @unique

  // Scores por categoria
  frontendScore         Int?
  backendScore          Int?
  devopsScore           Int?
  generalScore          Int?

  // Scores por dificuldade
  easyScore             Int?
  mediumScore           Int?
  hardScore             Int?

  // Scores por tipo
  technicalScore        Int?     // Perguntas técnicas
  behavioralScore       Int?     // Perguntas comportamentais

  // Métricas temporais
  avgResponseTime       Int?     // Segundos
  totalDuration         Int?     // Minutos

  // Análise de texto (via IA)
  communicationQuality  Int?     // 0-100
  depthOfKnowledge      Int?     // 0-100

  createdAt             DateTime @default(now())

  interview             Interview @relation(fields: [interviewId], references: [id], onDelete: Cascade)

  @@map("interview_analytics")
}

// Progresso do usuário ao longo do tempo
model UserProgress {
  id                    String   @id @default(cuid())
  userId                String
  month                 String   // YYYY-MM

  // Métricas agregadas
  avgScore              Float
  totalInterviews       Int

  // Por categoria
  frontendCount         Int      @default(0)
  backendCount          Int      @default(0)
  devopsCount           Int      @default(0)

  // Padrões identificados (JSON)
  weaknesses            String   // Array de categorias/tópicos
  strengths             String   // Array de categorias/tópicos

  // Tendência
  trend                 String   // "improving" | "stable" | "declining"

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user                  User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, month])
  @@map("user_progress")
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

_Documento criado em: Dezembro 2024_
_Versão do Sistema: v2.0 (com Banco de Questões Inteligente)_

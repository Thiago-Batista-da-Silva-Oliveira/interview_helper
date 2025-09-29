# IA Assistant - Sistema de Preparação para Entrevistas

## 📖 Visão Geral do Projeto

O **IA Assistant** é uma plataforma inovadora que ajuda profissionais a se prepararem para entrevistas de emprego através de simulações realistas conduzidas por inteligência artificial.

### 🎯 Problema que Resolve

Muitos profissionais enfrentam dificuldades para se preparar adequadamente para entrevistas:
- Falta de prática em situações reais de entrevista
- Desconhecimento sobre como adaptar o currículo para vagas específicas
- Ausência de feedback construtivo sobre o desempenho
- Nervosismo e falta de confiança

### 💡 Solução Proposta

Uma plataforma onde o usuário:
1. Cadastra seu currículo e a descrição da vaga desejada
2. Participa de uma entrevista simulada com IA (texto ou áudio)
3. Recebe feedback detalhado sobre sua performance
4. Obtém insights sobre como melhorar seu currículo
5. Pratica quantas vezes precisar dentro do seu plano

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica

**Backend**
- **Framework**: NestJS (Node.js com TypeScript)
- **ORM**: Prisma
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Autenticação**: JWT + Cookies HTTP-Only
- **Criptografia**: BCrypt (hash de senhas)
- **Cache**: Node-cache (em memória)
- **IA**: OpenAI API ou Anthropic Claude API

**Padrões e Princípios**
- Clean Architecture / Domain-Driven Design (DDD)
- Dependency Injection
- Repository Pattern
- Use Cases Pattern
- Provider Pattern para integrações externas

### Estrutura de Pastas

```
src/
├── core/                          # Camada de domínio (regras de negócio)
│   ├── modules/
│   │   ├── user/                  # Módulo de usuários
│   │   │   ├── entities/          # Entidades de domínio
│   │   │   ├── repositories/      # Interfaces de repositórios
│   │   │   ├── useCases/          # Casos de uso (serviços)
│   │   │   ├── dtos/              # Data Transfer Objects
│   │   │   └── factories/         # Factories para testes
│   │   ├── interview/             # Módulo de entrevistas
│   │   └── transcription/         # Módulo de transcrições (áudio)
│   └── shared/
│       ├── entities/              # Classes base (Entity, AggregateRoot)
│       └── errors/                # Exceções customizadas
│
├── infra/                         # Camada de infraestrutura
│   ├── database/
│   │   └── prisma/
│   │       ├── schema.prisma      # Schema do banco de dados
│   │       ├── migrations/        # Migrações do Prisma
│   │       └── repositories/      # Implementações dos repositórios
│   ├── http/
│   │   ├── controllers/           # Controllers REST
│   │   ├── guards/                # Guards de autenticação
│   │   ├── decorators/            # Decorators customizados
│   │   └── middlewares/           # Middlewares
│   ├── cryptography/
│   │   ├── bcrypt/                # Provider de hash
│   │   └── jwt/                   # Provider de JWT
│   ├── cache/
│   │   └── node-cache/            # Provider de cache
│   └── ai/
│       └── openai/                # Provider de IA
│
├── app.module.ts                  # Módulo raiz
└── main.ts                        # Entry point da aplicação
```

---

## 📊 Modelo de Dados

### Entidades Principais

#### User (Usuário)
- Informações de autenticação (email, senha)
- Plano (FREE ou PREMIUM)
- Dados pessoais

#### UserSession (Sessão do Usuário)
- Controle de tokens JWT ativos
- Permite logout remoto
- Expiração de sessões

#### UserUsage (Uso Mensal)
- Contador de entrevistas por texto
- Contador de entrevistas por áudio
- Resetado mensalmente

#### Interview (Entrevista)
- Tipo (TEXT ou AUDIO)
- Status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- Descrição do currículo
- Descrição da vaga
- Feedback da IA
- Insights sobre o currículo
- Score (0-100)

#### Message (Mensagem)
- Histórico completo da conversa
- Papel (USER, ASSISTANT, SYSTEM)
- Conteúdo da mensagem
- Metadados

#### Transcription (Transcrição)
- Texto transcrito do áudio
- Associado ao usuário

---

## 🎨 Funcionalidades por Módulo

### Módulo de Autenticação
- ✅ Registro de usuário
- ✅ Login com JWT + Cookies
- ✅ Logout (sessão específica)
- ✅ Logout remoto (todas as sessões)
- ✅ Validação de token
- ✅ Refresh token
- ✅ Middleware de autenticação

### Módulo de Usuário
- ✅ Perfil do usuário
- ✅ Controle de planos (FREE/PREMIUM)
- ✅ Gestão de uso mensal
- ✅ Atualização de dados

### Módulo de Entrevista (Texto)
- 📝 Iniciar entrevista
- 💬 Enviar/receber mensagens
- 🎯 Finalizar com feedback automático
- 📊 Gerar insights sobre currículo
- 📜 Histórico completo
- 🔍 Listar entrevistas
- ❌ Cancelar entrevista

### Módulo de Entrevista (Áudio) - Futuro
- 🎤 Upload de áudio
- 🔄 Transcrição automática
- 💬 Conversão para texto
- (Mesmas features de texto)

---

## 💰 Modelo de Negócio

### Plano FREE
- **Custo**: Gratuito
- **Entrevistas por Texto**: 1 por mês
- **Entrevistas por Áudio**: 1 por mês
- **Feedback e Insights**: Inclusos
- **Histórico**: Últimas 3 entrevistas

### Plano PREMIUM
- **Custo**: R$ 29,90/mês (sugestão)
- **Entrevistas por Texto**: 20 por mês
- **Entrevistas por Áudio**: 20 por mês
- **Feedback e Insights**: Detalhados e ilimitados
- **Histórico**: Ilimitado
- **Suporte Prioritário**: Sim

### Regras de Uso
- Contadores resetam todo dia 1º do mês
- Entrevistas canceladas **não** devolvem crédito
- Upgrade/downgrade de plano pode ser feito a qualquer momento
- Créditos não utilizados **não** acumulam

---

## 🔐 Segurança

### Autenticação e Autorização
- Senhas hasheadas com BCrypt (salt rounds: 10)
- Tokens JWT com expiração de 7 dias
- Cookies HTTP-Only (protege contra XSS)
- Cookies Secure em produção (HTTPS only)
- SameSite: Strict (protege contra CSRF)
- Refresh tokens com rotação

### Proteção de Dados
- Validação de entrada em todas as rotas
- Rate limiting (futuro)
- Sanitização de dados do usuário
- Logs de acesso e auditoria
- CORS configurado adequadamente

### Boas Práticas
- Princípio do menor privilégio
- Sessões podem ser revogadas remotamente
- Tokens invalidados após logout
- Cache limpo em operações sensíveis

---

## 🚀 Setup Inicial do Projeto

### Pré-requisitos
- Node.js >= 18.x
- npm ou yarn
- SQLite (desenvolvimento)
- Conta na OpenAI ou Anthropic (para API de IA)

### Instalação

#### 1. Clonar o repositório
```bash
git clone <repository-url>
cd ia_assistent
```

#### 2. Instalar dependências
```bash
npm install
```

#### 3. Instalar dependências adicionais do projeto
```bash
# Prisma ORM
npm install prisma @prisma/client

# Autenticação e segurança
npm install @nestjs/jwt bcrypt @types/bcrypt
npm install cookie-parser @types/cookie-parser

# Cache
npm install node-cache @types/node-cache

# Validação
npm install class-validator class-transformer

# IA (escolher um)
npm install openai
# OU
npm install @anthropic-ai/sdk

# Utilitários
npm install @nestjs/config
```

#### 4. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Editar `.env`:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Cookies
COOKIE_SECRET="your-super-secret-cookie-key-change-in-production"
NODE_ENV="development"

# AI Provider (escolher um)
AI_PROVIDER="openai"  # ou "anthropic"
AI_API_KEY="sk-..."
AI_MODEL="gpt-4"  # ou "claude-3-sonnet-20240229"
AI_MAX_TOKENS=2000

# Server
PORT=3000
```

#### 5. Inicializar Prisma
```bash
npx prisma init --datasource-provider sqlite
```

#### 6. Criar schema do banco (após implementar o schema.prisma)
```bash
npx prisma migrate dev --name init
```

#### 7. Gerar Prisma Client
```bash
npx prisma generate
```

#### 8. Rodar o projeto
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

#### 9. Rodar testes
```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes e2e
npm run test:e2e
```

---

## 📝 Scripts Disponíveis

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\"",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "prisma:seed": "ts-node prisma/seed.ts"
}
```

---

## 🧪 Testes

### Estratégia de Testes

#### Testes Unitários (Jest)
- **Use Cases**: Testar lógica de negócio isolada
- **Entities**: Testar validações e comportamentos
- **Providers**: Testar integrações mockadas
- **Coverage**: Mínimo 80%

#### Testes de Integração
- **Repositories**: Testar com banco em memória
- **Services**: Testar fluxo completo com dependências reais

#### Testes E2E (Supertest)
- **Controllers**: Testar rotas HTTP completas
- **Fluxos**: Testar jornada completa do usuário
- **Autenticação**: Testar guards e middlewares

### Estrutura de Testes
```
src/
└── core/
    └── modules/
        └── user/
            ├── useCases/
            │   └── RegisterUser/
            │       ├── RegisterUserService.ts
            │       └── RegisterUserService.spec.ts
            ├── entities/
            │   ├── User.ts
            │   └── User.spec.ts
            └── repositories/
                └── fakes/
                    └── FakeUserRepository.ts
```

---

## 📚 Documentação da API (Futuro)

### Swagger/OpenAPI
- Documentação automática com `@nestjs/swagger`
- Exemplos de requisições e respostas
- Schemas de validação
- Autenticação JWT documentada

### Endpoint: `/api/docs`

---

## 🔄 Fluxo de Desenvolvimento

### 1. Feature Branch
```bash
git checkout -b feature/nome-da-feature
```

### 2. Desenvolvimento
- Criar entidades e DTOs
- Implementar repositórios (interface + implementação)
- Criar use cases com testes
- Implementar controllers
- Criar testes e2e

### 3. Testes
```bash
npm run test
npm run test:e2e
npm run lint
```
---

## 🎯 Roadmap

### Fase 1 - MVP (4-6 semanas)
- [x] Setup do projeto
- [ ] Sistema de autenticação completo
- [ ] Entrevistas por texto
- [ ] Feedback automático básico
- [ ] Deploy em produção

### Fase 2 - Melhorias (2-4 semanas)
- [ ] Entrevistas por áudio
- [ ] Transcrição automática
- [ ] Dashboard do usuário
- [ ] Sistema de pagamentos (Stripe)
- [ ] Melhorias no feedback (mais detalhado)

### Fase 3 - Avançado (4-6 semanas)
- [ ] Analytics e métricas
- [ ] Recomendações personalizadas
- [ ] Integração com LinkedIn
- [ ] Compartilhamento de resultados
- [ ] Modo empresa (para RH)

### Fase 4 - Escala (ongoing)
- [ ] Otimizações de performance
- [ ] Migração para microserviços
- [ ] CDN para áudios
- [ ] Multi-idioma
- [ ] Mobile app (React Native)

---

## 🤝 Contribuindo

### Padrões de Código
- Seguir ESLint e Prettier configurados
- Usar single quotes
- Trailing commas
- Nomenclatura em inglês (código)
- Comentários em português (se necessário)

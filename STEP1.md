# STEP 1 - Sistema de Autenticação e Autorização

## Objetivo
Implementar sistema completo de autenticação com registro, login, logout e controle de planos (Free/Premium).

---

## Tarefas

### 1.1 - Setup do Prisma ORM
- [ ] Instalar dependências do Prisma (`prisma`, `@prisma/client`)
- [ ] Inicializar Prisma com SQLite
- [ ] Configurar `schema.prisma` com datasource SQLite

### 1.2 - Modelagem do Banco de Dados
- [ ] Criar modelo `User` com campos:
  - id (String, UUID)
  - email (String, unique)
  - password (String, hash bcrypt)
  - name (String)
  - plan (Enum: FREE, PREMIUM)
  - createdAt (DateTime)
  - updatedAt (DateTime)
  
- [ ] Criar modelo `UserSession` para controle de sessões:
  - id (String, UUID)
  - userId (String, FK para User)
  - token (String, JWT hash)
  - isActive (Boolean)
  - expiresAt (DateTime)
  - createdAt (DateTime)
  
- [ ] Criar modelo `UserUsage` para controle de uso mensal:
  - id (String, UUID)
  - userId (String, FK para User)
  - month (String, formato: YYYY-MM)
  - textInterviewsUsed (Int, default: 0)
  - audioInterviewsUsed (Int, default: 0)
  - createdAt (DateTime)
  - updatedAt (DateTime)

- [ ] Executar migrations do Prisma

### 1.3 - Criar Provider do Prisma
- [ ] Criar `src/infra/database/prisma/prisma.service.ts` (PrismaService)
- [ ] Criar `src/infra/database/prisma/prisma.module.ts` (PrismaModule)
- [ ] Registrar PrismaModule como global

### 1.4 - Criar Provider de Cache
- [ ] Instalar `node-cache`
- [ ] Criar `src/infra/cache/node-cache/node-cache.service.ts`
- [ ] Criar interface `src/infra/cache/interfaces/ICache.ts`
- [ ] Criar `src/infra/cache/cache.module.ts`
- [ ] Registrar CacheModule

### 1.5 - Criar Provider de Hash (BCrypt)
- [ ] Instalar `bcrypt` e `@types/bcrypt`
- [ ] Criar interface `src/infra/cryptography/interfaces/IHashProvider.ts`
- [ ] Criar `src/infra/cryptography/bcrypt/bcrypt-hash.provider.ts`
- [ ] Criar `src/infra/cryptography/cryptography.module.ts`

### 1.6 - Criar Provider de JWT
- [ ] Instalar `@nestjs/jwt`
- [ ] Criar interface `src/infra/cryptography/interfaces/IJwtProvider.ts`
- [ ] Criar `src/infra/cryptography/jwt/jwt.provider.ts`
- [ ] Configurar JwtModule no CryptographyModule

### 1.7 - Implementar Repositórios
- [ ] Criar `src/core/modules/user/repositories/IUserRepository.ts`
- [ ] Criar `src/core/modules/user/repositories/IUserSessionRepository.ts`
- [ ] Criar `src/core/modules/user/repositories/IUserUsageRepository.ts`
- [ ] Implementar `src/infra/database/prisma/repositories/PrismaUserRepository.ts`
- [ ] Implementar `src/infra/database/prisma/repositories/PrismaUserSessionRepository.ts`
- [ ] Implementar `src/infra/database/prisma/repositories/PrismaUserUsageRepository.ts`

### 1.8 - Criar Entidades de Domínio
- [ ] Criar `src/core/modules/user/entities/User.ts`
- [ ] Criar `src/core/modules/user/entities/UserSession.ts`
- [ ] Criar `src/core/modules/user/entities/UserUsage.ts`
- [ ] Criar DTOs correspondentes

### 1.9 - Implementar Use Cases de Autenticação
- [ ] **RegisterUserService**: Criar nova conta
  - Validar email único
  - Hash da senha com BCrypt
  - Criar usuário com plano FREE por padrão
  - Criar registro inicial de usage
  
- [ ] **LoginUserService**: Fazer login
  - Validar email e senha
  - Gerar JWT token
  - Criar sessão ativa
  - Retornar token e dados do usuário
  
- [ ] **LogoutUserService**: Fazer logout
  - Invalidar sessão específica
  - Limpar cache se necessário
  
- [ ] **LogoutAllSessionsService**: Deslogar remotamente
  - Invalidar todas as sessões do usuário
  - Limpar cache relacionado
  
- [ ] **ValidateTokenService**: Validar token JWT
  - Verificar validade do token
  - Verificar se sessão está ativa
  
- [ ] **RefreshTokenService**: Renovar token (opcional)

### 1.10 - Criar Guards e Decorators
- [ ] Criar `src/infra/http/guards/jwt-auth.guard.ts`
- [ ] Criar decorator `@CurrentUser()` para extrair usuário da request
- [ ] Criar decorator `@Public()` para rotas públicas

### 1.11 - Implementar Controllers HTTP
- [ ] Criar `src/infra/http/controllers/auth.controller.ts`
  - POST `/auth/register` - Registro
  - POST `/auth/login` - Login
  - POST `/auth/logout` - Logout
  - POST `/auth/logout-all` - Logout remoto
  - GET `/auth/me` - Dados do usuário autenticado

### 1.12 - Configurar Cookies
- [ ] Instalar `cookie-parser`
- [ ] Configurar cookie-parser no main.ts
- [ ] Configurar opções de cookie (httpOnly, secure, sameSite)

### 1.13 - Testes
- [ ] Criar testes unitários para cada use case
- [ ] Criar repositórios fake para testes
- [ ] Criar testes e2e para rotas de autenticação

### 1.14 - Variáveis de Ambiente
- [ ] Criar `.env.example`
- [ ] Configurar variáveis:
  - DATABASE_URL
  - JWT_SECRET
  - JWT_EXPIRES_IN
  - COOKIE_SECRET

---

## Validações e Regras de Negócio

- Email deve ser único e válido
- Senha deve ter no mínimo 6 caracteres
- Plano FREE: 1 entrevista de texto + 1 de áudio por mês
- Plano PREMIUM: 20 entrevistas de texto + 20 de áudio por mês
- Tokens JWT expiram em 7 dias
- Sessões podem ser invalidadas remotamente
- Usage é resetado todo mês automaticamente

---

## Dependências a Instalar

```bash
npm install prisma @prisma/client
npm install bcrypt @types/bcrypt
npm install @nestjs/jwt
npm install node-cache
npm install cookie-parser @types/cookie-parser
```
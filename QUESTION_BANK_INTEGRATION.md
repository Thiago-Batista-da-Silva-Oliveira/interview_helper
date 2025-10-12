# 🎯 Integração do Banco de Questões com IA

## 📋 Visão Geral

Implementar um sistema inteligente onde a IA recomenda perguntas do banco de questões baseado no currículo e descrição da vaga, mas mantém a flexibilidade de criar perguntas customizadas quando necessário.

---

## 🏗️ Arquitetura da Solução

### Fluxo Atual (Antes)
```
StartInterview → AI gera perguntas aleatoriamente → Entrevista
```

### Fluxo Novo (Depois)
```
StartInterview
  → Analisa currículo + vaga (extrai categorias, nível, tags)
  → Busca perguntas no banco (usando critérios)
  → Se encontrou perguntas adequadas:
    → Inclui perguntas no prompt da IA
    → IA usa essas perguntas como referência
    → Registra perguntas usadas em InterviewQuestion
  → Se não encontrou perguntas adequadas:
    → IA cria perguntas customizadas (comportamento atual)
  → Entrevista
```

---

## ✅ Checklist de Implementação

### 1️⃣ Módulo QuestionBank
- [ ] Criar `QuestionBankModule` em `src/core/modules/question-bank/`
- [ ] Criar token de injeção `QUESTION_BANK_REPOSITORY` em `repositories/tokens.ts`
- [ ] Exportar repositório e use cases no módulo
- [ ] Importar `QuestionBankModule` no `InterviewModule`

### 2️⃣ Use Case: SelectQuestionsService
- [ ] Criar `SelectQuestionsService` em `useCases/SelectQuestions/`
- [ ] Implementar análise inteligente de currículo e vaga:
  - [ ] Extrair palavras-chave técnicas (React, Node, AWS, etc.)
  - [ ] Identificar nível da vaga (Junior, Pleno, Senior) via NLP/keywords
  - [ ] Mapear para categorias (FRONTEND, BACKEND, etc.)
  - [ ] Extrair tags relevantes
- [ ] Buscar questões no banco usando `IQuestionSelectionCriteria`
- [ ] Retornar 3-5 perguntas mais relevantes
- [ ] Marcar questões para não repetir na mesma entrevista

**Interface:**
```typescript
interface ISelectQuestionsRequest {
  resumeDescription: string;
  jobDescription: string;
  excludeQuestionIds?: string[];
  maxQuestions?: number; // default: 3-5
}

interface ISelectQuestionsResponse {
  questions: QuestionBank[];
  categories: QuestionCategory[];
  detectedLevel: QuestionLevel;
  matchedTags: string[];
}
```

### 3️⃣ Use Case: RecordInterviewQuestionService
- [ ] Criar `RecordInterviewQuestionService` em `useCases/RecordInterviewQuestion/`
- [ ] Responsável por registrar questões usadas na tabela `InterviewQuestion`
- [ ] Associar `interviewId` com `questionId`
- [ ] Prevenir duplicatas (constraint unique já existe no schema)

**Interface:**
```typescript
interface IRecordInterviewQuestionRequest {
  interviewId: string;
  questionIds: string[];
}
```

### 4️⃣ Modificar Prompts
- [ ] Criar novo arquivo `question-aware-prompt.ts`
- [ ] Criar função `buildInterviewStartPromptWithQuestions()`
  - [ ] Recebe perguntas selecionadas do banco
  - [ ] Formata perguntas no prompt
  - [ ] Instrui IA a usar essas perguntas como base
  - [ ] Permite IA adaptar ou criar perguntas adicionais
- [ ] Manter fallback para `buildInterviewStartPrompt()` se não houver perguntas

**Exemplo de Prompt:**
```typescript
export function buildInterviewStartPromptWithQuestions(
  resumeDescription: string,
  jobDescription: string,
  suggestedQuestions: QuestionBank[],
): string {
  const questionsText = suggestedQuestions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join('\n');

  return `Você está conduzindo uma entrevista simulada para a seguinte vaga:

DESCRIÇÃO DA VAGA:
${jobDescription}

CURRÍCULO DO CANDIDATO:
${resumeDescription}

PERGUNTAS SUGERIDAS DO BANCO (use como referência, mas adapte conforme necessário):
${questionsText}

Instruções:
1. Comece a entrevista de forma profissional
2. Use as perguntas sugeridas como base, mas sinta-se livre para:
   - Adaptar o contexto às respostas do candidato
   - Fazer follow-ups relevantes
   - Criar perguntas adicionais se necessário
3. Não precisa fazer TODAS as perguntas listadas
4. Priorize qualidade da conversa sobre seguir a lista rigidamente

Comece agora cumprimentando o candidato e fazendo a primeira pergunta.`;
}
```

### 5️⃣ Refatorar StartInterviewService
- [ ] Injetar `SelectQuestionsService` no construtor
- [ ] Injetar `RecordInterviewQuestionService` no construtor
- [ ] Injetar `IQuestionBankRepository` no construtor
- [ ] Adicionar lógica após criar entrevista:
  ```typescript
  // Após criar interview e antes de gerar primeira mensagem

  // 1. Selecionar perguntas do banco
  const selectedQuestions = await this.selectQuestionsService.execute({
    resumeDescription,
    jobDescription,
    maxQuestions: 5,
  });

  // 2. Construir prompt apropriado
  let startPrompt: string;

  if (selectedQuestions.questions.length > 0) {
    startPrompt = buildInterviewStartPromptWithQuestions(
      resumeDescription,
      jobDescription,
      selectedQuestions.questions,
    );
  } else {
    // Fallback: comportamento atual
    startPrompt = buildInterviewStartPrompt(
      resumeDescription,
      jobDescription,
    );
  }

  // 3. Gerar primeira mensagem com IA (código atual)
  const aiResponse = await this.aiProvider.sendMessage([...]);

  // 4. Registrar perguntas usadas
  if (selectedQuestions.questions.length > 0) {
    await this.recordInterviewQuestionService.execute({
      interviewId: interview.id.toString(),
      questionIds: selectedQuestions.questions.map(q => q.id.toString()),
    });
  }
  ```

### 6️⃣ Repositório: InterviewQuestion
- [ ] Criar `IInterviewQuestionRepository` em `interview/repositories/`
- [ ] Criar `PrismaInterviewQuestionRepository` em `infra/database/prisma/repositories/`
- [ ] Implementar métodos:
  - `create(interviewId: string, questionId: string): Promise<void>`
  - `findByInterviewId(interviewId: string): Promise<string[]>` (retorna questionIds)
  - `bulkCreate(interviewId: string, questionIds: string[]): Promise<void>`

### 7️⃣ Melhorias nos Prompts de Continuação
- [ ] Modificar `SendMessageService` para incluir perguntas usadas no contexto
- [ ] Criar `buildConversationContextWithQuestions()`
- [ ] IA sabe quais perguntas já fez (evita repetição)
- [ ] IA pode adaptar follow-ups baseado nas perguntas originais

### 8️⃣ Testes
- [ ] Testes unitários `SelectQuestionsService`:
  - [ ] Detecta nível corretamente (Junior, Pleno, Senior)
  - [ ] Mapeia categorias (Frontend, Backend, etc.)
  - [ ] Extrai tags relevantes
  - [ ] Retorna perguntas ordenadas por relevância
  - [ ] Respeita limite de perguntas
  - [ ] Exclui perguntas já usadas
- [ ] Testes unitários `RecordInterviewQuestionService`:
  - [ ] Registra perguntas com sucesso
  - [ ] Previne duplicatas
- [ ] Testes de integração `StartInterviewService`:
  - [ ] Fluxo completo com perguntas do banco
  - [ ] Fluxo fallback sem perguntas no banco
  - [ ] Registra perguntas corretamente

### 9️⃣ Seedar Banco de Dados
- [ ] Executar `npx tsx prisma/seed-questions.ts`
- [ ] Verificar que 60+ perguntas foram inseridas
- [ ] Confirmar categorias e níveis variados

### 🔟 Documentação
- [ ] Atualizar `PROJECT.md` com nova funcionalidade
- [ ] Adicionar comentários no código explicando fluxo
- [ ] Criar exemplos de como adicionar novas perguntas ao banco

---

## 🎨 Lógica de Análise Inteligente

### Extração de Nível (QuestionLevel)

```typescript
function detectLevel(jobDescription: string): QuestionLevel {
  const description = jobDescription.toLowerCase();

  // Keywords para cada nível
  const levelKeywords = {
    JUNIOR: ['junior', 'júnior', 'jr', 'entry-level', 'iniciante', '0-2 anos', 'trainee'],
    PLENO: ['pleno', 'mid-level', 'intermediário', '2-5 anos', '3-6 anos'],
    SENIOR: ['senior', 'sênior', 'sr', 'advanced', 'avançado', '5+ anos', 'lead'],
    STAFF: ['staff', 'principal', 'architect', 'arquiteto'],
    PRINCIPAL: ['principal', 'distinguished', 'fellow', 'chief'],
  };

  // Contar matches
  for (const [level, keywords] of Object.entries(levelKeywords)) {
    if (keywords.some(keyword => description.includes(keyword))) {
      return level as QuestionLevel;
    }
  }

  // Default: PLENO (nível intermediário)
  return QuestionLevel.PLENO;
}
```

### Extração de Categorias (QuestionCategory)

```typescript
function detectCategories(
  resumeDescription: string,
  jobDescription: string,
): QuestionCategory[] {
  const combined = `${resumeDescription} ${jobDescription}`.toLowerCase();

  const categoryKeywords = {
    FRONTEND: ['react', 'vue', 'angular', 'frontend', 'html', 'css', 'javascript', 'typescript', 'next.js', 'ui', 'ux'],
    BACKEND: ['backend', 'api', 'node', 'express', 'nestjs', 'java', 'spring', 'python', 'django', 'flask', '.net', 'c#', 'golang', 'rust'],
    FULLSTACK: ['fullstack', 'full-stack', 'full stack'],
    MOBILE: ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
    DEVOPS: ['devops', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'jenkins', 'gitlab', 'ci/cd'],
    DATA_SCIENCE: ['data science', 'machine learning', 'ml', 'ai', 'artificial intelligence', 'tensorflow', 'pytorch', 'pandas', 'numpy'],
    SECURITY: ['security', 'segurança', 'penetration testing', 'owasp', 'cybersecurity'],
    CLOUD: ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'lambda'],
    TESTING: ['testing', 'qa', 'quality assurance', 'test automation', 'selenium', 'cypress', 'jest'],
    PRODUCT_MANAGEMENT: ['product manager', 'pm', 'product owner', 'po', 'agile', 'scrum'],
    DESIGN: ['design', 'ui/ux', 'figma', 'sketch', 'designer'],
    GENERAL: [], // Sempre incluir
  };

  const detectedCategories: QuestionCategory[] = [];

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => combined.includes(keyword))) {
      detectedCategories.push(category as QuestionCategory);
    }
  }

  // Sempre incluir GENERAL para perguntas comportamentais
  if (!detectedCategories.includes(QuestionCategory.GENERAL)) {
    detectedCategories.push(QuestionCategory.GENERAL);
  }

  return detectedCategories;
}
```

### Extração de Tags

```typescript
function extractTags(
  resumeDescription: string,
  jobDescription: string,
): string[] {
  const combined = `${resumeDescription} ${jobDescription}`.toLowerCase();

  // Lista de tecnologias/skills comuns
  const commonTags = [
    'React', 'Vue', 'Angular', 'Node.js', 'TypeScript', 'JavaScript',
    'Python', 'Java', 'C#', 'Go', 'Rust',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'REST', 'GraphQL', 'WebSockets',
    'Git', 'CI/CD', 'Agile', 'Scrum',
    'Leadership', 'Communication', 'Problem Solving',
  ];

  return commonTags.filter(tag =>
    combined.includes(tag.toLowerCase())
  );
}
```

---

## 🚀 Ordem de Implementação

### Fase 1: Estrutura Base (30min)
1. Criar QuestionBankModule
2. Criar tokens de injeção
3. Criar interfaces de repositório InterviewQuestion

### Fase 2: Use Cases (1h)
1. Implementar SelectQuestionsService
2. Implementar RecordInterviewQuestionService
3. Criar testes unitários

### Fase 3: Integração (1h)
1. Refatorar StartInterviewService
2. Criar novos prompts com perguntas
3. Implementar registro de perguntas usadas

### Fase 4: Testes e Ajustes (30min)
1. Testar fluxo completo
2. Ajustar detecção de nível/categoria
3. Validar qualidade das perguntas selecionadas

### Fase 5: Melhorias (30min)
1. Modificar SendMessageService para contexto com perguntas
2. Adicionar logging/debugging
3. Documentação

---

## 📊 Métricas de Sucesso

- [ ] ✅ 80%+ das entrevistas usam perguntas do banco
- [ ] ✅ Perguntas selecionadas são relevantes para vaga
- [ ] ✅ Nível detectado corresponde à vaga
- [ ] ✅ IA consegue adaptar perguntas naturalmente
- [ ] ✅ Não há repetição de perguntas na mesma entrevista
- [ ] ✅ Fallback funciona quando banco não tem perguntas adequadas

---

## 🎯 Exemplo de Uso Final

```typescript
// Input
const request = {
  userId: 'user-123',
  resumeDescription: '5 anos de experiência com React, TypeScript, Node.js. Trabalhei em e-commerce escalável.',
  jobDescription: 'Vaga para Senior Frontend Developer. React, TypeScript, performance optimization.',
  type: InterviewType.TEXT,
};

// Processing
// 1. Detecta: SENIOR, FRONTEND, tags=[React, TypeScript, Performance]
// 2. Busca no banco: 3-5 perguntas relevantes
// 3. Monta prompt com perguntas sugeridas
// 4. IA gera primeira mensagem usando perguntas como referência
// 5. Registra perguntas usadas

// Output
{
  interview: Interview,
  firstMessage: Message, // "Olá! Vi que você tem experiência com React. Como você otimizaria o re-render de um componente complexo?"
}
```

---

## 🔄 Próximos Passos Após Implementação

1. **Dashboard de Perguntas**: Interface admin para gerenciar banco de questões
2. **Machine Learning**: Usar ML para melhorar seleção de perguntas
3. **Feedback Loop**: Usuários avaliam perguntas → melhora seleção
4. **Perguntas Dinâmicas**: IA gera e salva novas perguntas boas no banco
5. **Analytics**: Quais perguntas são mais efetivas por categoria/nível

---

**Pronto para começar? 🚀**

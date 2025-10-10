import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  // ==================== FRONTEND ====================

  // FRONTEND - JUNIOR
  {
    category: 'FRONTEND',
    level: 'JUNIOR',
    difficulty: 'EASY',
    question: 'O que é o Virtual DOM e por que ele é importante no React?',
    suggestedAnswer:
      'O Virtual DOM é uma representação em memória do DOM real. Ele permite que o React compare mudanças e atualize apenas o necessário, melhorando a performance.',
    tags: ['React', 'Virtual DOM', 'Performance'],
  },
  {
    category: 'FRONTEND',
    level: 'JUNIOR',
    difficulty: 'EASY',
    question: 'Explique a diferença entre let, const e var em JavaScript.',
    suggestedAnswer:
      'var tem escopo de função e é hoisted. let e const têm escopo de bloco. const não permite reatribuição, enquanto let permite.',
    tags: ['JavaScript', 'ES6', 'Fundamentos'],
  },
  {
    category: 'FRONTEND',
    level: 'JUNIOR',
    difficulty: 'MEDIUM',
    question:
      'Como você otimizaria o carregamento de imagens em uma página web?',
    suggestedAnswer:
      'Usar lazy loading, formatos modernos (WebP), responsive images com srcset, comprimir imagens, usar CDN, implementar loading progressivo.',
    tags: ['Performance', 'Otimização', 'Web'],
  },

  // FRONTEND - PLENO
  {
    category: 'FRONTEND',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Explique o conceito de Closures em JavaScript e dê um exemplo prático de uso.',
    suggestedAnswer:
      'Closure é quando uma função interna acessa variáveis da função externa mesmo após a execução. Útil para criar funções privadas, factory functions e módulos.',
    tags: ['JavaScript', 'Closures', 'Avançado'],
  },
  {
    category: 'FRONTEND',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Como você implementaria um sistema de autenticação com JWT no frontend?',
    suggestedAnswer:
      'Armazenar token em httpOnly cookie ou localStorage, interceptar requests HTTP para adicionar header Authorization, implementar refresh token, tratar expiração.',
    tags: ['Authentication', 'JWT', 'Security'],
  },
  {
    category: 'FRONTEND',
    level: 'PLENO',
    difficulty: 'HARD',
    question:
      'Você tem um componente React que re-renderiza muito. Como você debugaria e otimizaria isso?',
    suggestedAnswer:
      'Usar React DevTools Profiler, identificar re-renders desnecessários, aplicar React.memo, useCallback, useMemo, dividir componentes, usar context seletivamente.',
    tags: ['React', 'Performance', 'Debugging'],
  },

  // FRONTEND - SENIOR
  {
    category: 'FRONTEND',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Explique como funciona o reconciliation algorithm do React (Fiber) e seus principais benefícios.',
    suggestedAnswer:
      'Fiber permite interromper e retomar trabalho de renderização, priorizar atualizações urgentes, processar trabalho de forma incremental, melhorando UX.',
    tags: ['React', 'Fiber', 'Internals', 'Arquitetura'],
  },
  {
    category: 'FRONTEND',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Como você arquitetaria um micro-frontend escalável para uma aplicação enterprise?',
    suggestedAnswer:
      'Module Federation (Webpack 5), shell application pattern, shared dependencies, isolated routing, comunicação via event bus, estratégia de deploy independente.',
    tags: ['Micro-frontends', 'Arquitetura', 'Scalability'],
  },

  // ==================== BACKEND ====================

  // BACKEND - JUNIOR
  {
    category: 'BACKEND',
    level: 'JUNIOR',
    difficulty: 'EASY',
    question: 'O que é REST e quais são os principais métodos HTTP?',
    suggestedAnswer:
      'REST é um estilo arquitetural para APIs. Métodos principais: GET (ler), POST (criar), PUT/PATCH (atualizar), DELETE (remover). Usa recursos e URIs.',
    tags: ['REST', 'API', 'HTTP'],
  },
  {
    category: 'BACKEND',
    level: 'JUNIOR',
    difficulty: 'EASY',
    question: 'Explique a diferença entre autenticação e autorização.',
    suggestedAnswer:
      'Autenticação verifica quem você é (login). Autorização verifica o que você pode fazer (permissões/roles).',
    tags: ['Security', 'Authentication', 'Authorization'],
  },
  {
    category: 'BACKEND',
    level: 'JUNIOR',
    difficulty: 'MEDIUM',
    question: 'O que são indexes em banco de dados e quando você usaria um?',
    suggestedAnswer:
      'Indexes aceleram consultas criando estruturas de dados otimizadas. Usar em colunas frequentemente buscadas (WHERE, JOIN, ORDER BY). Trade-off: mais rápido para ler, mais lento para escrever.',
    tags: ['Database', 'Performance', 'SQL'],
  },

  // BACKEND - PLENO
  {
    category: 'BACKEND',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Como você implementaria paginação eficiente em uma API com milhões de registros?',
    suggestedAnswer:
      'Usar cursor-based pagination (keyset) ao invés de offset. Index nas colunas de ordenação. Limitar page size. Cache de contagem total. Considerar infinite scroll.',
    tags: ['API', 'Performance', 'Database', 'Pagination'],
  },
  {
    category: 'BACKEND',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question: 'Explique o padrão Repository e quando você o usaria.',
    suggestedAnswer:
      'Repository abstrai acesso a dados, separando lógica de negócio de infraestrutura. Facilita testes (mock), trocar banco de dados, aplicar DDD. Útil em aplicações complexas.',
    tags: ['Design Patterns', 'Repository', 'Architecture', 'DDD'],
  },
  {
    category: 'BACKEND',
    level: 'PLENO',
    difficulty: 'HARD',
    question:
      'Como você lidaria com race conditions em um sistema de pagamentos?',
    suggestedAnswer:
      'Usar transações database com isolation level adequado, locks otimistas/pessimistas, idempotency keys, message queues com exactly-once delivery, distributed locks (Redis).',
    tags: ['Concurrency', 'Payments', 'Distributed Systems'],
  },

  // BACKEND - SENIOR
  {
    category: 'BACKEND',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Explique o teorema CAP e como ele influencia o design de sistemas distribuídos.',
    suggestedAnswer:
      'CAP: Consistency, Availability, Partition tolerance - só pode escolher 2 de 3. Na prática, partições acontecem, então escolher entre CP (consistency) ou AP (availability). Ex: bancos relacionais (CP) vs Cassandra (AP).',
    tags: ['Distributed Systems', 'CAP', 'Database', 'Architecture'],
  },
  {
    category: 'BACKEND',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Como você arquitetaria um sistema de processamento de 1 milhão de eventos por segundo?',
    suggestedAnswer:
      'Message queue (Kafka/RabbitMQ), event sourcing, CQRS, horizontal scaling, partitioning, async processing, idempotency, monitoring robusto, circuit breakers.',
    tags: ['High Performance', 'Event Sourcing', 'Architecture', 'Scalability'],
  },

  // ==================== DEVOPS ====================

  // DEVOPS - JUNIOR
  {
    category: 'DEVOPS',
    level: 'JUNIOR',
    difficulty: 'EASY',
    question: 'O que é Docker e quais são seus benefícios principais?',
    suggestedAnswer:
      'Docker é containerização de aplicações. Benefícios: ambiente consistente, isolamento, portabilidade, facilita deploy, versionamento de infraestrutura.',
    tags: ['Docker', 'Containers', 'Infrastructure'],
  },
  {
    category: 'DEVOPS',
    level: 'JUNIOR',
    difficulty: 'MEDIUM',
    question: 'Explique a diferença entre CI e CD.',
    suggestedAnswer:
      'CI (Continuous Integration): automatiza testes e build a cada commit. CD (Continuous Deployment/Delivery): automatiza deploy para produção (Deployment) ou staging (Delivery).',
    tags: ['CI/CD', 'DevOps', 'Automation'],
  },

  // DEVOPS - PLENO
  {
    category: 'DEVOPS',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Como você debugaria um pod no Kubernetes que está crashando continuamente?',
    suggestedAnswer:
      'kubectl logs, kubectl describe pod, verificar events, resources (CPU/memory), readiness/liveness probes, config maps, secrets, network policies, imagem correta.',
    tags: ['Kubernetes', 'Debugging', 'Troubleshooting'],
  },
  {
    category: 'DEVOPS',
    level: 'PLENO',
    difficulty: 'HARD',
    question:
      'Explique como você implementaria blue-green deployment em Kubernetes.',
    suggestedAnswer:
      'Dois deployments (blue/green), Service aponta para blue. Deploy green, testa, muda Service selector para green. Mantém blue como fallback. Usar labels e selectors.',
    tags: ['Kubernetes', 'Deployment', 'Zero Downtime'],
  },

  // DEVOPS - SENIOR
  {
    category: 'DEVOPS',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Como você desenharia uma estratégia de disaster recovery para um sistema crítico?',
    suggestedAnswer:
      'Multi-region deployment, backups automatizados com retenção, RTO/RPO definidos, runbooks de recovery, testes regulares de disaster recovery, monitoring/alerting, chaos engineering.',
    tags: ['Disaster Recovery', 'High Availability', 'Architecture'],
  },

  // ==================== FULLSTACK ====================

  {
    category: 'FULLSTACK',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Como você implementaria real-time notifications em uma aplicação web (frontend + backend)?',
    suggestedAnswer:
      'Backend: WebSockets (Socket.io) ou Server-Sent Events. Frontend: conectar ao socket, gerenciar reconexão. Alternativa: long polling. Considerar escalabilidade com Redis pub/sub.',
    tags: ['WebSockets', 'Real-time', 'Fullstack'],
  },
  {
    category: 'FULLSTACK',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Você precisa migrar uma aplicação monolítica para microserviços. Como você planejaria essa migração?',
    suggestedAnswer:
      'Strangler pattern, identificar bounded contexts, começar por funcionalidades independentes, API gateway, service mesh, observabilidade, data migration strategy, rollback plan.',
    tags: ['Microservices', 'Architecture', 'Migration', 'Strategy'],
  },

  // ==================== DATA SCIENCE ====================

  {
    category: 'DATA_SCIENCE',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question: 'Explique overfitting e como você o detectaria e evitaria.',
    suggestedAnswer:
      'Overfitting: modelo memoriza dados de treino mas falha em generalizar. Detectar: gap entre treino/validação. Evitar: cross-validation, regularização, mais dados, feature selection, ensemble.',
    tags: ['Machine Learning', 'Overfitting', 'Model Training'],
  },
  {
    category: 'DATA_SCIENCE',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Como você lidaria com dados extremamente desbalanceados em um modelo de classificação?',
    suggestedAnswer:
      'SMOTE/undersampling, class weights, focal loss, ensemble de modelos, métricas adequadas (F1, AUC-PR), anomaly detection approach, stratified sampling.',
    tags: ['Machine Learning', 'Imbalanced Data', 'Classification'],
  },

  // ==================== MOBILE ====================

  {
    category: 'MOBILE',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question: 'Como você otimizaria o consumo de bateria em um app mobile?',
    suggestedAnswer:
      'Reduzir network requests, batch operations, usar WorkManager (Android)/Background Tasks (iOS), otimizar imagens, evitar animações desnecessárias, location tracking eficiente.',
    tags: ['Mobile', 'Performance', 'Battery Optimization'],
  },
  {
    category: 'MOBILE',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Explique a arquitetura MVVM no contexto de desenvolvimento mobile e suas vantagens.',
    suggestedAnswer:
      'Model-View-ViewModel separa UI de lógica. View observa ViewModel via data binding. Testável, reutilizável, separation of concerns. Facilita manutenção e testes unitários.',
    tags: ['Mobile', 'Architecture', 'MVVM', 'Design Patterns'],
  },

  // ==================== SECURITY ====================

  {
    category: 'SECURITY',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Explique OWASP Top 10 e dê exemplos de como prevenir SQL Injection.',
    suggestedAnswer:
      'OWASP lista vulnerabilidades mais críticas. SQL Injection: usar prepared statements/parameterized queries, ORM, validar inputs, princípio do menor privilégio para DB user.',
    tags: ['Security', 'OWASP', 'SQL Injection'],
  },
  {
    category: 'SECURITY',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Como você implementaria uma política de zero-trust security em uma arquitetura de microserviços?',
    suggestedAnswer:
      'mTLS entre serviços, service mesh (Istio), identity-based access, secrets management (Vault), network policies, audit logging, least privilege, continuous verification.',
    tags: ['Security', 'Zero Trust', 'Microservices', 'Architecture'],
  },

  // ==================== CLOUD ====================

  {
    category: 'CLOUD',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Explique a diferença entre scaling vertical e horizontal. Quando usar cada um?',
    suggestedAnswer:
      'Vertical: aumentar recursos de uma máquina (limite físico). Horizontal: adicionar mais máquinas (infinitamente escalável). Usar horizontal para alta disponibilidade e elasticidade.',
    tags: ['Cloud', 'Scalability', 'Architecture'],
  },
  {
    category: 'CLOUD',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Como você otimizaria custos de cloud em uma aplicação serverless (AWS Lambda)?',
    suggestedAnswer:
      'Right-size memory, reduzir cold starts, reserved concurrency, batch processing, S3 lifecycle policies, CloudWatch logs retention, use spot instances para batch, cache agressivo.',
    tags: ['Cloud', 'AWS', 'Serverless', 'Cost Optimization'],
  },

  // ==================== TESTING ====================

  {
    category: 'TESTING',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question: 'Explique a pirâmide de testes e por que ela é importante.',
    suggestedAnswer:
      'Base: muitos testes unitários (rápidos, baratos). Meio: testes de integração. Topo: poucos E2E (lentos, caros). Balancear cobertura, velocidade e confiança.',
    tags: ['Testing', 'Test Pyramid', 'Quality Assurance'],
  },
  {
    category: 'TESTING',
    level: 'SENIOR',
    difficulty: 'HARD',
    question: 'Como você implementaria contract testing entre microserviços?',
    suggestedAnswer:
      'Pact/Spring Cloud Contract, definir contratos entre consumer/provider, testes automatizados, versioning de contratos, CI/CD integration, backward compatibility.',
    tags: ['Testing', 'Microservices', 'Contract Testing'],
  },

  // ==================== GENERAL (Soft Skills + Comportamental) ====================

  {
    category: 'GENERAL',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Conte sobre uma vez que você teve que refatorar código legado complexo. Como você abordou isso?',
    suggestedAnswer:
      'Entender código existente, criar testes, refatorar incrementalmente, code reviews, documentar mudanças, comunicar com time, métricas de qualidade.',
    tags: ['Soft Skills', 'Refactoring', 'Legacy Code'],
  },
  {
    category: 'GENERAL',
    level: 'SENIOR',
    difficulty: 'MEDIUM',
    question:
      'Como você lida com conflitos técnicos em uma equipe quando há opiniões divergentes sobre a solução?',
    suggestedAnswer:
      'Ouvir todos os lados, dados/métricas ao invés de opiniões, PoC se necessário, documentar trade-offs, decisão por consenso ou tech lead, aceitar e seguir em frente.',
    tags: ['Soft Skills', 'Leadership', 'Communication'],
  },
  {
    category: 'GENERAL',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Descreva como você priorizaria features quando há pressão de negócio mas também dívida técnica crítica.',
    suggestedAnswer:
      'Balancear valor de negócio vs risco técnico, comunicar trade-offs claramente, negociar timelines, tech debt como parte do backlog, dedicar % de sprint para tech debt.',
    tags: ['Soft Skills', 'Prioritization', 'Leadership', 'Tech Debt'],
  },

  // ==================== PRODUCT MANAGEMENT ====================

  {
    category: 'PRODUCT_MANAGEMENT',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Como você validaria uma nova feature antes de desenvolvê-la completamente?',
    suggestedAnswer:
      'User research, protótipos, A/B tests, MVP, métricas de sucesso definidas, feedback loops, análise de dados, competitive analysis.',
    tags: ['Product', 'Validation', 'MVP', 'User Research'],
  },
  {
    category: 'PRODUCT_MANAGEMENT',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Como você balancearia inovação vs estabilidade em um produto maduro com milhões de usuários?',
    suggestedAnswer:
      'Feature flags, canary releases, beta programs, métricas de health, user segmentation, innovation time (20% rule), backwards compatibility.',
    tags: ['Product', 'Innovation', 'Risk Management', 'Strategy'],
  },

  // ==================== DESIGN ====================

  {
    category: 'DESIGN',
    level: 'PLENO',
    difficulty: 'MEDIUM',
    question:
      'Como você garantiria acessibilidade (a11y) em uma aplicação web?',
    suggestedAnswer:
      'WCAG guidelines, semantic HTML, ARIA labels, keyboard navigation, screen reader testing, contrast ratios, alt text, focus management.',
    tags: ['Design', 'Accessibility', 'UX', 'Web'],
  },
  {
    category: 'DESIGN',
    level: 'SENIOR',
    difficulty: 'HARD',
    question:
      'Como você conduziria um design system escalável para múltiplos produtos?',
    suggestedAnswer:
      'Component library, design tokens, versioning strategy, documentation (Storybook), governance model, contribution guidelines, multi-platform support.',
    tags: ['Design', 'Design System', 'Scalability', 'Component Library'],
  },
];

async function main() {
  console.log('🌱 Seeding question bank...');

  for (const question of questions) {
    await prisma.questionBank.create({
      data: {
        ...question,
        tags: JSON.stringify(question.tags),
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${questions.length} questions successfully!`);

  // Print stats
  const stats = {
    total: questions.length,
    byCategory: {} as Record<string, number>,
    byLevel: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
  };

  questions.forEach((q) => {
    stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
    stats.byLevel[q.level] = (stats.byLevel[q.level] || 0) + 1;
    stats.byDifficulty[q.difficulty] =
      (stats.byDifficulty[q.difficulty] || 0) + 1;
  });

  console.log('\n📊 Stats:');
  console.log('Total:', stats.total);
  console.log('\nBy Category:', stats.byCategory);
  console.log('By Level:', stats.byLevel);
  console.log('By Difficulty:', stats.byDifficulty);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

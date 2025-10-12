import { Injectable, Inject } from '@nestjs/common';
import type { IQuestionBankRepository } from '@modules/question-bank/repositories/IQuestionBankRepository';
import { QUESTION_BANK_REPOSITORY } from '@modules/question-bank/repositories/tokens';
import type { QuestionBank } from '@modules/question-bank/entities/QuestionBank';
import {
  QuestionCategory,
  QuestionLevel,
  QuestionDifficulty,
} from '@modules/question-bank/dtos/IQuestionBankDTO';

interface ISelectQuestionsRequest {
  resumeDescription: string;
  jobDescription: string;
  excludeQuestionIds?: string[];
  maxQuestions?: number; // default: 5
}

interface ISelectQuestionsResponse {
  questions: QuestionBank[];
  categories: QuestionCategory[];
  detectedLevel: QuestionLevel;
  matchedTags: string[];
}

@Injectable()
export class SelectQuestionsService {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private questionBankRepository: IQuestionBankRepository,
  ) {}

  async execute(
    request: ISelectQuestionsRequest,
  ): Promise<ISelectQuestionsResponse> {
    const {
      resumeDescription,
      jobDescription,
      excludeQuestionIds = [],
      maxQuestions = 5,
    } = request;

    // 1. Análise inteligente do contexto
    const detectedLevel = this.detectLevel(jobDescription);
    const categories = this.detectCategories(
      resumeDescription,
      jobDescription,
    );
    const matchedTags = this.extractTags(resumeDescription, jobDescription);

    // 2. Buscar perguntas no banco baseado nos critérios detectados
    const questions = await this.questionBankRepository.findByCriteria({
      categories: categories.length > 0 ? categories : undefined,
      levels: [detectedLevel],
      tags: matchedTags.length > 0 ? matchedTags : undefined,
      limit: maxQuestions * 3, // Buscar mais para ter opções
      excludeQuestionIds,
    });

    // 3. Selecionar as melhores perguntas (distribuir entre categorias se possível)
    const selectedQuestions = this.selectBestQuestions(
      questions,
      categories,
      maxQuestions,
    );

    return {
      questions: selectedQuestions,
      categories,
      detectedLevel,
      matchedTags,
    };
  }

  /**
   * Detecta o nível da vaga baseado em keywords
   */
  private detectLevel(jobDescription: string): QuestionLevel {
    const description = jobDescription.toLowerCase();

    // Keywords para cada nível (ordem de prioridade: do mais específico para o mais genérico)
    const levelKeywords: Record<QuestionLevel, string[]> = {
      [QuestionLevel.PRINCIPAL]: [
        'principal',
        'distinguished',
        'fellow',
        'chief',
      ],
      [QuestionLevel.STAFF]: ['staff', 'architect', 'arquiteto', 'principal'],
      [QuestionLevel.SENIOR]: [
        'senior',
        'sênior',
        'sr',
        'sr.',
        'advanced',
        'avançado',
        '5+ anos',
        '5 anos',
        'lead',
        'tech lead',
      ],
      [QuestionLevel.PLENO]: [
        'pleno',
        'mid-level',
        'intermediário',
        'intermediate',
        '2-5 anos',
        '3-6 anos',
        '3 anos',
        '4 anos',
      ],
      [QuestionLevel.JUNIOR]: [
        'junior',
        'júnior',
        'jr',
        'jr.',
        'entry-level',
        'iniciante',
        '0-2 anos',
        'trainee',
        'estagiário',
      ],
    };

    // Contar matches para cada nível
    for (const [level, keywords] of Object.entries(levelKeywords)) {
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          return level as QuestionLevel;
        }
      }
    }

    // Default: PLENO (nível intermediário)
    return QuestionLevel.PLENO;
  }

  /**
   * Detecta categorias técnicas baseado em keywords
   */
  private detectCategories(
    resumeDescription: string,
    jobDescription: string,
  ): QuestionCategory[] {
    const combined = `${resumeDescription} ${jobDescription}`.toLowerCase();

    const categoryKeywords: Record<QuestionCategory, string[]> = {
      [QuestionCategory.FRONTEND]: [
        'react',
        'vue',
        'angular',
        'frontend',
        'front-end',
        'html',
        'css',
        'javascript',
        'typescript',
        'next.js',
        'nextjs',
        'ui',
        'ux',
        'svelte',
        'solid',
      ],
      [QuestionCategory.BACKEND]: [
        'backend',
        'back-end',
        'api',
        'node',
        'nodejs',
        'express',
        'nestjs',
        'java',
        'spring',
        'python',
        'django',
        'flask',
        '.net',
        'c#',
        'golang',
        'rust',
        'php',
        'laravel',
      ],
      [QuestionCategory.FULLSTACK]: [
        'fullstack',
        'full-stack',
        'full stack',
      ],
      [QuestionCategory.MOBILE]: [
        'mobile',
        'ios',
        'android',
        'react native',
        'flutter',
        'swift',
        'kotlin',
        'xamarin',
      ],
      [QuestionCategory.DEVOPS]: [
        'devops',
        'docker',
        'kubernetes',
        'k8s',
        'aws',
        'azure',
        'gcp',
        'terraform',
        'ansible',
        'jenkins',
        'gitlab',
        'ci/cd',
        'pipeline',
      ],
      [QuestionCategory.DATA_SCIENCE]: [
        'data science',
        'machine learning',
        'ml',
        'ai',
        'artificial intelligence',
        'tensorflow',
        'pytorch',
        'pandas',
        'numpy',
        'data engineer',
      ],
      [QuestionCategory.SECURITY]: [
        'security',
        'segurança',
        'penetration testing',
        'owasp',
        'cybersecurity',
        'infosec',
      ],
      [QuestionCategory.CLOUD]: [
        'cloud',
        'aws',
        'azure',
        'gcp',
        'serverless',
        'lambda',
        'cloud computing',
      ],
      [QuestionCategory.TESTING]: [
        'testing',
        'qa',
        'quality assurance',
        'test automation',
        'selenium',
        'cypress',
        'jest',
        'tdd',
        'bdd',
      ],
      [QuestionCategory.PRODUCT_MANAGEMENT]: [
        'product manager',
        'pm',
        'product owner',
        'po',
        'agile',
        'scrum',
        'roadmap',
      ],
      [QuestionCategory.DESIGN]: [
        'design',
        'ui/ux',
        'figma',
        'sketch',
        'designer',
        'user experience',
      ],
      [QuestionCategory.GENERAL]: [], // Sempre incluir
    };

    const detectedCategories: QuestionCategory[] = [];

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (category === QuestionCategory.GENERAL) continue; // Processar por último

      if (keywords.some((keyword) => combined.includes(keyword))) {
        detectedCategories.push(category as QuestionCategory);
      }
    }

    // Sempre incluir GENERAL para perguntas comportamentais
    detectedCategories.push(QuestionCategory.GENERAL);

    return detectedCategories;
  }

  /**
   * Extrai tags técnicas relevantes
   */
  private extractTags(
    resumeDescription: string,
    jobDescription: string,
  ): string[] {
    const combined = `${resumeDescription} ${jobDescription}`.toLowerCase();

    // Lista de tecnologias/skills comuns
    const commonTags = [
      'React',
      'Vue',
      'Angular',
      'Node.js',
      'TypeScript',
      'JavaScript',
      'Python',
      'Java',
      'C#',
      'Go',
      'Rust',
      'AWS',
      'Azure',
      'GCP',
      'Docker',
      'Kubernetes',
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'REST',
      'GraphQL',
      'WebSockets',
      'Git',
      'CI/CD',
      'Agile',
      'Scrum',
      'Leadership',
      'Communication',
      'Problem Solving',
      'NestJS',
      'Express',
      'Django',
      'Flask',
      'Spring',
      'Laravel',
      'Next.js',
      'Prisma',
      'Performance',
      'Security',
      'Testing',
      'TDD',
      'Clean Architecture',
    ];

    return commonTags.filter((tag) => combined.includes(tag.toLowerCase()));
  }

  /**
   * Seleciona as melhores perguntas, distribuindo entre categorias
   */
  private selectBestQuestions(
    questions: QuestionBank[],
    categories: QuestionCategory[],
    maxQuestions: number,
  ): QuestionBank[] {
    if (questions.length <= maxQuestions) {
      return questions;
    }

    // Estratégia: distribuir perguntas entre categorias
    const questionsByCategory = new Map<QuestionCategory, QuestionBank[]>();

    // Agrupar por categoria
    for (const question of questions) {
      const existing = questionsByCategory.get(question.category) || [];
      existing.push(question);
      questionsByCategory.set(question.category, existing);
    }

    const selected: QuestionBank[] = [];
    const questionsPerCategory = Math.ceil(maxQuestions / categories.length);

    // Selecionar de cada categoria
    for (const category of categories) {
      const categoryQuestions = questionsByCategory.get(category) || [];
      const toTake = Math.min(questionsPerCategory, categoryQuestions.length);

      selected.push(...categoryQuestions.slice(0, toTake));

      if (selected.length >= maxQuestions) {
        break;
      }
    }

    // Se ainda não tiver perguntas suficientes, pegar o resto
    if (selected.length < maxQuestions) {
      const remaining = questions.filter((q) => !selected.includes(q));
      selected.push(...remaining.slice(0, maxQuestions - selected.length));
    }

    return selected.slice(0, maxQuestions);
  }
}

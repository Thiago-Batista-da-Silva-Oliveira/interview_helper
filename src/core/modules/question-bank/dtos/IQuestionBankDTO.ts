export enum QuestionCategory {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  FULLSTACK = 'FULLSTACK',
  MOBILE = 'MOBILE',
  DEVOPS = 'DEVOPS',
  DATA_SCIENCE = 'DATA_SCIENCE',
  SECURITY = 'SECURITY',
  CLOUD = 'CLOUD',
  TESTING = 'TESTING',
  PRODUCT_MANAGEMENT = 'PRODUCT_MANAGEMENT',
  DESIGN = 'DESIGN',
  GENERAL = 'GENERAL',
}

export enum QuestionLevel {
  JUNIOR = 'JUNIOR',
  PLENO = 'PLENO',
  SENIOR = 'SENIOR',
  STAFF = 'STAFF',
  PRINCIPAL = 'PRINCIPAL',
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface IQuestionBankDTO {
  id: string;
  category: QuestionCategory;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  question: string;
  suggestedAnswer: string | null;
  tags: string[]; // Parsed from JSON string
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateQuestionBankDTO {
  category: QuestionCategory;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  question: string;
  suggestedAnswer?: string;
  tags: string[];
  isActive?: boolean;
}

export interface IUpdateQuestionBankDTO {
  category?: QuestionCategory;
  level?: QuestionLevel;
  difficulty?: QuestionDifficulty;
  question?: string;
  suggestedAnswer?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface IQuestionSelectionCriteria {
  categories?: QuestionCategory[];
  levels?: QuestionLevel[];
  difficulties?: QuestionDifficulty[];
  tags?: string[];
  limit?: number;
  excludeQuestionIds?: string[]; // Para não repetir perguntas
}

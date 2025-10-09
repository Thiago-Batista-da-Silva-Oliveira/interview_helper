import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import type { IInterviewRepository } from '@modules/interview/repositories/IInterviewRepository';
import { INTERVIEW_REPOSITORY } from '@modules/interview/repositories/tokens';

@Injectable()
export class CheckInterviewOwnerMiddleware implements NestMiddleware {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private interviewRepository: IInterviewRepository,
  ) {}

  async use(
    req: Request & { interview?: unknown },
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const interviewId = req.params.id;
    const userId = (req as unknown as { user?: { id: string } }).user?.id;

    if (!userId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const interview = await this.interviewRepository.findById(interviewId);

    if (!interview) {
      throw new NotFoundException('Entrevista não encontrada');
    }

    if (!interview.belongsTo(userId)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta entrevista',
      );
    }

    // Attach interview to request for optimization (avoid re-fetching)
    req.interview = interview;

    next();
  }
}

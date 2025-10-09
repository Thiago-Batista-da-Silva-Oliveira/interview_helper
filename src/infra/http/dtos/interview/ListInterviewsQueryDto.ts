import { IsOptional, IsEnum, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import {
  InterviewStatus,
  InterviewType,
} from '@modules/interview/dtos/IInterviewDTO';

export class ListInterviewsQueryDto {
  @IsOptional()
  @IsEnum(InterviewStatus, {
    message: 'Status inválido',
  })
  status?: InterviewStatus;

  @IsOptional()
  @IsEnum(InterviewType, {
    message: 'Tipo de entrevista inválido',
  })
  type?: InterviewType;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page deve ser um número inteiro' })
  @Min(1, { message: 'Page deve ser no mínimo 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit deve ser um número inteiro' })
  @Min(1, { message: 'Limit deve ser no mínimo 1' })
  @Max(50, { message: 'Limit deve ser no máximo 50' })
  limit?: number = 10;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'startedAt', 'completedAt'], {
    message:
      'sortBy deve ser um dos valores: createdAt, updatedAt, startedAt, completedAt',
  })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'sortOrder deve ser asc ou desc',
  })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

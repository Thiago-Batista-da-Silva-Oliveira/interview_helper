import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { InterviewType } from '@modules/interview/dtos/IInterviewDTO';

export class StartInterviewDto {
  @IsString()
  @IsNotEmpty({ message: 'Descrição do currículo não pode estar vazia' })
  @MinLength(50, {
    message: 'Descrição do currículo deve ter no mínimo 50 caracteres',
  })
  @MaxLength(5000, {
    message: 'Descrição do currículo deve ter no máximo 5000 caracteres',
  })
  resumeDescription: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrição da vaga não pode estar vazia' })
  @MinLength(50, {
    message: 'Descrição da vaga deve ter no mínimo 50 caracteres',
  })
  @MaxLength(5000, {
    message: 'Descrição da vaga deve ter no máximo 5000 caracteres',
  })
  jobDescription: string;

  @IsOptional()
  @IsEnum(InterviewType, {
    message: 'Tipo de entrevista inválido. Use TEXT ou AUDIO',
  })
  type?: InterviewType = InterviewType.TEXT;
}

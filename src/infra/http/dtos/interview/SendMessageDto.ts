import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Mensagem não pode estar vazia' })
  @MinLength(1, { message: 'Mensagem deve ter no mínimo 1 caractere' })
  @MaxLength(2000, {
    message: 'Mensagem deve ter no máximo 2000 caracteres',
  })
  content: string;
}

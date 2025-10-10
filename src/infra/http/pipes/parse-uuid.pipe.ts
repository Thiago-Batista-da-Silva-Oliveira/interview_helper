import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  transform(value: string): string {
    if (!this.isValidUUID(value)) {
      throw new BadRequestException(`Valor "${value}" não é um UUID válido`);
    }
    return value;
  }

  private isValidUUID(value: string): boolean {
    return this.uuidRegex.test(value);
  }
}

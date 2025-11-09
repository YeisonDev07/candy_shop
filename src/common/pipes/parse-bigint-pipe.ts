import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`El valor '${value}' no es un ID válido`);
    }
  }
}
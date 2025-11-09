import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown, context: string): never {
  const prismaError = error as Prisma.PrismaClientKnownRequestError;
  if (prismaError.code === 'P2002') {
    throw new ConflictException(
      `Ya existe un registro duplicado (${context}).`,
    );
  }
  if (prismaError.code === 'P2025') {
    throw new NotFoundException(`No se encontró el registro (${context}).`);
  }
  throw error;
}

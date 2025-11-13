import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { Prisma } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

@Injectable()
export class PrismaExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2002':
              return throwError(
                () => new ConflictException('Ya existe un registro duplicado.'),
              );
            case 'P2025':
              return throwError(
                () => new NotFoundException('No se encontró el registro.'),
              );
          }
        }

        // Si no es error de Prisma, se lanza igual
        return throwError(() => error);
      }),
    );
  }
}

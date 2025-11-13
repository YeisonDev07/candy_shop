import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { ProductosModule } from './modules/productos/productos.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaExceptionInterceptor } from './common/interceptors/prisma-exception.interceptor';

@Module({
  imports: [PrismaModule, ConfigModule, ProductosModule, TelegramModule],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: PrismaExceptionInterceptor,
    },
  ],
})
export class AppModule {}

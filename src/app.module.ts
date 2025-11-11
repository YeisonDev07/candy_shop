import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { ProductosModule } from "./modules/productos/productos.module";
import { TelegramModule } from './modules/telegram/telegram.module';

@Module({
  imports: [PrismaModule, ConfigModule, ProductosModule, TelegramModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

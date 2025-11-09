import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { ProductosModule } from "./modules/productos/productos.module";

@Module({
  imports: [PrismaModule, ConfigModule, ProductosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

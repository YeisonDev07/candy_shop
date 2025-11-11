import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  imports: [TelegramModule],
})
export class ProductosModule {}

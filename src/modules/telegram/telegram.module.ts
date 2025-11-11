import { Module } from '@nestjs/common';
import { NotificacionTelegramService } from './telegram.service';

@Module({
  providers: [NotificacionTelegramService],
  exports: [NotificacionTelegramService], // 👈 importante
})
export class TelegramModule {}

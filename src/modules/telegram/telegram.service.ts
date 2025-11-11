import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificacionTelegramService {
  private readonly logger = new Logger(NotificacionTelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
  }

  async enviarMensaje(mensaje: string): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      const response = await axios.post(url, {
        chat_id: this.chatId,
        text: mensaje,
      });

      if (!response.data.ok) {
        this.logger.error(`Error Telegram: ${JSON.stringify(response.data)}`);
      } else {
        this.logger.log(`Mensaje enviado correctamente a Telegram ✅`);
      }
    } catch (error) {
      this.logger.error(
        `Error al enviar mensaje a Telegram: ${error.message}`,
      );
      throw error;
    }
  }
}

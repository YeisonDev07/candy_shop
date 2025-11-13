// Este archivo define valores globales de la aplicación

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Configuración de la aplicación
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',

  // Configuración de la API
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  // Configuración de paginación por defecto
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '50', 10),

  // Configuración de CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
}));

// Este archivo contiene la configuración de Prisma / PostgreSQL: la base de datos

import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  // Configuraciones adicionales para la base de datos
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
  ssl: process.env.DB_SSL === 'true',
}));

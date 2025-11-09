// Este archivo valida las variables de entorno usando Zod

import { z } from 'zod';

// Schema de validación con Zod
export const esquemaDeValidacion = z.object({
  // Variables de base de datos
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),
  DB_MAX_CONNECTIONS: z.coerce.number().min(1).max(100).default(10),
  DB_SSL: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),

  // Variables de aplicación
  PORT: z.coerce.number().min(1000).max(65535).default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Variables de API
  API_PREFIX: z.string().default('api/v1'),
  DEFAULT_PAGE_SIZE: z.coerce.number().min(1).max(100).default(10),
  MAX_PAGE_SIZE: z.coerce.number().min(10).max(200).default(50),

  // Variables de CORS
  CORS_ORIGIN: z.string().default('*'),
});

// Tipo inferido automáticamente por Zod
export type Environment = z.infer<typeof esquemaDeValidacion>;

// Función para validar y obtener la configuración
export function entornoValidado(): Environment {
  try {
    return esquemaDeValidacion.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `❌ Errores de configuración:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}
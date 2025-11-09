import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import { entornoValidado } from './validacion.env';

@Module({
  imports: [
    NestConfigModule.forRoot({
      // Cargar archivos de configuración
      load: [appConfig, databaseConfig],
      
      // Configuraciones globales
      isGlobal: true, // Hace que el módulo esté disponible globalmente
      cache: true,    // Cachea la configuración para mejor rendimiento
      
      // Validar configuración con Zod al iniciar
      validate: (config) => {
        // Validamos las variables de entorno con Zod
        const validatedConfig = entornoValidado();
        console.log('✅ Configuración validada correctamente con Zod');
        return { ...config, ...validatedConfig };
      },
      
      // Expandir variables de entorno (ej: ${NODE_ENV})
      expandVariables: true,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}

import { IsBoolean, IsOptional } from 'class-validator';
import { CrearProductoDto } from './crear-productos.dto';
import { PartialType } from '@nestjs/mapped-types';

export class ActualizarProductoDto extends PartialType(CrearProductoDto) {
  @IsBoolean({ message: 'El campo activo debe ser un valor booleano.' })
  @IsOptional({ message: 'El campo activo es opcional.' })
  activo?: boolean;
}

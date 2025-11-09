import { CrearProductoDto } from "./crear-productos.dto";
import { PartialType } from '@nestjs/mapped-types';

export class ActualizarProductoDto extends PartialType(CrearProductoDto) {}
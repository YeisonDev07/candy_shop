import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CrearProductoDto {
  @IsString() nombre: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsNumber() @Min(0) precio: number;
}

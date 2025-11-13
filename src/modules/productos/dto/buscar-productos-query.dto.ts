import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  Max,
  Min,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class BuscarProductosQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive({ message: 'La página debe ser un número positivo' })
  @Min(1, { message: 'La página mínima es 1' })
  @Max(100, { message: 'La página máxima es 100' })
  pagina?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive({ message: 'El límite debe ser un número positivo' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(50, { message: 'El límite máximo es 50' })
  limite?: number = 10;

  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser texto' })
  @MinLength(2, {
    message: 'El término de búsqueda debe tener al menos 2 caracteres',
  })
  @Transform(({ value }) => value?.trim())
  buscarPorNombre?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsIn(['id', 'nombre', 'precio', 'stock', 'createdAt', 'updatedAt'])
  ordenarPor?:
    | 'id'
    | 'nombre'
    | 'precio'
    | 'stock'
    | 'createdAt'
    | 'updatedAt' = 'nombre';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orden?: 'asc' | 'desc' = 'asc';
}

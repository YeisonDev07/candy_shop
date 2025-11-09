import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { SerializedProducto } from 'src/types/serialized.types';
import { serializedBigInt } from 'src/utils/serialized-bigint.utils';
import { ActualizarProductoDto } from './dto/actualizar-productos.dto';
import { CrearProductoDto } from './dto/crear-productos.dto';
import { handlePrismaError } from '../../utils/handle-prisma-error';
import { PaginacionResultado } from 'src/types/paginacion.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // Constantes para evitar "números mágicos"
  private readonly MAX_PAGE_NUMBER = 100;
  private readonly MIN_PAGE_NUMBER = 1;

  // Logger nativo de NestJS
  private readonly logger = new Logger(ProductosService.name);

  async findAll(
    pagina: number = 1,
    limite: number = 10,
    buscar?: string,
  ): Promise<PaginacionResultado<SerializedProducto>> {
    const maxPageSize = this.configService.get<number>('MAX_PAGE_SIZE', 50);

    const normalize = (val: number, min: number, max: number) =>
      Math.max(min, Math.min(Number(val) || min, max));

    const page = normalize(pagina, this.MIN_PAGE_NUMBER, this.MAX_PAGE_NUMBER);
    const limit = normalize(limite, this.MIN_PAGE_NUMBER, maxPageSize);

    const skip = (page - 1) * limit;

    const where: Prisma.ProductoWhereInput = {
      activo: true,
      ...(buscar
        ? {
            nombre: {
              contains: buscar,
              mode: Prisma.QueryMode.insensitive, // Búsqueda insensible a mayúsculas/minúsculas
            },
          }
        : {}),
    };

    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const serializedProductos = serializedBigInt(
      productos,
    ) as SerializedProducto[];

    return {
      total,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(total / limit),
      datos: serializedProductos,
    } satisfies PaginacionResultado<SerializedProducto>;
  }

  async findOne(id: bigint): Promise<SerializedProducto> {
    if (!id || id <= 0n) {
      throw new BadRequestException(
        'El ID debe ser un número válido y mayor que 0',
      );
    }

    const producto = await this.prisma.producto.findUnique({
      where: { id },
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return serializedBigInt(producto) as SerializedProducto;
  }

  async create(
    crearProductoDto: CrearProductoDto,
  ): Promise<SerializedProducto> {
    try {
      const existe = await this.prisma.producto.findFirst({
        where: { nombre: crearProductoDto.nombre },
      });
      if (existe) {
        throw new ConflictException(
          `El producto '${crearProductoDto.nombre}' ya existe.`,
        );
      }

      const producto = await this.prisma.producto.create({
        data: crearProductoDto,
      });

      return serializedBigInt(producto) as SerializedProducto;
    } catch (error: any) {
      handlePrismaError(error, 'Producto');
    }
  }

  async update(
    id: bigint,
    actualizarProductoDto: ActualizarProductoDto,
  ): Promise<SerializedProducto> {
    try {
      const existe = await this.prisma.producto.findUnique({ where: { id } });
      if (!existe)
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);

      const productoActualizado = await this.prisma.producto.update({
        where: { id },
        data: actualizarProductoDto,
      });

      return serializedBigInt(productoActualizado) as SerializedProducto;
    } catch (error: any) {
      handlePrismaError(error, 'Producto');
    }
  }

  async remove(id: bigint): Promise<SerializedProducto> {
    try {
      const existe = await this.prisma.producto.findUnique({ where: { id } });
      if (!existe)
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);

      const producto = await this.prisma.producto.update({
        where: { id },
        data: { activo: false },
      });
      this.logger.log(`Producto ${id} eliminado`);

      return serializedBigInt(producto) as SerializedProducto;
    } catch (error: any) {
      handlePrismaError(error, 'Producto');
    }
  }

  async findInactivos(
    pagina: number = 1,
    limite: number = 10,
    buscar?: string,
  ): Promise<PaginacionResultado<SerializedProducto>> {
    const maxPageSize = this.configService.get<number>('MAX_PAGE_SIZE', 50);

    const normalize = (val: number, min: number, max: number) =>
      Math.max(min, Math.min(Number(val) || min, max));

    const page = normalize(pagina, this.MIN_PAGE_NUMBER, this.MAX_PAGE_NUMBER);
    const limit = normalize(limite, this.MIN_PAGE_NUMBER, maxPageSize);

    const skip = (page - 1) * limit;

    const where: Prisma.ProductoWhereInput = {
      activo: true,
      ...(buscar
        ? {
            nombre: {
              contains: buscar,
              mode: Prisma.QueryMode.insensitive, // Búsqueda insensible a mayúsculas/minúsculas
            },
          }
        : {}),
    };

    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.producto.count({ where }),
    ]);

    const serializedProductos = serializedBigInt(
      productos,
    ) as SerializedProducto[];

    return {
      total,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(total / limit),
      datos: serializedProductos,
    } satisfies PaginacionResultado<SerializedProducto>;
  }

  async restore(id: bigint): Promise<SerializedProducto> {
    try {
      const existe = await this.prisma.producto.findUnique({ where: { id } });
      if (!existe)
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      this.logger.log(`Producto ${id} restaurado`);
      const producto = await this.prisma.producto.update({
        where: { id },
        data: { activo: true },
      });
      return serializedBigInt(producto) as SerializedProducto;
    } catch (error) {
      handlePrismaError(error, 'Producto');
    }
  }
}

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
import { NotificacionTelegramService } from '../telegram/telegram.service';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private notificacionService: NotificacionTelegramService,
  ) {}

  // Constantes para evitar "números mágicos"
  // Limite del número de página permitido.
  private readonly MAX_PAGE_NUMBER = 100;
  private readonly MIN_PAGE_NUMBER = 1;

  // Logger nativo de NestJS
  private readonly logger = new Logger(ProductosService.name);

  async findAll(
    pagina: number = 1,
    limite: number = 10,
    buscarPorNombre?: string,
    activo?: boolean,
    ordenarPor:
      | 'id'
      | 'nombre'
      | 'precio'
      | 'stock'
      | 'createdAt'
      | 'updatedAt' = 'nombre',
    orden: 'asc' | 'desc' = 'asc',
  ): Promise<PaginacionResultado<SerializedProducto> | { message: string }> {
    const maxPageSize = this.configService.get<number>('MAX_PAGE_SIZE', 50);

    const normalize = (val: number, min: number, max: number) =>
      Math.max(min, Math.min(Number(val) || min, max));

    const page = normalize(pagina, this.MIN_PAGE_NUMBER, this.MAX_PAGE_NUMBER);
    const limit = normalize(limite, this.MIN_PAGE_NUMBER, maxPageSize);

    const skip = (page - 1) * limit;

    const where: Prisma.ProductoWhereInput = {
      ...(typeof activo === 'boolean' ? { activo } : { activo: true }),
      ...(buscarPorNombre
        ? {
            nombre: {
              contains: buscarPorNombre,
              mode: Prisma.QueryMode.insensitive, // búsqueda case-insensitive
            },
          }
        : {}),
    };

    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [ordenarPor]: orden }, // ← dinámico según el DTO
      }),
      this.prisma.producto.count({ where }),
    ]);

    // ✅ VALIDACIÓN: Si no hay productos
    if (total === 0) {
      return {
        message: buscarPorNombre
          ? `No se encontraron productos que coincidan con "${buscarPorNombre}"`
          : 'No hay productos disponibles en este momento',
      };
    }

    const serializedProductos = serializedBigInt(
      productos,
    ) as SerializedProducto[];

    return {
      total,
      limite: limit,
      pagina: page,
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
  }

  async createMany(
    productos: CrearProductoDto[],
  ): Promise<{ message: string; total: number }> {
    if (!Array.isArray(productos) || productos.length === 0) {
      throw new BadRequestException('Debes enviar al menos un producto.');
    }

    // ✅ VALIDACIÓN: Límite máximo de productos por batch
    const MAX_BATCH_SIZE = 100;
    if (productos.length > MAX_BATCH_SIZE) {
      throw new BadRequestException(
        `No puedes crear más de ${MAX_BATCH_SIZE} productos a la vez. Enviaste ${productos.length}.`,
      );
    }

    // ✅ VALIDACIÓN: Verificar duplicados dentro del mismo array
    const nombres = productos.map((p) => p.nombre);
    const nombresDuplicados = nombres.filter(
      (nombre, index) => nombres.indexOf(nombre) !== index,
    );
    if (nombresDuplicados.length > 0) {
      throw new BadRequestException(
        `Hay nombres duplicados en el array: ${[...new Set(nombresDuplicados)].join(', ')}`,
      );
    }

    const existentes = await this.prisma.producto.findMany({
      where: { nombre: { in: nombres } },
    });

    if (existentes.length > 0) {
      const nombresExistentes = existentes.map((p) => p.nombre).join(', ');
      throw new ConflictException(
        `Los siguientes productos ya existen: ${nombresExistentes}`,
      );
    }

    const nuevos = await this.prisma.producto.createMany({
      data: productos,
      skipDuplicates: true,
    });

    this.logger.log(`Se crearon ${nuevos.count} productos en batch`);
    return {
      message: `Se crearon ${nuevos.count} productos correctamente.`,
      total: nuevos.count,
    };
  }

  async update(
    id: bigint,
    actualizarProductoDto: ActualizarProductoDto,
  ): Promise<SerializedProducto> {
    const existe = await this.prisma.producto.findUnique({ where: { id } });

    if (!existe) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    if (
      'stock' in actualizarProductoDto ||
      'stockMinimo' in actualizarProductoDto
    ) {
      throw new BadRequestException(
        'No está permitido actualizar el stock directamente desde este endpoint. Usa /aumentar-stock o /reducir-stock.',
      );
    }

    const productoActualizado = await this.prisma.producto.update({
      where: { id },
      data: actualizarProductoDto,
    });

    return serializedBigInt(productoActualizado) as SerializedProducto;
  }

  async remove(id: bigint): Promise<SerializedProducto> {
    const existe = await this.prisma.producto.findUnique({ where: { id } });
    if (!existe)
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    // ✅ VALIDACIÓN: No desactivar producto ya desactivado
    if (!existe.activo) {
      throw new BadRequestException(
        `El producto '${existe.nombre}' ya está desactivado`,
      );
    }

    const producto = await this.prisma.producto.update({
      where: { id },
      data: { activo: false },
    });
    this.logger.log(`Producto ${id} eliminado`);

    return serializedBigInt(producto) as SerializedProducto;
  }

  async restore(id: bigint): Promise<SerializedProducto> {
    const existe = await this.prisma.producto.findUnique({ where: { id } });
    if (!existe)
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    // ✅ VALIDACIÓN: No restaurar producto ya activo
    if (existe.activo) {
      throw new BadRequestException(
        `El producto '${existe.nombre}' ya está activo`,
      );
    }

    this.logger.log(`Producto ${id} restaurado`);
    const producto = await this.prisma.producto.update({
      where: { id },
      data: { activo: true },
    });
    return serializedBigInt(producto) as SerializedProducto;
  }

  // Disminuir stock (por venta)
  async reducirStock(
    id: bigint,
    cantidad: number,
  ): Promise<SerializedProducto> {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException(`Producto ${id} no encontrado`);

    if (cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad a reducir debe ser mayor que 0.',
      );
    }

    if (producto.stock < cantidad) {
      throw new BadRequestException(
        `Solo hay ${producto.stock} unidades disponibles de '${producto.nombre}'.`,
      );
    }

    const nuevoStock = producto.stock - cantidad;

    const actualizado = await this.prisma.producto.update({
      where: { id },
      data: { stock: nuevoStock },
    });

    // Notificaciones automáticas
    if (nuevoStock === 0) {
      await this.notificacionService.enviarMensaje(
        `🚨 Producto '${producto.nombre}' se ha quedado SIN stock (0 unidades restantes).`,
      );
    } else if (nuevoStock <= producto.stockMinimo) {
      await this.notificacionService.enviarMensaje(
        `⚠️ Stock bajo: '${producto.nombre}' (${nuevoStock}/${producto.stockMinimo}).`,
      );
    }

    return serializedBigInt(actualizado) as SerializedProducto;
  }

  async aumentarStock(
    id: bigint,
    cantidad: number,
  ): Promise<SerializedProducto> {
    if (cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad a aumentar debe ser mayor que 0.',
      );
    }

    const producto = await this.prisma.producto.findUnique({
      where: { id: Number(id) },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    const stockActual = Number(producto.stock);
    const cantidadNum = Number(cantidad);

    if (isNaN(stockActual) || isNaN(cantidadNum)) {
      throw new BadRequestException('Valores inválidos para stock o cantidad.');
    }

    const nuevoStock = stockActual + cantidadNum;

    this.logger.debug(
      `Stock actualizado para producto ${id}: ${stockActual} → ${nuevoStock}`,
    );
    console.log({
      id,
      cantidad,
      stockActual,
      nuevoStock,
      tipo: typeof nuevoStock,
    });

    const actualizado = await this.prisma.producto.update({
      where: { id: Number(id) },
      data: { stock: Math.floor(nuevoStock) }, // 👈 Asegura entero válido
    });

    this.logger.log(
      `🟢 Stock de '${producto.nombre}' aumentado a ${nuevoStock}.`,
    );

    if (
      stockActual <= producto.stockMinimo &&
      nuevoStock > producto.stockMinimo
    ) {
      await this.notificacionService.enviarMensaje(
        `✅ Producto '${producto.nombre}' ha sido repuesto. Nuevo stock: ${nuevoStock} unidades.`,
      );
    }

    return serializedBigInt(actualizado) as SerializedProducto;
  }
}

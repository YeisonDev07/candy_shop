import { Get, Injectable, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SelrializedProducto } from 'src/types/serialized.types';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10,
  ): Promise<{
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
    datos: any[];
  }> {
    // Convertir a número y establecer límites
    const page = Math.max(1, Math.min(Number(pagina) || 1, 100));
    const limit = Math.max(1, Math.min(Number(limite) || 10, 50));

    // Calcular skip
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [productos, total] = await Promise.all([
      this.prisma.producto.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.producto.count(),
    ]);

    return {
      total,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(total / limit),
      datos: productos.map((producto) => ({
        ...producto,
        id: producto.id.toString(), // opcional, solo si id es BigInt
      })),
    };
  } 

}

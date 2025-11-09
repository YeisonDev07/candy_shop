import { Producto } from '@prisma/client';

export type SerializedProducto = Omit<Producto, 'id'> & { id: string };

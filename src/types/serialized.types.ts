import { Producto } from '@prisma/client';

export type SelrializedProducto = Omit<Producto, 'id'> & { id: string };

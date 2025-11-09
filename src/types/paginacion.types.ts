export interface PaginacionResultado<T> {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
  datos: T[];
}

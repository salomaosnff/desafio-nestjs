/**
 * Representa uma página de um resultado paginado
 */
export class Paged<T> {
  constructor(
    public items: T[],
    public total_items: number,
    public page: number = 1,
    public page_size: number = 20,
  ) {}

  /**
   * Mapeia os itens da página atual para outro tipo
   * @param fn
   * @returns
   */
  map<U>(fn: (item: T) => U): Paged<U> {
    return new Paged(
      this.items.map(fn),
      this.total_items,
      this.page,
      this.page_size,
    );
  }

  /**
   * Retorna a quantidade de páginas
   * @returns
   */
  get total_pages(): number {
    return Math.ceil(this.total_items / this.page_size);
  }
}

/**
 * Parâmetros da requisição de paginação
 */
export interface PageRequestParams {
  page?: number;
  page_size?: number;
}

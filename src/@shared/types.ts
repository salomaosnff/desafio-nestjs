import { Result } from './result';

/**
 * Representa um valor assíncrono que pode ser um valor de sucesso ou erro
 * A promessa deve ser resolvida com um valor do tipo Result e não deve ser rejeitada
 * @template T Tipo do valor de sucesso
 * @template E Tipo do valor de erro
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;

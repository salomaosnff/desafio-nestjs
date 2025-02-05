import { None, Option, Some } from './option';

interface ResultMatcher<T, E, R1, R2> {
  Ok(value: T): R1;
  Err(error: E): R2;
}

/**
 * Resultado de uma operação que pode falhar
 */
export interface Result<T, E> {
  /**
   * Retorna se o resultado é um valor de erro
   * @returns {true} se for um valor de erro
   * @returns {false} se for um valor de sucesso
   */
  is_err(): this is ErrValue<T, E>;

  /**
   * Retorna se o resultado é um valor de sucesso
   * @returns {true} se for um valor de sucesso
   * @returns {false} se for um valor de erro
   */
  is_ok(): this is OkValue<T, E>;

  /**
   * Desencapsula o valor de sucesso
   * @returns {T} Valor desencapsulado de sucesso
   * @throws {TypeError} se for um valor de erro
   */
  unwrap(): T;

  /**
   * Desencapsula o valor de erro
   * @returns {E} Valor desencapsulado de erro
   * @throws {TypeError} se for um valor de sucesso
   */
  unwrap_err(): E;

  /**
   * Mapeia o valor de sucesso
   * @param fn Função de mapeamento
   */
  map<R>(fn: (value: T) => R): Result<R, E>;

  /**
   * Mapeia o valor de erro
   * @param fn Função de mapeamento
   */
  map_err<U>(): Result<T, U>;
  map_err<U>(fn: (error: E) => U): Result<T, U>;

  /**
   * Trata o valor de sucesso e erro
   * @param matcher Objeto com as funções de tratamento
   * @returns Resultado do tratamento
   * @template R1 Tipo de retorno para o valor de sucesso
   * @template R2 Tipo de retorno para o valor de erro
   */
  match<R1, R2>(matcher: ResultMatcher<T, E, R1, R2>): R1 | R2;

  /**
   * Retorna um valor Option com o valor de sucesso
   */
  ok(): Option<T>;

  /**
   * Retorna um valor Option com o valor de erro
   */
  err(): Option<E>;

  /**
   * Desencapsula o valor de sucesso ou lança um erro com mensagem de erro customizada
   * @param message
   */
  expect(message: string): T;

  /**
   * Executa uma função se o valor for um valor de sucesso
   * @param fn
   */
  and_then<R>(fn: (value: T) => Result<R, E>): Result<R, E>;

  /**
   * Versão assíncrona de and_then
   * @see and_then
   */
  and_then_async<R>(
    fn: (value: T) => Promise<Result<R, E>>,
  ): Promise<Result<R, E>>;
}

class OkValue<T, E> implements Result<T, E> {
  constructor(private value: T) {}

  is_err(): this is ErrValue<T, E> {
    return false;
  }

  is_ok(): this is OkValue<T, E> {
    return true;
  }

  unwrap(): T {
    return this.value;
  }

  unwrap_err(): E {
    throw new Error('Cannot unwrap_err on Ok value');
  }

  map<R>(fn: (value: T) => R): Result<R, E> {
    return Ok(fn(this.value));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map_err<U>(_fn?: (error: E) => U): Result<T, U> {
    return this as unknown as Result<T, U>;
  }

  match<R1, R2>(matcher: ResultMatcher<T, E, R1, R2>): R1 | R2 {
    return matcher.Ok(this.value);
  }

  ok(): Option<T> {
    return Some(this.value);
  }

  err(): Option<E> {
    return None;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expect(_message: string): T {
    return this.value;
  }

  /**
   * Executa uma função se o valor for um valor de sucesso
   * @param fn
   * @returns
   */
  and_then<R>(fn: (value: T) => Result<R, E>): Result<R, E> {
    return fn(this.value);
  }

  /**
   * Versão assíncrona de and_then
   * @param fn
   * @returns
   */
  async and_then_async<R>(
    fn: (value: T) => Promise<Result<R, E>>,
  ): Promise<Result<R, E>> {
    return fn(this.value);
  }
}

class ErrValue<T, E> implements Result<T, E> {
  constructor(public error: E) {}

  is_err(): this is ErrValue<T, E> {
    return true;
  }

  is_ok(): this is OkValue<T, E> {
    return false;
  }

  unwrap(): T {
    throw new Error('Cannot unwrap on Err value');
  }

  unwrap_err(): E {
    return this.error;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<R>(_fn: (value: T) => R): Result<R, E> {
    return this as unknown as Result<R, E>;
  }

  map_err<U>(fn?: (error: E) => U): Result<T, U> {
    if (typeof fn === 'function') {
      return Err(fn(this.error));
    }

    return this as unknown as Result<T, U>;
  }

  match<R1, R2>(matcher: ResultMatcher<T, E, R1, R2>): R1 | R2 {
    return matcher.Err(this.error);
  }

  ok(): Option<T> {
    return None;
  }

  err(): Option<E> {
    return Some(this.error);
  }

  expect(message: string): T {
    throw new TypeError(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  and_then<R>(_fn: (value: T) => Result<R, E>): Result<R, E> {
    return this as unknown as Result<R, E>;
  }

  and_then_async<R>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fn: (value: T) => Promise<Result<R, E>>,
  ): Promise<Result<R, E>> {
    return Promise.resolve(this as unknown as Result<R, E>);
  }
}

/**
 * Cria um valor Ok
 * @param value
 * @returns Valor Ok
 */
export function Ok(): OkValue<void, never>;
export function Ok<const T>(value: T): OkValue<T, never>;
export function Ok<const T>(value?: T): OkValue<T | void, never> {
  return new OkValue(value);
}

/**
 * Cria um valor Err
 * @param error
 * @returns Valor Err
 */
export function Err<const E>(error: E): ErrValue<never, E> {
  return new ErrValue(error);
}

import { Err, Ok, Result } from './result';

interface OptionMatcher<T, R1, R2> {
  Some(value: T): R1;
  None(): R2;
}

export interface Option<T> {
  /**
   * Retorna se o valor é None
   */
  is_none(): boolean;

  /**
   * Retorna se o valor é Some
   */
  is_some(): boolean;

  /**
   * Desembrulha o valor Some
   *
   * **CUIDADO**: Se o valor for `None`, lança um erro. Use `unwrap_or` para tratar o valor None.
   * @throws TypeError Se o valor for None
   */
  unwrap(): T;

  /**
   * desenvapsua o valor ou retorna um valor padrão
   * @param default_value Valor padrão
   */
  unwrap_or(default_value: T): T;

  /**
   * Mapeia o valor Some
   * @param fn Função de mapeamento
   */
  map<R>(fn: (value: T) => R): Option<R>;

  /**
   * Trata o valor Some e None
   * @param matcher Objeto com as funções de tratamento
   * @returns Resultado do tratamento
   * @template R1 Tipo de retorno para o valor Some
   * @template R2 Tipo de retorno para o valor None
   */
  match<R1, R2>(matcher: OptionMatcher<T, R1, R2>): R1 | R2;

  /**
   * Retorna um valor Ok com o valor Some ou um valor Err com o erro passado
   * @param error
   */
  ok_or<const E>(error: E): Result<T, E>;

  /**
   * Retorna o valor Some ou lança um erro com a mensagem passada
   * @param message
   */
  expect(message: string): T;
}

class SomeValue<T> implements Option<T> {
  constructor(private value: T) {}

  is_none(): boolean {
    return false;
  }

  is_some(): boolean {
    return true;
  }

  unwrap(): T {
    return this.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unwrap_or(_value: T): T {
    return this.value;
  }

  map<R>(fn: (value: T) => R): Option<R> {
    return Some(fn(this.value));
  }

  match<R1, R2>(matcher: OptionMatcher<T, R1, R2>): R1 | R2 {
    return matcher.Some(this.value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ok_or<const E>(_error: E): Result<T, E> {
    return Ok(this.value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expect(_message: string): T {
    return this.value;
  }
}

class NoneValue<T> implements Option<T> {
  is_none(): boolean {
    return true;
  }

  is_some(): boolean {
    return false;
  }

  unwrap(): T {
    throw new TypeError('unwrap() called on a None');
  }

  unwrap_or(value: T): T {
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<R>(_fn: (value: T) => R): Option<R> {
    return None;
  }

  match<R1, R2>(matcher: OptionMatcher<T, R1, R2>): R1 | R2 {
    return matcher.None();
  }

  ok_or<const E>(error: E): Result<T, E> {
    return Err(error);
  }

  expect(message: string): T {
    throw new TypeError(message);
  }
}

/**
 * Cria um valor Some
 * @param value
 * @returns Valor Some do Option
 */
export function Some<const T>(value: T): SomeValue<T> {
  return new SomeValue(value);
}

/** Valor None do Option */
export const None: NoneValue<never> = new NoneValue();

function is_nullish(value: unknown): value is null | undefined {
  return (value ?? null) === null;
}

/**
 * Converte um valor nulo ou indefinido para um Option
 * @param value
 * @returns Option
 * @template T Tipo do valor
 * @example
 * nullish_to_option(null) // None
 * nullish_to_option(undefined) // None
 * nullish_to_option(10) // Some(10)
 * nullish_to_option('') // Some('')
 * nullish_to_option({}) // Some({})
 */
function from_nullish<T>(value: T | null | undefined): Option<T> {
  return is_nullish(value) ? None : Some(value);
}

export const Option = {
  Some,
  None,
  from_nullish,
};

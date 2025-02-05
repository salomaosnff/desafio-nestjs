/**
 * Retorna se o valor é um objeto
 * @param value
 * @returns
 */
export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null;
}

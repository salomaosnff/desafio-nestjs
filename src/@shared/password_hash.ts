/**
 * Representa um serviço de hash de senha
 */
export interface PasswordHashPort {
  /**
   * Gera um hash para a senha
   * @param password Senha a ser hasheada
   */
  hash(password: string): Promise<string>;

  /**
   * Compara um hash com uma senha
   * @param hash Hash a ser comparado
   * @param password Senha a ser comparada
   */
  compare(hash: string, password: string): Promise<boolean>;
}

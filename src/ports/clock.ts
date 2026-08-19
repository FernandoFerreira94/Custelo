/**
 * Unica origem de tempo do sistema (Architecture Freeze).
 *
 * Dominio e casos de uso nunca chamam `new Date()`. Janela de notificacao,
 * aging e espera duravel so sao testaveis se o relogio for injetavel.
 */
export interface Clock {
  now(): Date;
}

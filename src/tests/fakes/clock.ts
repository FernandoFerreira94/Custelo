import type { Clock } from "@/ports/clock";

/**
 * Relogio deterministico para testes de janela, aging e espera.
 * Nunca usar em runtime de producao.
 */
export class FakeClock implements Clock {
  constructor(private current: Date) {}

  now(): Date {
    return new Date(this.current.getTime());
  }

  set(next: Date): void {
    this.current = new Date(next.getTime());
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

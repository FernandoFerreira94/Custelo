import type { Clock } from "@/ports/clock";

/** Relogio do sistema. Unico `new Date()` permitido no runtime. */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

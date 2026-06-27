import type { StatusSnapshot, CriticalStateResult } from '../types';
import { EventBus } from './EventBus';

const CLAMP = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

export class StatusSystem {
  private produtividade: number = 50;
  private estresse: number = 20;
  private dinheiro: number = 0;
  private amizades: Record<string, number> = {};

  getProductivity(): number { return this.produtividade; }
  getStress(): number { return this.estresse; }
  getMoney(): number { return this.dinheiro; }

  getFriendship(targetId: string): number {
    return this.amizades[targetId] ?? 0;
  }

  addProductivity(value: number): void {
    this.produtividade = CLAMP(this.produtividade + value, 0, 100);
    EventBus.emit('status:changed', this.getStatusSnapshot());
  }

  addStress(value: number): void {
    this.estresse = CLAMP(this.estresse + value, 0, 100);
    EventBus.emit('status:changed', this.getStatusSnapshot());
  }

  addMoney(value: number): void {
    this.dinheiro = Math.max(0, this.dinheiro + value);
    EventBus.emit('status:changed', this.getStatusSnapshot());
  }

  spendMoney(value: number): boolean {
    if (this.dinheiro < value) return false;
    this.dinheiro -= value;
    EventBus.emit('status:changed', this.getStatusSnapshot());
    return true;
  }

  addFriendship(targetId: string, value: number): void {
    const current = this.amizades[targetId] ?? 0;
    this.amizades = {
      ...this.amizades,
      [targetId]: CLAMP(current + value, 0, 100),
    };
    EventBus.emit('status:changed', this.getStatusSnapshot());
  }

  getStatusSnapshot(): StatusSnapshot {
    return {
      produtividade: this.produtividade,
      estresse: this.estresse,
      dinheiro: this.dinheiro,
      amizades: { ...this.amizades },
    };
  }

  checkCriticalState(): CriticalStateResult {
    if (this.produtividade <= 0) {
      return { flag: 'game_over_justa_causa', message: 'Game Over: justa causa corporativa.' };
    }
    if (this.estresse >= 100) {
      return { flag: 'burnout', message: 'Burnout: fim do turno atual.' };
    }
    if (this.produtividade <= 10) {
      return { flag: 'produtividade_critica', message: 'O Diretor Italiano está te olhando feio.' };
    }
    if (this.estresse >= 80) {
      return { flag: 'estresse_alto', message: 'Sua sanidade está por um fio.' };
    }
    return { flag: 'ok', message: '' };
  }
}

export const statusSystem = new StatusSystem();

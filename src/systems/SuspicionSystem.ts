import { EventBus } from './EventBus';

const MAX_SUSPICION = 100;
const GRACE_SECONDS = 3;
const RISE_RATE = 20;  // per second, after grace period
const FALL_RATE = 10;  // per second, when out of risky state

class SuspicionSystemClass {
  private suspicion = 0;
  private graceTimer = 0;
  private inRiskyState = false;
  private isPunishing = false;

  getSuspicion(): number {
    return this.suspicion;
  }

  addSuspicion(value: number): void {
    this.suspicion = Math.min(MAX_SUSPICION, this.suspicion + value);
    EventBus.emit('suspicion:changed', this.suspicion);
  }

  reduceSuspicion(value: number): void {
    this.suspicion = Math.max(0, this.suspicion - value);
    EventBus.emit('suspicion:changed', this.suspicion);
  }

  resetSuspicion(): void {
    this.suspicion = 0;
    this.graceTimer = 0;
    this.inRiskyState = false;
    this.isPunishing = false;
    EventBus.emit('suspicion:changed', this.suspicion);
  }

  isMaxed(): boolean {
    return this.suspicion >= MAX_SUSPICION;
  }

  setRiskyState(isRisky: boolean): void {
    if (!isRisky) {
      this.graceTimer = 0;
    }
    this.inRiskyState = isRisky;
  }

  setPunishing(punishing: boolean): void {
    this.isPunishing = punishing;
  }

  update(delta: number): void {
    if (this.isPunishing) return;

    const dt = delta / 1000;

    if (this.inRiskyState) {
      this.graceTimer += dt;
      if (this.graceTimer >= GRACE_SECONDS) {
        this.addSuspicion(RISE_RATE * dt);
      }
    } else {
      this.graceTimer = 0;
      if (this.suspicion > 0) {
        this.reduceSuspicion(FALL_RATE * dt);
      }
    }

    if (!this.isPunishing && this.isMaxed()) {
      this.isPunishing = true;
      EventBus.emit('suspicion:maxed', undefined);
    }
  }
}

export const suspicionSystem = new SuspicionSystemClass();

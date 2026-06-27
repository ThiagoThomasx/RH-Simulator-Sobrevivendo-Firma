type Listener<T = unknown> = (payload: T) => void;

class EventBusClass {
  private listeners: Map<string, Listener[]> = new Map();

  on<T = unknown>(event: string, listener: Listener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener as Listener);
  }

  off<T = unknown>(event: string, listener: Listener<T>): void {
    const list = this.listeners.get(event);
    if (!list) return;
    const idx = list.indexOf(listener as Listener);
    if (idx !== -1) list.splice(idx, 1);
  }

  emit<T = unknown>(event: string, payload?: T): void {
    const list = this.listeners.get(event);
    if (!list) return;
    for (const fn of list) fn(payload as unknown);
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const EventBus = new EventBusClass();

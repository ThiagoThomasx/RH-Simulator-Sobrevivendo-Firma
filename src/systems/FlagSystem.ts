class FlagSystemClass {
  private flags: Set<string> = new Set();

  setFlag(flag: string): void {
    this.flags.add(flag);
  }

  unsetFlag(flag: string): void {
    this.flags.delete(flag);
  }

  hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  hasAllFlags(flags: string[]): boolean {
    return flags.every(f => this.flags.has(f));
  }

  hasAnyFlag(flags: string[]): boolean {
    return flags.some(f => this.flags.has(f));
  }

  getSnapshot(): string[] {
    return Array.from(this.flags);
  }

  reset(): void {
    this.flags.clear();
  }
}

export const flagSystem = new FlagSystemClass();

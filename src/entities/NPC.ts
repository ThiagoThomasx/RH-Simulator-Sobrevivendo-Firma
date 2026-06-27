import Phaser from 'phaser';
import type { CharacterData, NPCState } from '../types/character.types';

const SECTOR_COLORS: Record<string, number> = {
  rh: 0x9b59b6,
  pre_vendas: 0x3498db,
  ti: 0x00bcd4,
  dp: 0xe67e22,
  governanca: 0x7f8c8d,
  marketing: 0xe91e63,
  operacoes: 0x27ae60,
  apoio: 0xf39c12,
  diretoria: 0xf1c40f,
  player: 0x4488ff,
};

export class NPC {
  private readonly container: Phaser.GameObjects.Container;
  private readonly characterData: CharacterData;
  private state: NPCState = 'idle';

  constructor(scene: Phaser.Scene, data: CharacterData) {
    this.characterData = data;
    const color = SECTOR_COLORS[data.sector] ?? 0xaaaaaa;

    const body = scene.add.rectangle(0, 0, 14, 14, color);

    const label = scene.add
      .text(0, -12, data.nickname || data.name, {
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: '#00000099',
        padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5, 1);

    this.container = scene.add
      .container(data.initialPosition.x, data.initialPosition.y, [body, label])
      .setDepth(10);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  interact(): void {
    // placeholder — extended in future sprints
  }

  getCharacterData(): CharacterData {
    return this.characterData;
  }

  setState(state: NPCState): void {
    this.state = state;
  }

  getState(): NPCState {
    return this.state;
  }

  destroy(): void {
    this.container.destroy();
  }
}

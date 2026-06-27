import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game.config';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Placeholder visual — será substituído pelo mapa + jogador na Sprint 1
    this.add
      .text(cx, cy - 24, 'RH Simulator', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 32, 'Sobrevivendo à Firma', {
        fontSize: '24px',
        color: '#aaaacc',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 80, 'Sprint 0 — Fundação', {
        fontSize: '14px',
        color: '#555577',
      })
      .setOrigin(0.5);
  }
}

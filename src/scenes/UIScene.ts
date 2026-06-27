import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/game.config';

const HUD_HEIGHT = 36;
const HUD_PADDING = 12;
const HUD_Y = 8;

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.createHudBackground();
    this.createHudText();
  }

  private createHudBackground(): void {
    const bg = this.add.rectangle(0, 0, GAME_WIDTH, HUD_HEIGHT, 0x0d0d1a, 0.85);
    bg.setOrigin(0, 0);

    // Linha separadora
    const line = this.add.rectangle(0, HUD_HEIGHT, GAME_WIDTH, 1, 0x333366, 1);
    line.setOrigin(0, 0);
  }

  private createHudText(): void {
    // Placeholder — será substituído por valores dinâmicos na Sprint 2+
    this.add.text(HUD_PADDING, HUD_Y, 'HUD: Produtividade | Estresse | Dinheiro | Dia | Missão', {
      fontSize: '13px',
      color: '#99aacc',
    });
  }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game.config';

const BAR_WIDTH = 400;
const BAR_HEIGHT = 20;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingBar();

    // Assets do jogo serão carregados aqui nas próximas sprints
    // Ex: this.load.tilemapTiledJSON('map', 'assets/map.json');
    //     this.load.spritesheet('player', 'assets/player.png', { ... });
  }

  create(): void {
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  private createLoadingBar(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const label = this.add.text(cx, cy - 40, 'Carregando...', {
      fontSize: '18px',
      color: '#ffffff',
    });
    label.setOrigin(0.5);

    const barBg = this.add.rectangle(cx, cy, BAR_WIDTH, BAR_HEIGHT, 0x333355);
    barBg.setOrigin(0.5);

    const bar = this.add.rectangle(
      cx - BAR_WIDTH / 2,
      cy,
      0,
      BAR_HEIGHT,
      0x6699ff
    );
    bar.setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      bar.width = BAR_WIDTH * value;
    });
  }
}

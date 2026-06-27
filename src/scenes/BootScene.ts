import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Carrega assets globais mínimos necessários antes do Preload
    // Ex: logo de loading, fontes bitmap, atlas de UI
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}

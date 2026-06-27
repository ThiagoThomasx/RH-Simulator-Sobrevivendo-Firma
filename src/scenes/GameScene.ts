import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game.config';
import { Player } from '../entities/Player';
import { PlayerController } from '../systems/PlayerController';
import { OfficeMap, MAP_WIDTH, MAP_HEIGHT } from '../maps/OfficeMap';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private controller!: PlayerController;
  private officeMap!: OfficeMap;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    this.officeMap = new OfficeMap(this);

    const spawnX = GAME_WIDTH / 2;
    const spawnY = MAP_HEIGHT / 2;
    this.player = new Player(this, spawnX, spawnY);

    this.physics.add.collider(this.player.sprite, this.officeMap.staticGroup);

    this.controller = new PlayerController(this);

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
  }

  update(): void {
    this.controller.update(this.player);
  }
}

export { GAME_WIDTH, GAME_HEIGHT };

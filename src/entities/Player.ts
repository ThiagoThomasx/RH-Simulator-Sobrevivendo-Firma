import Phaser from 'phaser';

export const PLAYER_SPEED = 160;
export const PLAYER_SIZE = 16;

export class Player {
  readonly sprite: Phaser.GameObjects.Rectangle;
  private _movementLocked = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, PLAYER_SIZE, PLAYER_SIZE, 0x4488ff);
    scene.physics.add.existing(this.sprite);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
  }

  get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  lockMovement(): void {
    this._movementLocked = true;
  }

  unlockMovement(): void {
    this._movementLocked = false;
  }

  get isMovementLocked(): boolean {
    return this._movementLocked;
  }
}

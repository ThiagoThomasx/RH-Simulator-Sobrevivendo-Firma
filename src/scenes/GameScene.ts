import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game.config';
import { Player } from '../entities/Player';
import { PlayerController } from '../systems/PlayerController';
import { OfficeMap, MAP_WIDTH, MAP_HEIGHT } from '../maps/OfficeMap';
import { statusSystem } from '../systems/StatusSystem';
import { timeSystem } from '../systems/TimeSystem';
import { npcSystem } from '../systems/NPCSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { dialogueSystem } from '../systems/DialogueSystem';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private controller!: PlayerController;
  private officeMap!: OfficeMap;
  private interactionSystem!: InteractionSystem;
  private debugKeys!: Record<string, Phaser.Input.Keyboard.Key>;

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

    npcSystem.createNPCs(this);
    this.interactionSystem = new InteractionSystem(this);

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this._setupDebugKeys();
  }

  update(_time: number, delta: number): void {
    this.controller.update(this.player);
    timeSystem.update(delta);
    this.interactionSystem.update(this.player);
    dialogueSystem.update();
    this._handleDebugInput();
  }

  // --- Debug keys (remove before release) ---

  private _setupDebugKeys(): void {
    const kb = this.input.keyboard!;
    this.debugKeys = {
      one: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two: kb.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      three: kb.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      four: kb.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      five: kb.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
      six: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
      seven: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
    };
  }

  private _handleDebugInput(): void {
    const k = this.debugKeys;
    if (Phaser.Input.Keyboard.JustDown(k.one))   statusSystem.addProductivity(-10);
    if (Phaser.Input.Keyboard.JustDown(k.two))   statusSystem.addProductivity(10);
    if (Phaser.Input.Keyboard.JustDown(k.three)) statusSystem.addStress(10);
    if (Phaser.Input.Keyboard.JustDown(k.four))  statusSystem.addStress(-10);
    if (Phaser.Input.Keyboard.JustDown(k.five))  statusSystem.addMoney(30);
    if (Phaser.Input.Keyboard.JustDown(k.six))   timeSystem.consumeMinutes(30);
    if (Phaser.Input.Keyboard.JustDown(k.seven)) timeSystem.consumeMinutes(180);
  }
}

export { GAME_WIDTH, GAME_HEIGHT };

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
import { missionSystem } from '../systems/MissionSystem';
import { flagSystem } from '../systems/FlagSystem';

import missionsData from '../data/missions.json';
import testDialogue from '../data/dialogues/test-first-conversation.json';
import type { MissionData } from '../types/mission.types';
import type { DialogueFile } from '../types/dialogue.types';

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

    // Load narrative data
    missionSystem.loadMissions(missionsData as MissionData[]);
    dialogueSystem.registerDialogue(testDialogue as DialogueFile);

    this._setupDebugKeys();
  }

  update(_time: number, delta: number): void {
    this.controller.update(this.player);
    timeSystem.update(delta);
    this.interactionSystem.update(this.player);
    dialogueSystem.update();
    this._handleDebugInput();
  }

  // --- Debug keys ---

  private _setupDebugKeys(): void {
    const kb = this.input.keyboard!;
    this.debugKeys = {
      one:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      three: kb.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      four:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      five:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
      six:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
      seven: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
      m:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.M),
      f:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      o:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.O),
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

    if (Phaser.Input.Keyboard.JustDown(k.m)) {
      missionSystem.startMission('test_first_conversation');
    }

    if (Phaser.Input.Keyboard.JustDown(k.f)) {
      console.log('[DEBUG] Flags:', flagSystem.getSnapshot());
    }

    if (Phaser.Input.Keyboard.JustDown(k.o)) {
      console.log('[DEBUG] Missions:', JSON.stringify(missionSystem.getSnapshot(), null, 2));
    }
  }
}

export { GAME_WIDTH, GAME_HEIGHT };

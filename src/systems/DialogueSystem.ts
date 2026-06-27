import Phaser from 'phaser';
import type { CharacterData } from '../types/character.types';
import type { Player } from '../entities/Player';
import { EventBus } from './EventBus';

const BOX_MARGIN = 20;
const BOX_H = 185;
const DEPTH = 200;

class DialogueSystemClass {
  private _isOpen = false;
  private objects: Phaser.GameObjects.GameObject[] = [];
  private enterKey: Phaser.Input.Keyboard.Key | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private player: Player | null = null;
  private boundScene: Phaser.Scene | null = null;
  private readonly onPointerDown: () => void;

  constructor() {
    this.onPointerDown = () => this._close();
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  open(scene: Phaser.Scene, data: CharacterData, player: Player): void {
    if (this._isOpen) return;
    this._isOpen = true;
    this.player = player;
    this.boundScene = scene;
    player.lockMovement();

    this._buildUI(scene, data);

    this.enterKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    scene.input.on('pointerdown', this.onPointerDown);
  }

  update(): void {
    if (!this._isOpen || !this.enterKey || !this.spaceKey) return;
    if (
      Phaser.Input.Keyboard.JustDown(this.enterKey) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey)
    ) {
      this._close();
    }
  }

  private _buildUI(scene: Phaser.Scene, data: CharacterData): void {
    const gameWidth = scene.scale.width;
    const gameHeight = scene.scale.height;
    const boxY = gameHeight - BOX_H - BOX_MARGIN;
    const boxW = gameWidth - BOX_MARGIN * 2;

    const bg = scene.add.graphics();
    bg.fillStyle(0x0d0d1a, 0.94);
    bg.fillRoundedRect(BOX_MARGIN, boxY, boxW, BOX_H, 10);
    bg.lineStyle(1.5, 0x4488ff, 0.7);
    bg.strokeRoundedRect(BOX_MARGIN, boxY, boxW, BOX_H, 10);
    // separator line under name
    bg.fillStyle(0x334466, 0.8);
    bg.fillRect(BOX_MARGIN + 16, boxY + 36, boxW - 32, 1);
    bg.setScrollFactor(0).setDepth(DEPTH);
    this.objects.push(bg);

    const nameText = scene.add
      .text(BOX_MARGIN + 16, boxY + 10, data.name, {
        fontSize: '14px',
        color: '#88aaff',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.objects.push(nameText);

    const roleText = scene.add
      .text(BOX_MARGIN + 16 + nameText.width + 10, boxY + 13, `— ${data.role}`, {
        fontSize: '11px',
        color: '#556688',
      })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.objects.push(roleText);

    const bodyText = scene.add
      .text(BOX_MARGIN + 16, boxY + 46, data.defaultDialogue, {
        fontSize: '13px',
        color: '#dde4f0',
        wordWrap: { width: boxW - 32 },
        lineSpacing: 5,
      })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.objects.push(bodyText);

    const hintText = scene.add
      .text(BOX_MARGIN + boxW - 16, boxY + BOX_H - 10, '[ Enter / Espaço / Clique ] Continuar', {
        fontSize: '10px',
        color: '#445566',
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.objects.push(hintText);
  }

  private _close(): void {
    if (!this._isOpen) return;
    this._isOpen = false;

    this.player?.unlockMovement();
    this.boundScene?.input.off('pointerdown', this.onPointerDown);

    for (const obj of this.objects) obj.destroy();
    this.objects = [];
    this.enterKey = null;
    this.spaceKey = null;
    this.player = null;
    this.boundScene = null;

    EventBus.emit('dialogue:closed');
  }
}

export const dialogueSystem = new DialogueSystemClass();

import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import type { NPC } from '../entities/NPC';
import { npcSystem } from './NPCSystem';
import { dialogueSystem } from './DialogueSystem';

const INTERACTION_RADIUS = 72;

export class InteractionSystem {
  private readonly scene: Phaser.Scene;
  private readonly promptText: Phaser.GameObjects.Text;
  private readonly eKey: Phaser.Input.Keyboard.Key;
  private nearestNPC: NPC | undefined = undefined;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.eKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    const gameWidth = scene.scale.width;
    const gameHeight = scene.scale.height;

    this.promptText = scene.add
      .text(gameWidth / 2, gameHeight - 26, '[ E ] Conversar', {
        fontSize: '13px',
        color: '#ffe066',
        backgroundColor: '#000000bb',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(150)
      .setVisible(false);
  }

  update(player: Player): void {
    if (dialogueSystem.isOpen) {
      this.promptText.setVisible(false);
      return;
    }

    this.nearestNPC = npcSystem.getNearestInteractableNPC(
      player.x,
      player.y,
      INTERACTION_RADIUS
    );

    this.promptText.setVisible(this.nearestNPC !== undefined);

    if (this.nearestNPC && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      dialogueSystem.open(this.scene, this.nearestNPC.getCharacterData(), player);
    }
  }
}

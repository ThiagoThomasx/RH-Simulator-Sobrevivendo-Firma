import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import type { NPC } from '../entities/NPC';
import { npcSystem } from './NPCSystem';
import { dialogueSystem } from './DialogueSystem';
import { missionSystem } from './MissionSystem';

const INTERACTION_RADIUS = 72;

// Maps NPC id → dialogue id to open when a related mission is available/active
const NPC_MISSION_DIALOGUE: Record<string, { missionId: string; dialogueId: string }> = {
  rafa: {
    missionId: 'test_first_conversation',
    dialogueId: 'test_first_conversation_dialogue',
  },
};

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
      this._interact(this.nearestNPC, player);
    }
  }

  private _interact(npc: NPC, player: Player): void {
    const npcId = npc.getCharacterData().id;
    const mapping = NPC_MISSION_DIALOGUE[npcId];

    if (mapping) {
      const mission = missionSystem.getMissionById(mapping.missionId);
      if (mission && (mission.status === 'available' || mission.status === 'active')) {
        if (mission.status === 'available') {
          missionSystem.startMission(mapping.missionId);
        }
        dialogueSystem.openById(mapping.dialogueId, this.scene, player);
        return;
      }
    }

    // Fall back to generic dialogue
    dialogueSystem.open(this.scene, npc.getCharacterData(), player);
  }
}

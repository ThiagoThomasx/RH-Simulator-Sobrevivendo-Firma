import type Phaser from 'phaser';
import { NPC } from '../entities/NPC';
import type { CharacterData, NPCState } from '../types/character.types';
import charactersData from '../data/characters.json';

class NPCSystemClass {
  private npcs: Map<string, NPC> = new Map();

  createNPCs(scene: Phaser.Scene): void {
    this.npcs.clear();

    for (const raw of charactersData) {
      const data = raw as CharacterData;
      if (data.id === 'tiago') continue;
      const npc = new NPC(scene, data);
      this.npcs.set(data.id, npc);
    }
  }

  getNPCById(id: string): NPC | undefined {
    return this.npcs.get(id);
  }

  getNearestInteractableNPC(playerX: number, playerY: number, radius: number): NPC | undefined {
    let nearest: NPC | undefined;
    let nearestDist = radius;

    for (const npc of this.npcs.values()) {
      if (!npc.getCharacterData().interactable) continue;
      if (npc.getState() === 'unavailable') continue;

      const dx = npc.x - playerX;
      const dy = npc.y - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = npc;
      }
    }

    return nearest;
  }

  getAllNPCs(): NPC[] {
    return Array.from(this.npcs.values());
  }

  setNPCState(id: string, state: NPCState): void {
    const npc = this.npcs.get(id);
    if (npc) npc.setState(state);
  }
}

export const npcSystem = new NPCSystemClass();

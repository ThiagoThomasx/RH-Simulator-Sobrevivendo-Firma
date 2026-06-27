import type { DialogueEffect } from '../types/dialogue.types';
import { statusSystem } from './StatusSystem';
import { flagSystem } from './FlagSystem';
import { missionSystem } from './MissionSystem';

class EffectResolverClass {
  applyEffects(effects: DialogueEffect | DialogueEffect[] | undefined): void {
    if (!effects) return;

    const list = Array.isArray(effects) ? effects : [effects];
    for (const effect of list) {
      this._apply(effect);
    }
  }

  private _apply(effect: DialogueEffect): void {
    if (effect.productivityDelta !== undefined) {
      statusSystem.addProductivity(effect.productivityDelta);
    }

    if (effect.stressDelta !== undefined) {
      statusSystem.addStress(effect.stressDelta);
    }

    if (effect.moneyDelta !== undefined) {
      statusSystem.addMoney(effect.moneyDelta);
    }

    if (effect.friendshipDelta !== undefined) {
      statusSystem.addFriendship(effect.friendshipDelta.targetId, effect.friendshipDelta.value);
    }

    if (effect.setFlags) {
      for (const flag of effect.setFlags) flagSystem.setFlag(flag);
    }

    if (effect.unsetFlags) {
      for (const flag of effect.unsetFlags) flagSystem.unsetFlag(flag);
    }

    if (effect.startMission) {
      missionSystem.startMission(effect.startMission);
    }

    if (effect.completeObjective) {
      const active = missionSystem.getActiveMission();
      if (active) {
        missionSystem.completeObjective(active.id, effect.completeObjective);
      }
    }

    if (effect.completeMission) {
      missionSystem.completeMission(effect.completeMission);
    }

    if (effect.failMission) {
      missionSystem.failMission(effect.failMission);
    }
  }
}

export const effectResolver = new EffectResolverClass();

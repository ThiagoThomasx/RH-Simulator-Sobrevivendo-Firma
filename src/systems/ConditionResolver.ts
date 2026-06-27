import type { DialogueCondition } from '../types/dialogue.types';
import { statusSystem } from './StatusSystem';
import { flagSystem } from './FlagSystem';

class ConditionResolverClass {
  areConditionsMet(conditions?: DialogueCondition): boolean {
    if (!conditions) return true;

    if (conditions.requiredFlags && !flagSystem.hasAllFlags(conditions.requiredFlags)) {
      return false;
    }

    if (conditions.blockedFlags && flagSystem.hasAnyFlag(conditions.blockedFlags)) {
      return false;
    }

    if (conditions.requiredMoney !== undefined) {
      if (statusSystem.getMoney() < conditions.requiredMoney) return false;
    }

    if (conditions.requiredFriendship !== undefined) {
      const { targetId, min } = conditions.requiredFriendship;
      if (statusSystem.getFriendship(targetId) < min) return false;
    }

    if (conditions.maxStress !== undefined) {
      if (statusSystem.getStress() > conditions.maxStress) return false;
    }

    if (conditions.minProductivity !== undefined) {
      if (statusSystem.getProductivity() < conditions.minProductivity) return false;
    }

    return true;
  }
}

export const conditionResolver = new ConditionResolverClass();

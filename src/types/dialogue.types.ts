export interface DialogueCondition {
  requiredFlags?: string[];
  blockedFlags?: string[];
  requiredMoney?: number;
  requiredFriendship?: { targetId: string; min: number };
  maxStress?: number;
  minProductivity?: number;
}

export interface DialogueEffect {
  productivityDelta?: number;
  stressDelta?: number;
  moneyDelta?: number;
  friendshipDelta?: { targetId: string; value: number };
  setFlags?: string[];
  unsetFlags?: string[];
  completeObjective?: string;
  startMission?: string;
  completeMission?: string;
  failMission?: string;
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId?: string;
  effects?: DialogueEffect;
  conditions?: DialogueCondition;
  disabledText?: string;
}

export interface DialogueNode {
  id: string;
  speakerId: string;
  speakerName?: string;
  text: string;
  choices?: DialogueChoice[];
  effects?: DialogueEffect;
  nextNodeId?: string;
  endDialogue?: boolean;
}

export interface DialogueFile {
  id: string;
  characterId?: string;
  missionId?: string;
  startNodeId: string;
  nodes: DialogueNode[];
}

export interface DialogueState {
  dialogueId: string;
  currentNodeId: string;
  isOpen: boolean;
}

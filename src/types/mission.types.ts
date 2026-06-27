export type MissionStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';

export type ObjectiveType =
  | 'talk_to_npc'
  | 'interact_with_object'
  | 'go_to_area'
  | 'collect_item'
  | 'choose_dialogue'
  | 'complete_minigame'
  | 'wait_until_time'
  | 'custom';

export interface MissionObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  targetId?: string;
  completed: boolean;
  optional?: boolean;
}

export interface MissionReward {
  productivityDelta?: number;
  stressDelta?: number;
  moneyDelta?: number;
  friendshipDelta?: { targetId: string; value: number };
  setFlags?: string[];
}

export interface MissionData {
  id: string;
  title: string;
  description: string;
  day?: number;
  trigger?: string;
  status: MissionStatus;
  objectives: MissionObjective[];
  rewards?: MissionReward;
  failureEffects?: MissionReward;
}

export interface MissionProgress {
  id: string;
  title: string;
  status: MissionStatus;
  totalObjectives: number;
  completedObjectives: number;
  currentObjective?: MissionObjective;
}

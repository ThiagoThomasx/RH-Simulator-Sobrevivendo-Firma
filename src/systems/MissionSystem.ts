import type { MissionData, MissionStatus, MissionProgress } from '../types/mission.types';
import { EventBus } from './EventBus';

class MissionSystemClass {
  private missions: Map<string, MissionData> = new Map();

  loadMissions(missions: MissionData[]): void {
    for (const m of missions) {
      this.missions.set(m.id, { ...m, objectives: m.objectives.map(o => ({ ...o })) });
    }
  }

  getMissionById(id: string): MissionData | undefined {
    return this.missions.get(id);
  }

  getActiveMission(): MissionData | undefined {
    for (const m of this.missions.values()) {
      if (m.status === 'active') return m;
    }
    return undefined;
  }

  getAllMissions(): MissionData[] {
    return Array.from(this.missions.values());
  }

  startMission(id: string): boolean {
    const mission = this.missions.get(id);
    if (!mission) return false;
    if (mission.status !== 'available') return false;

    const active = this.getActiveMission();
    if (active) return false;

    mission.status = 'active';
    EventBus.emit('mission:started', { missionId: id, title: mission.title });
    return true;
  }

  completeObjective(missionId: string, objectiveId: string): boolean {
    const mission = this.missions.get(missionId);
    if (!mission || mission.status !== 'active') return false;

    const obj = mission.objectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return false;

    obj.completed = true;
    EventBus.emit('mission:objective_completed', { missionId, objectiveId });
    return true;
  }

  completeMission(id: string): boolean {
    const mission = this.missions.get(id);
    if (!mission || mission.status !== 'active') return false;

    const required = mission.objectives.filter(o => !o.optional);
    if (!required.every(o => o.completed)) return false;

    mission.status = 'completed';
    EventBus.emit('mission:completed', { missionId: id, title: mission.title });
    return true;
  }

  failMission(id: string): boolean {
    const mission = this.missions.get(id);
    if (!mission || mission.status !== 'active') return false;

    mission.status = 'failed';
    EventBus.emit('mission:failed', { missionId: id });
    return true;
  }

  getMissionProgress(id: string): MissionProgress | undefined {
    const mission = this.missions.get(id);
    if (!mission) return undefined;

    const required = mission.objectives.filter(o => !o.optional);
    const completed = required.filter(o => o.completed).length;
    const currentObjective = mission.objectives.find(o => !o.completed);

    return {
      id: mission.id,
      title: mission.title,
      status: mission.status,
      totalObjectives: required.length,
      completedObjectives: completed,
      currentObjective,
    };
  }

  setMissionStatus(id: string, status: MissionStatus): void {
    const mission = this.missions.get(id);
    if (mission) mission.status = status;
  }

  getSnapshot(): Array<{ id: string; title: string; status: MissionStatus; objectives: Array<{ id: string; completed: boolean }> }> {
    return Array.from(this.missions.values()).map(m => ({
      id: m.id,
      title: m.title,
      status: m.status,
      objectives: m.objectives.map(o => ({ id: o.id, completed: o.completed })),
    }));
  }
}

export const missionSystem = new MissionSystemClass();

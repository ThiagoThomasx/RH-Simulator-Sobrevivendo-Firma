import Phaser from 'phaser';
import type { NPC } from '../entities/NPC';
import type { Player } from '../entities/Player';
import { npcSystem } from './NPCSystem';
import { suspicionSystem } from './SuspicionSystem';
import { zoneSystem } from './ZoneSystem';
import { dialogueSystem } from './DialogueSystem';
import { EventBus } from './EventBus';

const PATROL_SPEED = 65;          // px/s — slower than player (160)
const WAYPOINT_RADIUS = 14;       // px — "arrived" threshold
const PAUSE_MIN = 1000;           // ms
const PAUSE_MAX = 2000;           // ms
const CONE_RANGE = 220;           // px
const CONE_HALF_ANGLE = Math.PI / 4; // 45° each side → 90° total

interface Waypoint {
  x: number;
  y: number;
}

// Route: RH desk → corridor left → corridor + copa side → near DP → corridor center → back to RH
const BOSS_WAYPOINTS: Waypoint[] = [
  { x: 280, y: 180 },   // 1. Área do RH (mesa da Renata)
  { x: 640, y: 530 },   // 2. Corredor central
  { x: 1870, y: 530 },  // 3. Entrada da Copa (corredor lateral)
  { x: 1400, y: 180 },  // 4. Próximo ao DP
  { x: 640, y: 530 },   // 5. Corredor central novamente
];

class PatrolSystemClass {
  private bossNPC: NPC | null = null;
  private player: Player | null = null;

  private waypointIndex = 0;
  private pauseTimer = 0;         // ms remaining in current pause
  private isPaused = false;

  private facingAngle = 0;        // radians

  private coneGraphics: Phaser.GameObjects.Graphics | null = null;
  private coneVisible = false;

  private playerInCone = false;

  init(scene: Phaser.Scene, player: Player): void {
    this.player = player;
    this.bossNPC = npcSystem.getNPCById('chefe_rh') ?? null;

    if (!this.bossNPC) {
      console.warn('[PatrolSystem] chefe_rh NPC not found');
      return;
    }

    this.coneGraphics = scene.add.graphics().setDepth(15); // scene used only here
    this.facingAngle = Math.PI / 2; // face downward initially

    EventBus.on('suspicion:maxed', () => this._onSuspicionMaxed());
  }

  toggleConeDebug(): void {
    this.coneVisible = !this.coneVisible;
    if (!this.coneVisible) {
      this.coneGraphics?.clear();
    }
  }

  update(delta: number): void {
    if (!this.bossNPC || dialogueSystem.isOpen) return;

    this._movePatrol(delta);
    this._updateConeDetection();
    this._drawCone();
  }

  private _movePatrol(delta: number): void {
    if (this.isPaused) {
      this.pauseTimer -= delta;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
        this.waypointIndex = (this.waypointIndex + 1) % BOSS_WAYPOINTS.length;
      }
      return;
    }

    const target = BOSS_WAYPOINTS[this.waypointIndex];
    const bx = this.bossNPC!.x;
    const by = this.bossNPC!.y;

    const dx = target.x - bx;
    const dy = target.y - by;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= WAYPOINT_RADIUS) {
      this.bossNPC!.setPosition(target.x, target.y);
      this.isPaused = true;
      this.pauseTimer = PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN);
      return;
    }

    const dt = delta / 1000;
    const move = Math.min(PATROL_SPEED * dt, dist);
    const nx = dx / dist;
    const ny = dy / dist;

    this.bossNPC!.setPosition(bx + nx * move, by + ny * move);
    this.facingAngle = Math.atan2(ny, nx);
  }

  private _updateConeDetection(): void {
    if (!this.player || !this.bossNPC) return;

    const inCone = this._checkPlayerInCone(this.player.x, this.player.y);
    const zone = zoneSystem.getZoneAt(this.player.x, this.player.y);
    const isRisky = zoneSystem.isRiskZoneForPlayer(zone?.id ?? null);
    const playerMoving = this.player.isMoving();

    const wasInCone = this.playerInCone;
    this.playerInCone = inCone;

    if (inCone !== wasInCone) {
      EventBus.emit('patrol:player_in_cone', inCone);
    }

    // All conditions must hold to accumulate suspicion
    const riskyCondition = inCone && isRisky && !playerMoving && !dialogueSystem.isOpen;
    suspicionSystem.setRiskyState(riskyCondition);
  }

  private _checkPlayerInCone(px: number, py: number): boolean {
    if (!this.bossNPC) return false;

    const bx = this.bossNPC.x;
    const by = this.bossNPC.y;

    const dx = px - bx;
    const dy = py - by;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > CONE_RANGE) return false;

    const angleToPlayer = Math.atan2(dy, dx);
    let diff = angleToPlayer - this.facingAngle;
    // Normalise to [-π, π]
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    return Math.abs(diff) <= CONE_HALF_ANGLE;
  }

  private _drawCone(): void {
    if (!this.coneGraphics || !this.bossNPC) return;
    this.coneGraphics.clear();
    if (!this.coneVisible) return;

    const bx = this.bossNPC.x;
    const by = this.bossNPC.y;
    const color = this.playerInCone ? 0xff4400 : 0xffcc00;
    const alpha = this.playerInCone ? 0.30 : 0.18;

    this.coneGraphics.fillStyle(color, alpha);
    this.coneGraphics.lineStyle(1.5, color, 0.7);

    const startAngle = this.facingAngle - CONE_HALF_ANGLE;
    const endAngle = this.facingAngle + CONE_HALF_ANGLE;
    const steps = 20;

    this.coneGraphics.beginPath();
    this.coneGraphics.moveTo(bx, by);
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps);
      this.coneGraphics.lineTo(bx + Math.cos(angle) * CONE_RANGE, by + Math.sin(angle) * CONE_RANGE);
    }
    this.coneGraphics.closePath();
    this.coneGraphics.fillPath();
    this.coneGraphics.strokePath();
  }

  private _onSuspicionMaxed(): void {
    dialogueSystem.startDialogueById('boss_rh_suspicion');
    const onClose = () => {
      suspicionSystem.resetSuspicion();
      EventBus.off('dialogue:closed', onClose);
    };
    EventBus.on('dialogue:closed', onClose);
  }
}

export const patrolSystem = new PatrolSystemClass();

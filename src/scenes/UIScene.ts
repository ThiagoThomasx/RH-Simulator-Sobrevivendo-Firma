import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/game.config';
import { statusSystem } from '../systems/StatusSystem';
import { timeSystem } from '../systems/TimeSystem';
import { missionSystem } from '../systems/MissionSystem';
import { EventBus } from '../systems/EventBus';
import type { StatusSnapshot } from '../types';

// Layout constants
const HUD_HEIGHT = 56;
const PAD = 10;
const BAR_W = 90;
const BAR_H = 10;
const BAR_TOP = 20;
const ROW2 = 38;

// Colors
const C_BG        = 0x0d0d1a;
const C_BORDER    = 0x333366;
const C_PROD_FULL = 0x44bb66;
const C_PROD_LOW  = 0xcc3333;
const C_STRESS    = 0xdd4444;
const C_STRESS_HI = 0xff2200;
const C_ALERT_BG  = 0x220000;

const ALERT_DURATION = 3500;
const MISSION_ALERT_DURATION = 4000;

export class UIScene extends Phaser.Scene {
  // HUD background / chrome
  private hudBg!: Phaser.GameObjects.Rectangle;
  private separator!: Phaser.GameObjects.Rectangle;
  private stressOverlay!: Phaser.GameObjects.Rectangle;

  // Bars
  private prodBarBg!: Phaser.GameObjects.Rectangle;
  private prodBar!: Phaser.GameObjects.Rectangle;
  private stressBarBg!: Phaser.GameObjects.Rectangle;
  private stressBar!: Phaser.GameObjects.Rectangle;

  // Texts
  private prodLabel!: Phaser.GameObjects.Text;
  private stressLabel!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private diaText!: Phaser.GameObjects.Text;
  private horaText!: Phaser.GameObjects.Text;
  private turnoText!: Phaser.GameObjects.Text;
  private missionTitleText!: Phaser.GameObjects.Text;
  private missionObjText!: Phaser.GameObjects.Text;

  // Alert
  private alertBg!: Phaser.GameObjects.Rectangle;
  private alertText!: Phaser.GameObjects.Text;
  private alertTween?: Phaser.Tweens.Tween;
  private alertTimer?: Phaser.Time.TimerEvent;

  // Pulse tween for stress overlay
  private stressPulseTween?: Phaser.Tweens.Tween;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this._createHudChrome();
    this._createBars();
    this._createTexts();
    this._createStressOverlay();
    this._createAlertArea();
    this._subscribeEvents();
    this._refreshAll();
  }

  // ------------------------------------------------------------------ chrome

  private _createHudChrome(): void {
    this.hudBg = this.add.rectangle(0, 0, GAME_WIDTH, HUD_HEIGHT, C_BG, 0.92);
    this.hudBg.setOrigin(0, 0);

    this.separator = this.add.rectangle(0, HUD_HEIGHT, GAME_WIDTH, 1, C_BORDER, 1);
    this.separator.setOrigin(0, 0);
  }

  // ------------------------------------------------------------------- bars

  private _createBars(): void {
    const prodX = PAD;

    this.add.text(prodX, 6, 'PROD', { fontSize: '9px', color: '#667799' });
    this.prodBarBg = this.add.rectangle(prodX, BAR_TOP, BAR_W, BAR_H, 0x223322);
    this.prodBarBg.setOrigin(0, 0);
    this.prodBar = this.add.rectangle(prodX, BAR_TOP, BAR_W, BAR_H, C_PROD_FULL);
    this.prodBar.setOrigin(0, 0);
    this.prodLabel = this.add.text(prodX + BAR_W + 4, BAR_TOP, '50', {
      fontSize: '9px', color: '#aaccaa',
    });

    const stressX = prodX + BAR_W + 36;
    this.add.text(stressX, 6, 'STRESS', { fontSize: '9px', color: '#996677' });
    this.stressBarBg = this.add.rectangle(stressX, BAR_TOP, BAR_W, BAR_H, 0x332222);
    this.stressBarBg.setOrigin(0, 0);
    this.stressBar = this.add.rectangle(stressX, BAR_TOP, 0, BAR_H, C_STRESS);
    this.stressBar.setOrigin(0, 0);
    this.stressLabel = this.add.text(stressX + BAR_W + 4, BAR_TOP, '20', {
      fontSize: '9px', color: '#ccaaaa',
    });
  }

  // ------------------------------------------------------------------ texts

  private _createTexts(): void {
    const styleMoney = { fontSize: '10px', color: '#eecc44' };

    const moneyX = 260;
    this.add.text(moneyX, 6, 'R$', { fontSize: '9px', color: '#887744' });
    this.moneyText = this.add.text(moneyX + 16, 5, '0,00', styleMoney);

    // Mission tracker
    const missaoX = 360;
    this.add.text(missaoX, 4, 'MISSÃO', { fontSize: '9px', color: '#667799' });
    this.missionTitleText = this.add.text(missaoX, 16, 'Sem missão ativa', {
      fontSize: '9px', color: '#8899bb',
    });
    this.missionObjText = this.add.text(missaoX, 28, '', {
      fontSize: '8px', color: '#667788',
    });

    // Dia + hora + turno (direita)
    const style9 = { fontSize: '10px', color: '#aabbdd' };
    this.diaText  = this.add.text(GAME_WIDTH - 200, 5, 'Segunda', style9);
    this.horaText = this.add.text(GAME_WIDTH - 120, 5, '09:00', {
      fontSize: '13px', color: '#ccddf0',
    });
    this.turnoText = this.add.text(GAME_WIDTH - 120, ROW2 - 10, 'Manhã', {
      fontSize: '9px', color: '#667799',
    });

    // Debug key hints
    this.add.text(PAD, ROW2, '1:-prod  2:+prod  3:+stress  4:-stress  5:+money  6:+30min  7:+3h  M:missão  F:flags  O:objetivos', {
      fontSize: '8px', color: '#334455',
    });
  }

  // --------------------------------------------------------- stress overlay

  private _createStressOverlay(): void {
    this.stressOverlay = this.add.rectangle(0, HUD_HEIGHT + 1, GAME_WIDTH, 720 - HUD_HEIGHT - 1, 0xff0000, 0);
    this.stressOverlay.setOrigin(0, 0);
    this.stressOverlay.setDepth(10);
  }

  private _startStressPulse(): void {
    if (this.stressPulseTween) return;
    this.stressPulseTween = this.tweens.add({
      targets: this.stressOverlay,
      alpha: { from: 0, to: 0.12 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private _stopStressPulse(): void {
    if (this.stressPulseTween) {
      this.stressPulseTween.stop();
      this.stressPulseTween = undefined;
      this.stressOverlay.setAlpha(0);
    }
  }

  // ----------------------------------------------------------- alert area

  private _createAlertArea(): void {
    const alertY = 720 - 36;
    this.alertBg = this.add.rectangle(0, alertY, GAME_WIDTH, 34, C_ALERT_BG, 0);
    this.alertBg.setOrigin(0, 0);
    this.alertBg.setDepth(20);
    this.alertText = this.add.text(PAD, alertY + 8, '', {
      fontSize: '12px', color: '#ff4444',
    });
    this.alertText.setDepth(21);
  }

  private _showAlert(message: string, color = '#ff4444', duration = ALERT_DURATION): void {
    if (this.alertTimer) {
      this.alertTimer.remove();
      this.alertTimer = undefined;
    }
    if (this.alertTween) {
      this.alertTween.stop();
      this.alertTween = undefined;
    }

    this.alertText.setText(message).setColor(color);
    this.alertBg.setAlpha(0.85);
    this.alertText.setAlpha(1);

    this.alertTimer = this.time.delayedCall(duration, () => {
      this.alertTween = this.tweens.add({
        targets: [this.alertBg, this.alertText],
        alpha: 0,
        duration: 600,
      });
    });
  }

  // --------------------------------------------------------- subscriptions

  private _subscribeEvents(): void {
    EventBus.on<StatusSnapshot>('status:changed', () => this._refreshStatus());
    EventBus.on('time:turno_mudou', () => this._refreshTime());
    EventBus.on('time:dia_acabou', () => this._refreshTime());

    EventBus.on<{ missionId: string; title: string }>('mission:started', ({ title }) => {
      this._refreshMission();
      this._showAlert(`Missão iniciada: ${title}`, '#44aaff', MISSION_ALERT_DURATION);
    });

    EventBus.on('mission:objective_completed', () => {
      this._refreshMission();
    });

    EventBus.on<{ missionId: string; title: string }>('mission:completed', ({ title }) => {
      this._refreshMission();
      this._showAlert(`✓ Missão concluída: ${title}`, '#44ff88', MISSION_ALERT_DURATION);
    });

    EventBus.on('mission:failed', () => {
      this._refreshMission();
      this._showAlert('Missão falhou.', '#ff4444', MISSION_ALERT_DURATION);
    });
  }

  // ---------------------------------------------------------------- refresh

  private _refreshAll(): void {
    this._refreshStatus();
    this._refreshTime();
    this._refreshMission();
  }

  private _refreshStatus(): void {
    const snap = statusSystem.getStatusSnapshot();

    const prodRatio = snap.produtividade / 100;
    this.prodBar.width = Math.max(0, BAR_W * prodRatio);
    this.prodBar.setFillStyle(snap.produtividade <= 10 ? C_PROD_LOW : C_PROD_FULL);
    this.prodLabel.setText(String(snap.produtividade));

    const stressRatio = snap.estresse / 100;
    this.stressBar.width = Math.max(0, BAR_W * stressRatio);
    this.stressBar.setFillStyle(snap.estresse >= 80 ? C_STRESS_HI : C_STRESS);
    this.stressLabel.setText(String(snap.estresse));

    this.moneyText.setText(snap.dinheiro.toFixed(2).replace('.', ','));

    const critical = statusSystem.checkCriticalState();
    if (critical.flag !== 'ok') {
      this._showAlert(critical.message);
    }

    if (snap.estresse >= 80) {
      this._startStressPulse();
    } else {
      this._stopStressPulse();
    }
  }

  private _refreshTime(): void {
    const snap = timeSystem.getTimeSnapshot();
    this.diaText.setText(snap.dia);
    this.horaText.setText(snap.label);
    this.turnoText.setText(snap.turno);
  }

  private _refreshMission(): void {
    const active = missionSystem.getActiveMission();
    if (!active) {
      this.missionTitleText.setText('Sem missão ativa');
      this.missionObjText.setText('');
      return;
    }

    const progress = missionSystem.getMissionProgress(active.id);
    if (!progress) return;

    this.missionTitleText.setText(active.title);
    if (progress.currentObjective) {
      this.missionObjText.setText(`▶ ${progress.currentObjective.description}`);
    } else {
      this.missionObjText.setText('');
    }
  }

  update(): void {
    this._refreshTime();
  }
}

import Phaser from 'phaser';

export type ZoneType = 'safe' | 'risky' | 'neutral';

export interface Zone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ZoneType;
}

// Defined from outer (large) to inner (specific) so getZoneAt returns the most specific match
const ZONES: Zone[] = [
  { id: 'corredor',         label: 'Corredor',    x: 0,    y: 400, width: 2000, height: 260, type: 'safe'    },
  { id: 'area_rh',          label: 'RH',          x: 40,   y: 40,  width: 380,  height: 360, type: 'safe'    },
  { id: 'area_pre_vendas',  label: 'Pré-Vendas',  x: 440,  y: 40,  width: 360,  height: 360, type: 'risky'   },
  { id: 'area_ti',          label: 'TI',          x: 820,  y: 40,  width: 380,  height: 360, type: 'risky'   },
  { id: 'area_dp',          label: 'DP',          x: 1220, y: 40,  width: 380,  height: 360, type: 'risky'   },
  { id: 'area_compliance',  label: 'Governança',  x: 1620, y: 40,  width: 340,  height: 360, type: 'risky'   },
  { id: 'area_marketing',   label: 'Marketing',   x: 40,   y: 700, width: 380,  height: 300, type: 'risky'   },
  { id: 'area_operacoes',   label: 'Operações',   x: 440,  y: 700, width: 360,  height: 300, type: 'risky'   },
  { id: 'area_apoio',       label: 'Apoio',       x: 820,  y: 700, width: 380,  height: 300, type: 'risky'   },
  { id: 'copa_acesso',      label: 'Copa',        x: 1810, y: 40,  width: 190,  height: 400, type: 'neutral' },
  { id: 'diretoria_acesso', label: 'Diretoria',   x: 1200, y: 700, width: 800,  height: 700, type: 'neutral' },
];

class ZoneSystemClass {
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private debugVisible = false;
  private scene: Phaser.Scene | null = null;

  init(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  getZoneAt(x: number, y: number): Zone | null {
    // Last match wins (most specific zone, since specific zones are listed after general ones)
    let result: Zone | null = null;
    for (const zone of ZONES) {
      if (x >= zone.x && x <= zone.x + zone.width &&
          y >= zone.y && y <= zone.y + zone.height) {
        result = zone;
      }
    }
    return result;
  }

  isRiskZoneForPlayer(zoneId: string | null): boolean {
    if (!zoneId) return false;
    const zone = ZONES.find(z => z.id === zoneId);
    return zone?.type === 'risky';
  }

  toggleDebug(): void {
    this.debugVisible = !this.debugVisible;
    if (this.debugVisible) {
      this.drawDebugZones();
    } else {
      this.debugGraphics?.destroy();
      this.debugGraphics = null;
    }
  }

  private drawDebugZones(): void {
    if (!this.scene) return;
    this.debugGraphics?.destroy();
    this.debugGraphics = this.scene.add.graphics().setDepth(50);

    for (const zone of ZONES) {
      const color = zone.type === 'safe' ? 0x44ff44 : zone.type === 'risky' ? 0xff4444 : 0xffff44;
      this.debugGraphics.lineStyle(2, color, 0.9);
      this.debugGraphics.strokeRect(zone.x, zone.y, zone.width, zone.height);
      this.debugGraphics.fillStyle(color, 0.07);
      this.debugGraphics.fillRect(zone.x, zone.y, zone.width, zone.height);

      this.scene.add.text(zone.x + 4, zone.y + 4, `[${zone.id}]`, {
        fontSize: '9px',
        color: zone.type === 'safe' ? '#44ff44' : zone.type === 'risky' ? '#ff6666' : '#ffff44',
      }).setDepth(51);
    }
  }
}

export const zoneSystem = new ZoneSystemClass();

import Phaser from 'phaser';

export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 1400;

const WALL_COLOR = 0x555566;
const DESK_COLOR = 0x8b7355;
const DIVIDER_COLOR = 0x778899;
const CHAIR_COLOR = 0x996644;
const FLOOR_COLOR = 0xd4cfc8;
const CARPET_RH = 0xc8d4e0;
const CARPET_TI = 0xc8e0d4;
const CARPET_MARKETING = 0xe0d4c8;
const CARPET_GOVERNANCE = 0xdce0c8;
const CARPET_DP = 0xe0c8d4;
const CARPET_PREVENDAS = 0xd4c8e0;
const CARPET_OPS = 0xc8dce0;
const CARPET_APOIO = 0xe0e0c8;

interface AreaDefinition {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  carpet: number;
}

const AREAS: AreaDefinition[] = [
  { x: 40, y: 40, w: 380, h: 300, label: 'RH', carpet: CARPET_RH },
  { x: 440, y: 40, w: 360, h: 300, label: 'Pré-Vendas', carpet: CARPET_PREVENDAS },
  { x: 820, y: 40, w: 380, h: 300, label: 'TI', carpet: CARPET_TI },
  { x: 1220, y: 40, w: 380, h: 300, label: 'DP', carpet: CARPET_DP },
  { x: 1620, y: 40, w: 340, h: 300, label: 'Governança\n/ Compliance', carpet: CARPET_GOVERNANCE },
  { x: 40, y: 700, w: 380, h: 300, label: 'Marketing', carpet: CARPET_MARKETING },
  { x: 440, y: 700, w: 360, h: 300, label: 'Operações', carpet: CARPET_OPS },
  { x: 820, y: 700, w: 380, h: 300, label: 'Apoio', carpet: CARPET_APOIO },
];

export class OfficeMap {
  readonly staticGroup: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.staticGroup = scene.physics.add.staticGroup();
    this.buildMap(scene);
  }

  private buildMap(scene: Phaser.Scene): void {
    // Floor
    scene.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH, MAP_HEIGHT, FLOOR_COLOR);

    // Area carpets and labels
    for (const area of AREAS) {
      scene.add
        .rectangle(area.x + area.w / 2, area.y + area.h / 2, area.w, area.h, area.carpet)
        .setAlpha(0.6);

      scene.add
        .text(area.x + area.w / 2, area.y + 16, area.label, {
          fontSize: '13px',
          color: '#333344',
          fontStyle: 'bold',
          align: 'center',
        })
        .setOrigin(0.5, 0);
    }

    // External walls
    this.addWall(scene, MAP_WIDTH / 2, 8, MAP_WIDTH, 16);           // top
    this.addWall(scene, MAP_WIDTH / 2, MAP_HEIGHT - 8, MAP_WIDTH, 16); // bottom
    this.addWall(scene, 8, MAP_HEIGHT / 2, 16, MAP_HEIGHT);         // left
    this.addWall(scene, MAP_WIDTH - 8, MAP_HEIGHT / 2, 16, MAP_HEIGHT); // right

    // --- Interior horizontal corridor wall (separates upper and lower sectors) ---
    // Gap in the middle for corridor
    this.addWall(scene, 200, 400, 400, 12, DIVIDER_COLOR);
    this.addWall(scene, 680, 400, 360, 12, DIVIDER_COLOR);
    this.addWall(scene, 1080, 400, 320, 12, DIVIDER_COLOR);
    this.addWall(scene, 1460, 400, 360, 12, DIVIDER_COLOR);
    this.addWall(scene, 1810, 400, 340, 12, DIVIDER_COLOR);

    // Corridor lower wall
    this.addWall(scene, 200, 660, 400, 12, DIVIDER_COLOR);
    this.addWall(scene, 680, 660, 360, 12, DIVIDER_COLOR);
    this.addWall(scene, 1080, 660, 320, 12, DIVIDER_COLOR);
    this.addWall(scene, 1460, 660, 360, 12, DIVIDER_COLOR);
    this.addWall(scene, 1810, 660, 340, 12, DIVIDER_COLOR);

    // Vertical dividers between departments (upper row)
    this.addWall(scene, 420, 220, 12, 360, DIVIDER_COLOR);
    this.addWall(scene, 800, 220, 12, 360, DIVIDER_COLOR);
    this.addWall(scene, 1200, 220, 12, 360, DIVIDER_COLOR);
    this.addWall(scene, 1600, 220, 12, 360, DIVIDER_COLOR);

    // Vertical dividers between departments (lower row)
    this.addWall(scene, 420, 850, 12, 300, DIVIDER_COLOR);
    this.addWall(scene, 800, 850, 12, 300, DIVIDER_COLOR);

    // --- Copa (top-right corner) ---
    this.addWall(scene, 1810, 200, 12, 400, DIVIDER_COLOR);
    scene.add
      .text(1870, 220, 'Copa', {
        fontSize: '13px',
        color: '#333344',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);
    // Kitchen furniture
    this.addDesk(scene, 1870, 260, 120, 24);
    this.addDesk(scene, 1870, 310, 24, 80);

    // --- Diretoria (bottom-right) ---
    this.addWall(scene, 1200, 1050, 12, 340, DIVIDER_COLOR);
    this.addWall(scene, 1600, 1050, 12, 340, DIVIDER_COLOR);
    this.addWall(scene, 1400, 700, 400, 12, DIVIDER_COLOR);
    scene.add
      .text(1400, 720, 'Diretoria', {
        fontSize: '13px',
        color: '#333344',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);
    // Director's big desk
    this.addDesk(scene, 1400, 900, 200, 80);
    this.addChair(scene, 1400, 960);
    this.addChair(scene, 1300, 870);
    this.addChair(scene, 1500, 870);

    // --- Desks per department ---
    this.addDeskCluster(scene, 140, 100, 3, 2);  // RH
    this.addDeskCluster(scene, 520, 100, 2, 2);  // Pré-Vendas
    this.addDeskCluster(scene, 900, 100, 3, 2);  // TI
    this.addDeskCluster(scene, 1280, 100, 3, 2); // DP
    this.addDeskCluster(scene, 140, 760, 3, 2);  // Marketing
    this.addDeskCluster(scene, 520, 760, 2, 2);  // Operações
    this.addDeskCluster(scene, 900, 760, 2, 2);  // Apoio

    // Corridor labels
    scene.add.text(MAP_WIDTH / 2, 500, '— Corredor Central —', {
      fontSize: '11px',
      color: '#888899',
    }).setOrigin(0.5);

    // Copa corridor label
    scene.add.text(1900, 450, 'Acesso\nCopa', {
      fontSize: '11px',
      color: '#888899',
      align: 'center',
    }).setOrigin(0.5);

    // Diretoria corridor label
    scene.add.text(1400, 1050, 'Acesso\nDiretoria', {
      fontSize: '11px',
      color: '#888899',
      align: 'center',
    }).setOrigin(0.5);
  }

  private addWall(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    color = WALL_COLOR
  ): void {
    const rect = scene.add.rectangle(x, y, w, h, color);
    this.staticGroup.add(rect);
    scene.physics.add.existing(rect, true);
  }

  private addDesk(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w = 64,
    h = 28
  ): void {
    const rect = scene.add.rectangle(x, y, w, h, DESK_COLOR);
    this.staticGroup.add(rect);
    scene.physics.add.existing(rect, true);
  }

  private addChair(scene: Phaser.Scene, x: number, y: number): void {
    const rect = scene.add.rectangle(x, y, 16, 16, CHAIR_COLOR);
    this.staticGroup.add(rect);
    scene.physics.add.existing(rect, true);
  }

  private addDeskCluster(
    scene: Phaser.Scene,
    startX: number,
    startY: number,
    cols: number,
    rows: number
  ): void {
    const deskW = 60;
    const deskH = 26;
    const gapX = 80;
    const gapY = 60;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * gapX;
        const y = startY + row * gapY + 80;
        this.addDesk(scene, x, y, deskW, deskH);
        this.addChair(scene, x, y + 22);
      }
    }
  }
}

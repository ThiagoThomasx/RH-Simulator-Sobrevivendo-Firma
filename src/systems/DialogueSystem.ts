import Phaser from 'phaser';
import type { CharacterData } from '../types/character.types';
import type { DialogueFile, DialogueNode, DialogueChoice } from '../types/dialogue.types';
import type { Player } from '../entities/Player';
import { EventBus } from './EventBus';
import { effectResolver } from './EffectResolver';
import { conditionResolver } from './ConditionResolver';

const BOX_MARGIN = 20;
const DEPTH = 200;

class DialogueSystemClass {
  private _isOpen = false;
  private objects: Phaser.GameObjects.GameObject[] = [];
  private enterKey: Phaser.Input.Keyboard.Key | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private numberKeys: Phaser.Input.Keyboard.Key[] = [];
  private player: Player | null = null;
  private boundScene: Phaser.Scene | null = null;
  private readonly onPointerDown: () => void;

  // JSON dialogue state
  private currentDialogue: DialogueFile | null = null;
  private currentNodeId: string = '';
  private dialogueRegistry: Map<string, DialogueFile> = new Map();

  constructor() {
    this.onPointerDown = () => this._handlePointerDown();
  }

  private boundGameScene: Phaser.Scene | null = null;
  private boundPlayer: Player | null = null;

  get isOpen(): boolean {
    return this._isOpen;
  }

  bindContext(scene: Phaser.Scene, player: Player): void {
    this.boundGameScene = scene;
    this.boundPlayer = player;
  }

  startDialogueById(dialogueId: string): void {
    if (!this.boundGameScene || !this.boundPlayer) {
      console.warn('[DialogueSystem] bindContext() not called before startDialogueById()');
      return;
    }
    this.openById(dialogueId, this.boundGameScene, this.boundPlayer);
  }

  registerDialogue(dialogue: DialogueFile): void {
    this.dialogueRegistry.set(dialogue.id, dialogue);
  }

  // Open a registered JSON dialogue by id
  openById(dialogueId: string, scene: Phaser.Scene, player: Player): void {
    if (this._isOpen) return;
    const dialogue = this.dialogueRegistry.get(dialogueId);
    if (!dialogue) {
      console.warn(`[DialogueSystem] Dialogue not found: ${dialogueId}`);
      return;
    }

    this._isOpen = true;
    this.player = player;
    this.boundScene = scene;
    this.currentDialogue = dialogue;
    this.currentNodeId = dialogue.startNodeId;
    player.lockMovement();

    this._setupKeys(scene);
    this._renderCurrentNode();
  }

  // Legacy: open generic NPC dialogue without JSON
  open(scene: Phaser.Scene, data: CharacterData, player: Player): void {
    if (this._isOpen) return;
    this._isOpen = true;
    this.player = player;
    this.boundScene = scene;
    this.currentDialogue = null;
    player.lockMovement();

    this._buildLegacyUI(scene, data);
    this._setupKeys(scene);
  }

  update(): void {
    if (!this._isOpen) return;

    const enterDown = this.enterKey ? Phaser.Input.Keyboard.JustDown(this.enterKey) : false;
    const spaceDown = this.spaceKey ? Phaser.Input.Keyboard.JustDown(this.spaceKey) : false;

    if (this.currentDialogue) {
      const node = this._getCurrentNode();
      if (!node) return;

      // Numbered choices
      if (node.choices && node.choices.length > 0) {
        const available = this._getAvailableChoices(node.choices);
        for (let i = 0; i < this.numberKeys.length; i++) {
          if (Phaser.Input.Keyboard.JustDown(this.numberKeys[i])) {
            if (available[i]) this._selectChoice(available[i]);
          }
        }
        return;
      }

      // No choices: advance on Enter/Space
      if (enterDown || spaceDown) {
        this._advanceNode(node);
      }
    } else {
      // Legacy mode
      if (enterDown || spaceDown) {
        this._close();
      }
    }
  }

  private _setupKeys(scene: Phaser.Scene): void {
    const kb = scene.input.keyboard!;
    this.enterKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.numberKeys = [
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    ];
    scene.input.on('pointerdown', this.onPointerDown);
  }

  private _handlePointerDown(): void {
    if (!this.currentDialogue) {
      this._close();
      return;
    }
    const node = this._getCurrentNode();
    if (node && (!node.choices || node.choices.length === 0)) {
      this._advanceNode(node);
    }
  }

  private _getCurrentNode(): DialogueNode | undefined {
    return this.currentDialogue?.nodes.find(n => n.id === this.currentNodeId);
  }

  private _getAvailableChoices(choices: DialogueChoice[]): DialogueChoice[] {
    return choices.filter(c => conditionResolver.areConditionsMet(c.conditions));
  }

  private _selectChoice(choice: DialogueChoice): void {
    effectResolver.applyEffects(choice.effects);

    if (choice.nextNodeId) {
      this.currentNodeId = choice.nextNodeId;
      this._clearObjects();
      this._renderCurrentNode();
    } else {
      this._close();
    }
  }

  private _advanceNode(node: DialogueNode): void {
    effectResolver.applyEffects(node.effects);

    if (node.endDialogue) {
      this._close();
      return;
    }

    if (node.nextNodeId) {
      this.currentNodeId = node.nextNodeId;
      this._clearObjects();
      this._renderCurrentNode();
    } else {
      this._close();
    }
  }

  private _renderCurrentNode(): void {
    const node = this._getCurrentNode();
    if (!node) { this._close(); return; }

    const hasChoices = node.choices && node.choices.length > 0;
    this._buildNodeUI(node, hasChoices ?? false);
  }

  private _buildNodeUI(node: DialogueNode, hasChoices: boolean): void {
    const scene = this.boundScene!;
    const gameWidth = scene.scale.width;
    const gameHeight = scene.scale.height;

    const boxH = hasChoices ? 270 : 185;
    const boxY = gameHeight - boxH - BOX_MARGIN;
    const boxW = gameWidth - BOX_MARGIN * 2;

    const bg = scene.add.graphics();
    bg.fillStyle(0x0d0d1a, 0.94);
    bg.fillRoundedRect(BOX_MARGIN, boxY, boxW, boxH, 10);
    bg.lineStyle(1.5, 0x4488ff, 0.7);
    bg.strokeRoundedRect(BOX_MARGIN, boxY, boxW, boxH, 10);
    bg.fillStyle(0x334466, 0.8);
    bg.fillRect(BOX_MARGIN + 16, boxY + 36, boxW - 32, 1);
    bg.setScrollFactor(0).setDepth(DEPTH);
    this.objects.push(bg);

    const speakerName = node.speakerName ?? node.speakerId;
    const nameText = scene.add
      .text(BOX_MARGIN + 16, boxY + 10, speakerName, {
        fontSize: '14px',
        color: '#88aaff',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.objects.push(nameText);

    const bodyText = scene.add
      .text(BOX_MARGIN + 16, boxY + 46, node.text, {
        fontSize: '13px',
        color: '#dde4f0',
        wordWrap: { width: boxW - 32 },
        lineSpacing: 5,
      })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.objects.push(bodyText);

    if (hasChoices && node.choices) {
      this._renderChoicesUI(scene, node.choices, boxY, boxW, boxH);
    } else {
      const hintText = scene.add
        .text(BOX_MARGIN + boxW - 16, boxY + boxH - 10, '[ Enter / Espaço / Clique ] Continuar', {
          fontSize: '10px',
          color: '#445566',
        })
        .setOrigin(1, 1)
        .setScrollFactor(0)
        .setDepth(DEPTH + 1);
      this.objects.push(hintText);
    }
  }

  private _renderChoicesUI(
    scene: Phaser.Scene,
    choices: DialogueChoice[],
    boxY: number,
    boxW: number,
    boxH: number,
  ): void {
    const startY = boxY + 115;
    const lineH = 28;

    const hintText = scene.add
      .text(BOX_MARGIN + 16, boxY + boxH - 14, '[ 1, 2, 3 ] Escolher', {
        fontSize: '10px',
        color: '#445566',
      })
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.objects.push(hintText);

    const available = this._getAvailableChoices(choices);

    for (let i = 0; i < available.length; i++) {
      const choice = available[i];
      const y = startY + i * lineH;
      const label = `[${i + 1}] ${choice.text}`;

      const choiceText = scene.add
        .text(BOX_MARGIN + 16, y, label, {
          fontSize: '12px',
          color: '#ffe066',
          wordWrap: { width: boxW - 32 },
        })
        .setScrollFactor(0)
        .setDepth(DEPTH + 1);
      this.objects.push(choiceText);
    }
  }

  private _buildLegacyUI(scene: Phaser.Scene, data: CharacterData): void {
    const gameWidth = scene.scale.width;
    const gameHeight = scene.scale.height;
    const boxH = 185;
    const boxY = gameHeight - boxH - BOX_MARGIN;
    const boxW = gameWidth - BOX_MARGIN * 2;

    const bg = scene.add.graphics();
    bg.fillStyle(0x0d0d1a, 0.94);
    bg.fillRoundedRect(BOX_MARGIN, boxY, boxW, boxH, 10);
    bg.lineStyle(1.5, 0x4488ff, 0.7);
    bg.strokeRoundedRect(BOX_MARGIN, boxY, boxW, boxH, 10);
    bg.fillStyle(0x334466, 0.8);
    bg.fillRect(BOX_MARGIN + 16, boxY + 36, boxW - 32, 1);
    bg.setScrollFactor(0).setDepth(DEPTH);
    this.objects.push(bg);

    const nameText = scene.add
      .text(BOX_MARGIN + 16, boxY + 10, data.name, {
        fontSize: '14px',
        color: '#88aaff',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
    this.objects.push(nameText);

    scene.add
      .text(BOX_MARGIN + 16 + nameText.width + 10, boxY + 13, `— ${data.role}`, {
        fontSize: '11px',
        color: '#556688',
      })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);

    scene.add
      .text(BOX_MARGIN + 16, boxY + 46, data.defaultDialogue, {
        fontSize: '13px',
        color: '#dde4f0',
        wordWrap: { width: boxW - 32 },
        lineSpacing: 5,
      })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);

    scene.add
      .text(BOX_MARGIN + boxW - 16, boxY + boxH - 10, '[ Enter / Espaço / Clique ] Continuar', {
        fontSize: '10px',
        color: '#445566',
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(DEPTH + 1);
  }

  private _clearObjects(): void {
    for (const obj of this.objects) obj.destroy();
    this.objects = [];
  }

  private _close(): void {
    if (!this._isOpen) return;
    this._isOpen = false;

    this.player?.unlockMovement();
    this.boundScene?.input.off('pointerdown', this.onPointerDown);

    this._clearObjects();
    this.enterKey = null;
    this.spaceKey = null;
    this.numberKeys = [];
    this.player = null;
    this.currentDialogue = null;

    const scene = this.boundScene;
    this.boundScene = null;

    EventBus.emit('dialogue:closed', undefined);
    // Remove keys from the scene keyboard manager so they don't linger
    if (scene?.input.keyboard) {
      // keys are cleaned up automatically when removed from scene
    }
  }
}

export const dialogueSystem = new DialogueSystemClass();

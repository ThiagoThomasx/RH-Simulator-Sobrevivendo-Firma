export type CharacterSector =
  | 'rh'
  | 'pre_vendas'
  | 'ti'
  | 'dp'
  | 'governanca'
  | 'marketing'
  | 'operacoes'
  | 'apoio'
  | 'diretoria'
  | 'player';

export type CharacterTag =
  | 'boss'
  | 'friendly'
  | 'gossip'
  | 'workaholic'
  | 'tech'
  | 'otaku'
  | 'kpop'
  | 'compliance'
  | 'sales'
  | 'hr'
  | 'dp'
  | 'marketing'
  | 'director'
  | 'ceo'
  | 'support'
  | 'temp'
  | 'metaleiro';

export type NPCState = 'idle' | 'talking' | 'unavailable';

export interface CharacterData {
  id: string;
  name: string;
  nickname: string;
  sector: CharacterSector;
  role: string;
  shortDescription: string;
  spriteKey: string;
  initialPosition: { x: number; y: number };
  area: string;
  initialFriendship: number;
  interactable: boolean;
  tags: CharacterTag[];
  defaultDialogueId: string;
  defaultDialogue: string;
}

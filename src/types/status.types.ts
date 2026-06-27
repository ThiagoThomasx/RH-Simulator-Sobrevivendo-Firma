export interface StatusSnapshot {
  produtividade: number;
  estresse: number;
  dinheiro: number;
  amizades: Record<string, number>;
}

export type CriticalStateFlag =
  | 'ok'
  | 'produtividade_critica'
  | 'game_over_justa_causa'
  | 'estresse_alto'
  | 'burnout';

export interface CriticalStateResult {
  flag: CriticalStateFlag;
  message: string;
}

export type DiaSemana = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta';

export type Turno = 'Manhã' | 'Tarde' | 'Fim do Expediente';

export interface TimeSnapshot {
  dia: DiaSemana;
  hora: number;
  minuto: number;
  turno: Turno;
  label: string;
  diaIndex: number;
}

export type TimeEventType = 'turno_mudou' | 'dia_acabou' | 'semana_acabou';

export interface TimeEvent {
  type: TimeEventType;
  snapshot: TimeSnapshot;
}

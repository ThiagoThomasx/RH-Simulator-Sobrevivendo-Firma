import type { DiaSemana, Turno, TimeSnapshot } from '../types';
import { EventBus } from './EventBus';

const DIAS: DiaSemana[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const DIA_INICIO_HORA = 9;
const DIA_FIM_HORA = 18;

// Quantos minutos de jogo passam por segundo real
const DEFAULT_MINUTOS_POR_SEGUNDO = 2;

function getTurno(hora: number): Turno {
  if (hora < 12) return 'Manhã';
  if (hora < 15) return 'Tarde';
  return 'Fim do Expediente';
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export class TimeSystem {
  private diaIndex: number = 0;
  private hora: number = DIA_INICIO_HORA;
  private minuto: number = 0;
  private turnoAtual: Turno = 'Manhã';
  private minuteAccumulator: number = 0;
  private minutesPorSegundo: number = DEFAULT_MINUTOS_POR_SEGUNDO;

  setSpeed(minutesPorSegundo: number): void {
    this.minutesPorSegundo = minutesPorSegundo;
  }

  update(delta: number): void {
    // delta em ms
    const segundos = delta / 1000;
    this.minuteAccumulator += segundos * this.minutesPorSegundo;

    const minutesToAdvance = Math.floor(this.minuteAccumulator);
    if (minutesToAdvance > 0) {
      this.minuteAccumulator -= minutesToAdvance;
      this.consumeMinutes(minutesToAdvance);
    }
  }

  consumeMinutes(minutes: number): void {
    const totalMinutos = this.hora * 60 + this.minuto + minutes;
    const minutosNoDia = DIA_INICIO_HORA * 60;
    const minutosFinaDia = DIA_FIM_HORA * 60;
    const duracaoDia = minutosFinaDia - minutosNoDia;

    let restante = totalMinutos - minutosNoDia;
    let diasPassados = 0;

    while (restante >= duracaoDia) {
      restante -= duracaoDia;
      diasPassados++;
    }

    if (diasPassados > 0) {
      const novoIndex = this.diaIndex + diasPassados;
      if (novoIndex >= DIAS.length) {
        this.diaIndex = DIAS.length - 1;
        this.hora = DIA_FIM_HORA;
        this.minuto = 0;
        this._emitTurno();
        EventBus.emit('time:semana_acabou', this.getTimeSnapshot());
        return;
      }
      this.diaIndex = novoIndex;
      EventBus.emit('time:dia_acabou', this.getTimeSnapshot());
    }

    const horaTotal = DIA_INICIO_HORA + Math.floor(restante / 60);
    const minutoFinal = restante % 60;
    this.hora = Math.min(horaTotal, DIA_FIM_HORA);
    this.minuto = this.hora >= DIA_FIM_HORA ? 0 : minutoFinal;

    this._emitTurno();

    if (this.hora >= DIA_FIM_HORA) {
      EventBus.emit('time:dia_acabou', this.getTimeSnapshot());
    }
  }

  private _emitTurno(): void {
    const novoTurno = getTurno(this.hora);
    if (novoTurno !== this.turnoAtual) {
      this.turnoAtual = novoTurno;
      EventBus.emit('time:turno_mudou', this.getTimeSnapshot());
    } else {
      this.turnoAtual = novoTurno;
    }
  }

  getCurrentDay(): DiaSemana {
    return DIAS[this.diaIndex];
  }

  getCurrentTimeLabel(): string {
    return `${pad(this.hora)}:${pad(this.minuto)}`;
  }

  getCurrentTurn(): Turno {
    return getTurno(this.hora);
  }

  getTimeSnapshot(): TimeSnapshot {
    return {
      dia: this.getCurrentDay(),
      hora: this.hora,
      minuto: this.minuto,
      turno: this.getCurrentTurn(),
      label: this.getCurrentTimeLabel(),
      diaIndex: this.diaIndex,
    };
  }
}

export const timeSystem = new TimeSystem();

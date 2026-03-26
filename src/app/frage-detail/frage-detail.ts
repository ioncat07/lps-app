import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Frage, Modus } from '../frage.model';

@Component({
  selector: 'app-frage-detail',
  imports: [CommonModule],
  templateUrl: './frage-detail.html',
  styleUrl: './frage-detail.css'
})
export class FrageDetail {
  @Input() frage?: Frage;
  @Input() modus: Modus = 'lernen';
  @Input() zeigeLoesung = false;
  @Input() frageKorrektBeantwortet = false;
  @Input() istErsteFrage = false;
  @Input() istLetzteFrage = false;
  @Input() antwortStatusFn!: (index: number) => 'neutral' | 'ausgewaehlt' | 'richtig' | 'falsch';

  @Output() antwortGeklickt = new EventEmitter<number>();
  @Output() schriftlicheAntwortGeaendert = new EventEmitter<string>();
  @Output() pruefenGeklickt = new EventEmitter<void>();
  @Output() erste = new EventEmitter<void>();
  @Output() vorherige = new EventEmitter<void>();
  @Output() naechste = new EventEmitter<void>();
  @Output() letzte = new EventEmitter<void>();

  buchstabe(index: number): string {
    return ['A', 'B', 'C', 'D', 'E'][index] ?? '?';
  }

  istMehrfachauswahl(): boolean {
    return this.frage?.typ === 'multiple-choice' && (this.frage.richtigeAntworten.length ?? 0) > 1;
  }

  antwortKlasse(index: number): string {
    if (!this.antwortStatusFn) return 'neutral';
    return this.antwortStatusFn(index);
  }
}

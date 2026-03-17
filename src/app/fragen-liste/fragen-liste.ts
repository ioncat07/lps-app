import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Frage, Modus, FilterTyp } from '../frage.model';
import { FragenService } from '../fragen.service';
import { FrageDetail } from '../frage-detail/frage-detail';

@Component({
  selector: 'app-fragen-liste',
  imports: [CommonModule, FrageDetail],
  templateUrl: './fragen-liste.html',
  styleUrl: './fragen-liste.css'
})
export class FragenListe implements OnInit {
  alleFragen: Frage[] = [];
  fragen: Frage[] = [];
  ausgewaehlteFrage?: Frage;

  aktuellerIndex = -1;
  modus: Modus = 'lernen';
  filterTyp: FilterTyp = 'alle';

  geladen = false;
  fehlertext = '';

  falscheAntworten = 0;
  richtigeAntworten = 0;
  pruefungBeendet = false;
  pruefungsMeldung = '';
  vollpruefungAbgeschlossen = false;
  vollpruefungErgebnisText = '';

  constructor(private fragenService: FragenService) {}

  ngOnInit(): void {
    this.ladeFragen();
  }

  ladeFragen(): void {
    this.fragenService.getFragen().subscribe({
      next: (daten) => {
        this.alleFragen = daten;
        this.filterAnwenden('alle');
        this.geladen = true;
      },
      error: (fehler) => {
        console.error('Fehler beim Laden der Fragen:', fehler);
        this.fehlertext = 'Die Fragen konnten nicht geladen werden.';
        this.geladen = true;
      }
    });
  }

  filterAnwenden(filter: FilterTyp): void {
    this.filterTyp = filter;

    if (filter === 'alle') {
      this.fragen = [...this.alleFragen];
    } else {
      this.fragen = this.alleFragen.filter((frage) => frage.typ === filter);
    }

    this.zuruecksetzen();
  }

  setzeModus(modus: Modus): void {
    this.modus = modus;
    this.zuruecksetzen();
  }

  zuruecksetzen(): void {
    this.pruefungBeendet = false;
    this.pruefungsMeldung = '';
    this.vollpruefungAbgeschlossen = false;
    this.vollpruefungErgebnisText = '';
    this.falscheAntworten = 0;
    this.richtigeAntworten = 0;

    for (const frage of this.fragen) {
      frage.beantwortet = false;
      frage.ausgewaehlteAntworten = [];
      frage.schriftlicheAntwort = '';
    }

    if (this.fragen.length > 0) {
      this.aktuellerIndex = 0;
      this.ausgewaehlteFrage = this.fragen[0];
    } else {
      this.aktuellerIndex = -1;
      this.ausgewaehlteFrage = undefined;
    }
  }

  frageAuswaehlen(frage: Frage): void {
    this.ausgewaehlteFrage = frage;
    this.aktuellerIndex = this.fragen.findIndex((f) => f.id === frage.id);
  }

  ersteFrage(): void {
    if (this.fragen.length === 0) return;
    this.aktuellerIndex = 0;
    this.ausgewaehlteFrage = this.fragen[0];
  }

  vorherigeFrage(): void {
    if (this.aktuellerIndex > 0) {
      this.aktuellerIndex--;
      this.ausgewaehlteFrage = this.fragen[this.aktuellerIndex];
    }
  }

  naechsteFrage(): void {
    if (this.aktuellerIndex < this.fragen.length - 1) {
      this.aktuellerIndex++;
      this.ausgewaehlteFrage = this.fragen[this.aktuellerIndex];
    }
  }

  letzteFrage(): void {
    if (this.fragen.length === 0) return;
    this.aktuellerIndex = this.fragen.length - 1;
    this.ausgewaehlteFrage = this.fragen[this.aktuellerIndex];
  }

  istErsteFrage(): boolean {
    return this.aktuellerIndex <= 0;
  }

  istLetzteFrage(): boolean {
    return this.aktuellerIndex >= this.fragen.length - 1;
  }

  antwortUmschalten(index: number): void {
    if (!this.ausgewaehlteFrage) return;
    if (this.ausgewaehlteFrage.typ !== 'multiple-choice') return;
    if (this.pruefungBeendet || this.vollpruefungAbgeschlossen) return;
    if (this.ausgewaehlteFrage.beantwortet && this.modus !== 'lernen') return;

    const antworten = this.ausgewaehlteFrage.ausgewaehlteAntworten;
    const vorhanden = antworten.includes(index);

    if (vorhanden) {
      this.ausgewaehlteFrage.ausgewaehlteAntworten = antworten.filter((i) => i !== index);
    } else {
      this.ausgewaehlteFrage.ausgewaehlteAntworten = [...antworten, index].sort((a, b) => a - b);
    }
  }

  schriftlicheAntwortSetzen(text: string): void {
    if (!this.ausgewaehlteFrage) return;
    if (this.ausgewaehlteFrage.typ !== 'schriftlich') return;
    if (this.pruefungBeendet || this.vollpruefungAbgeschlossen) return;
    if (this.ausgewaehlteFrage.beantwortet && this.modus !== 'lernen') return;

    this.ausgewaehlteFrage.schriftlicheAntwort = text;
  }

  antwortPruefen(): void {
    if (!this.ausgewaehlteFrage || this.pruefungBeendet || this.vollpruefungAbgeschlossen) {
      return;
    }

    if (this.modus === 'teilpruefung') {
      if (this.ausgewaehlteFrage.beantwortet) return;

      this.ausgewaehlteFrage.beantwortet = true;

      if (this.aktuelleFrageIstKorrektBeantwortet()) {
        this.richtigeAntworten++;
      } else {
        this.falscheAntworten++;
      }
    }

    if (this.modus === 'vollpruefung') {
      if (!this.ausgewaehlteFrage.beantwortet) {
        this.ausgewaehlteFrage.beantwortet = true;
      }
    }
  }

  vollpruefungBeenden(): void {
    if (this.modus !== 'vollpruefung' || this.vollpruefungAbgeschlossen) {
      return;
    }

    let richtige = 0;
    let falsche = 0;

    for (const frage of this.fragen) {
      const beantwortet =
        frage.typ === 'multiple-choice'
          ? frage.ausgewaehlteAntworten.length > 0
          : this.normalisiereText(frage.schriftlicheAntwort) !== '';

      if (!beantwortet) {
        falsche++;
        continue;
      }

      if (this.frageIstKorrektBeantwortet(frage)) {
        richtige++;
      } else {
        falsche++;
      }

      frage.beantwortet = true;
    }

    this.richtigeAntworten = richtige;
    this.falscheAntworten = falsche;
    this.vollpruefungAbgeschlossen = true;
    this.pruefungBeendet = true;

    this.vollpruefungErgebnisText =
      `Die Vollprüfung ist beendet. Richtige Antworten: ${richtige}, falsche Antworten: ${falsche}. Nicht beantwortete Fragen wurden als falsch gewertet.`;
  }

  istAntwortAusgewaehlt(index: number): boolean {
    return this.ausgewaehlteFrage?.ausgewaehlteAntworten.includes(index) ?? false;
  }

  istAntwortRichtig(index: number): boolean {
    if (!this.ausgewaehlteFrage || this.ausgewaehlteFrage.typ !== 'multiple-choice') return false;
    return this.ausgewaehlteFrage.richtigeAntworten.includes(index);
  }

  zeigeLoesung(): boolean {
    if (!this.ausgewaehlteFrage) return false;

    if (this.modus === 'lernen') return true;
    if (this.modus === 'teilpruefung') return this.ausgewaehlteFrage.beantwortet;
    return false;
  }

  antwortStatus(index: number): 'neutral' | 'ausgewaehlt' | 'richtig' | 'falsch' {
    if (!this.ausgewaehlteFrage || this.ausgewaehlteFrage.typ !== 'multiple-choice') {
      return 'neutral';
    }

    const ausgewaehlt = this.istAntwortAusgewaehlt(index);
    const richtig = this.istAntwortRichtig(index);
    const loesungSichtbar = this.zeigeLoesung();

    if (loesungSichtbar && richtig) return 'richtig';
    if (loesungSichtbar && ausgewaehlt && !richtig) return 'falsch';
    if (ausgewaehlt) return 'ausgewaehlt';

    return 'neutral';
  }

  aktuelleFrageIstKorrektBeantwortet(): boolean {
    if (!this.ausgewaehlteFrage) return false;
    return this.frageIstKorrektBeantwortet(this.ausgewaehlteFrage);
  }

  frageIstKorrektBeantwortet(frage: Frage): boolean {
    if (frage.typ === 'schriftlich') {
      return this.normalisiereText(frage.schriftlicheAntwort) ===
        this.normalisiereText(frage.loesung);
    }

    const auswahl = [...frage.ausgewaehlteAntworten].sort((a, b) => a - b);
    const korrekt = [...frage.richtigeAntworten].sort((a, b) => a - b);

    return JSON.stringify(auswahl) === JSON.stringify(korrekt);
  }

  anzahlBeantwortet(): number {
    return this.fragen.filter(frage => {
      if (frage.typ === 'multiple-choice') {
        return frage.ausgewaehlteAntworten.length > 0;
      }
      return this.normalisiereText(frage.schriftlicheAntwort) !== '';
    }).length;
  }

  anzahlVerbleibend(): number {
    return this.fragen.length - this.anzahlBeantwortet();
  }

  fortschrittProzent(): number {
    if (this.fragen.length === 0) return 0;
    return Math.round((this.anzahlBeantwortet() / this.fragen.length) * 100);
  }

  ergebnisProzent(): number {
    if (this.fragen.length === 0) return 0;
    return Math.round((this.richtigeAntworten / this.fragen.length) * 100);
  }

  private normalisiereText(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  }
}
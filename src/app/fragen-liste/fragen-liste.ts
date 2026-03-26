import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Frage, Modus, FilterTyp, Katalog } from '../frage.model';
import { FragenService } from '../fragen.service';
import { FrageDetail } from '../frage-detail/frage-detail';

@Component({
  selector: 'app-fragen-liste',
  imports: [CommonModule, FrageDetail],
  templateUrl: './fragen-liste.html',
  styleUrl: './fragen-liste.css'
})
export class FragenListe {
  // Navigations-Zustand
  ansicht: 'katalog' | 'modus' | 'quiz' = 'katalog';
  katalog?: Katalog;
  modus: Modus = 'lernen';
  filterTyp: FilterTyp = 'alle';

  // Daten
  alleFragen: Frage[] = [];
  fragen: Frage[] = [];
  aktuellerIndex = 0;

  // Laden
  ladevorgang = false;
  fehlertext = '';

  // Voll-Prüfung
  vollpruefungAbgeschlossen = false;
  vollpruefungErgebnis?: { richtig: number; falsch: number };

  // Gebundene Funktion (verhindert neue Referenz bei jedem Change-Detection-Zyklus)
  readonly antwortStatusBound = this.antwortStatus.bind(this);

  constructor(private fragenService: FragenService) {}

  get aktuelleFrage(): Frage | undefined {
    return this.fragen[this.aktuellerIndex];
  }

  // ── Schritt 1: Katalog wählen ────────────────────────────────────

  katalogWaehlen(katalog: Katalog): void {
    this.katalog = katalog;
    this.ladevorgang = true;
    this.fehlertext = '';

    this.fragenService.getFragen(katalog).subscribe({
      next: (daten) => {
        this.alleFragen = daten;
        this.ladevorgang = false;
        this.ansicht = 'modus';
      },
      error: () => {
        this.fehlertext = 'Die Fragen konnten nicht geladen werden.';
        this.ladevorgang = false;
      }
    });
  }

  // ── Schritt 2: Modus starten ─────────────────────────────────────

  modusStarten(modus: Modus, filter: FilterTyp = 'alle'): void {
    this.modus = modus;
    this.filterTyp = filter;
    this.vollpruefungAbgeschlossen = false;
    this.vollpruefungErgebnis = undefined;

    // Fragenbasis filtern (nur Lernmodus hat Filteroptionen)
    let basis = filter === 'alle'
      ? [...this.alleFragen]
      : this.alleFragen.filter(f => f.typ === filter);

    // Voll-Prüfung: 60 zufällige Fragen auswählen
    if (modus === 'vollpruefung') {
      basis = this.mischen(basis).slice(0, 60);
    }

    // Frischen Antwortzustand erzeugen (alleFragen bleibt unverändert)
    this.fragen = basis.map(f => ({
      ...f,
      ausgewaehlteAntworten: [],
      schriftlicheAntwort: '',
      beantwortet: false
    }));

    this.aktuellerIndex = 0;
    this.ansicht = 'quiz';
  }

  private mischen<T>(arr: T[]): T[] {
    const kopie = [...arr];
    for (let i = kopie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    }
    return kopie;
  }

  // ── Navigation ───────────────────────────────────────────────────

  zuIndex(index: number): void {
    if (index >= 0 && index < this.fragen.length) {
      this.aktuellerIndex = index;
    }
  }

  ersteFrage(): void    { this.aktuellerIndex = 0; }
  vorherigeFrage(): void { if (this.aktuellerIndex > 0) this.aktuellerIndex--; }
  naechsteFrage(): void  { if (this.aktuellerIndex < this.fragen.length - 1) this.aktuellerIndex++; }
  letzteFrage(): void    { this.aktuellerIndex = this.fragen.length - 1; }

  // ── Antworten verwalten ──────────────────────────────────────────

  antwortUmschalten(index: number): void {
    const frage = this.aktuelleFrage;
    if (!frage || frage.typ !== 'multiple-choice') return;
    if (frage.beantwortet && this.modus !== 'lernen') return;
    if (this.vollpruefungAbgeschlossen) return;

    const auswahl = frage.ausgewaehlteAntworten;
    frage.ausgewaehlteAntworten = auswahl.includes(index)
      ? auswahl.filter(i => i !== index)
      : [...auswahl, index].sort((a, b) => a - b);
  }

  schriftlicheAntwortSetzen(text: string): void {
    const frage = this.aktuelleFrage;
    if (!frage || frage.typ !== 'schriftlich') return;
    if (frage.beantwortet && this.modus !== 'lernen') return;
    if (this.vollpruefungAbgeschlossen) return;

    frage.schriftlicheAntwort = text;
  }

  // Teil-Prüfmodus: Antwort direkt prüfen und markieren
  antwortPruefen(): void {
    const frage = this.aktuelleFrage;
    if (!frage || frage.beantwortet || this.modus !== 'teilpruefung') return;
    frage.beantwortet = true;
  }

  // Voll-Prüfmodus: Alle Fragen auswerten, Endergebnis berechnen
  vollpruefungAbschliessen(): void {
    if (this.modus !== 'vollpruefung' || this.vollpruefungAbgeschlossen) return;

    let richtig = 0;
    let falsch = 0;

    for (const frage of this.fragen) {
      frage.beantwortet = true;
      if (this.frageKorrekt(frage)) {
        richtig++;
      } else {
        falsch++;
      }
    }

    this.vollpruefungAbgeschlossen = true;
    this.vollpruefungErgebnis = { richtig, falsch };
  }

  // Bestanden wenn nicht mehr als 8 Fehler
  get pruefungBestanden(): boolean {
    return (this.vollpruefungErgebnis?.falsch ?? 0) <= 8;
  }

  // ── Antwort-Status für Farbgebung ────────────────────────────────

  antwortStatus(index: number): 'neutral' | 'ausgewaehlt' | 'richtig' | 'falsch' {
    const frage = this.aktuelleFrage;
    if (!frage || frage.typ !== 'multiple-choice') return 'neutral';

    const ausgewaehlt = frage.ausgewaehlteAntworten.includes(index);
    const richtig = frage.richtigeAntworten.includes(index);
    const sichtbar = this.zeigeLoesung();

    if (sichtbar && richtig) return 'richtig';
    if (sichtbar && ausgewaehlt && !richtig) return 'falsch';
    if (ausgewaehlt) return 'ausgewaehlt';
    return 'neutral';
  }

  zeigeLoesung(): boolean {
    const frage = this.aktuelleFrage;
    if (!frage) return false;
    if (this.modus === 'lernen') return true;
    if (this.modus === 'teilpruefung') return frage.beantwortet;
    if (this.modus === 'vollpruefung') return this.vollpruefungAbgeschlossen;
    return false;
  }

  aktuelleFrageKorrekt(): boolean {
    return this.aktuelleFrage ? this.frageKorrekt(this.aktuelleFrage) : false;
  }

  private frageKorrekt(frage: Frage): boolean {
    if (frage.typ === 'schriftlich') {
      return this.norm(frage.schriftlicheAntwort) === this.norm(frage.loesung);
    }
    const auswahl = [...frage.ausgewaehlteAntworten].sort((a, b) => a - b);
    const korrekt = [...frage.richtigeAntworten].sort((a, b) => a - b);
    return JSON.stringify(auswahl) === JSON.stringify(korrekt);
  }

  private norm(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // ── Statistik ────────────────────────────────────────────────────

  get anzahlBeantwortet(): number {
    return this.fragen.filter(f =>
      f.typ === 'multiple-choice'
        ? f.ausgewaehlteAntworten.length > 0
        : this.norm(f.schriftlicheAntwort) !== ''
    ).length;
  }

  // ── Labels ───────────────────────────────────────────────────────

  get katalogLabel(): string {
    return this.katalog === 'lpic101' ? 'LPIC-101' : 'LPIC-102';
  }

  get modusLabel(): string {
    const labels: Record<Modus, string> = {
      lernen: 'Lernmodus',
      teilpruefung: 'Teil-Prüfmodus',
      vollpruefung: 'Voll-Prüfmodus'
    };
    return labels[this.modus];
  }

  // ── Zurück-Navigation ────────────────────────────────────────────

  zurStartseite(): void {
    this.ansicht = 'katalog';
    this.alleFragen = [];
    this.fragen = [];
  }

  zurModusWahl(): void {
    this.ansicht = 'modus';
  }
}

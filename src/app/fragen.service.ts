import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Frage, FrageRoh, Katalog } from './frage.model';

@Injectable({ providedIn: 'root' })
export class FragenService {
  constructor(private http: HttpClient) {}

  getFragen(katalog: Katalog): Observable<Frage[]> {
    const url = katalog === 'lpic101' ? '/fragen1.json' : '/fragen2.json';
    return this.http.get<FrageRoh[]>(url).pipe(
      map(rohFragen => rohFragen.map(f => this.mapFrage(f)))
    );
  }

  private mapFrage(roh: FrageRoh): Frage {
    return {
      id: roh.id,
      typ: roh.typ,
      frageText: roh.frageText,
      antworten: roh.antworten ?? [],
      loesung: roh.loesung,
      richtigeAntworten: roh.typ === 'multiple-choice' ? this.loesungZuIndizes(roh.loesung) : [],
      erklaerung: roh.erklaerung,
      ausgewaehlteAntworten: [],
      schriftlicheAntwort: '',
      beantwortet: false
    };
  }

  private loesungZuIndizes(loesung: string): number[] {
    const mapping: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
    return loesung.toUpperCase().replace(/\s+/g, '').split('')
      .map(z => mapping[z])
      .filter(v => v !== undefined);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Frage, FrageRoh } from './frage.model';

@Injectable({
  providedIn: 'root'
})
export class FragenService {
  private jsonUrl = '/fragen1.json';

  constructor(private http: HttpClient) {}

  getFragen(): Observable<Frage[]> {
    return this.http.get<FrageRoh[]>(this.jsonUrl).pipe(
      map((rohFragen) => rohFragen.map((frage) => this.mapFrage(frage)))
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
    const buchstaben = loesung.toUpperCase().replace(/\s+/g, '').split('');

    const mapping: Record<string, number> = {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      E: 4
    };

    return buchstaben
      .map((zeichen) => mapping[zeichen])
      .filter((wert) => wert !== undefined);
  }
}
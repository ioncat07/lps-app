export type Katalog = 'lpic101' | 'lpic102';
export type Modus = 'lernen' | 'teilpruefung' | 'vollpruefung';
export type FrageTyp = 'multiple-choice' | 'schriftlich';
export type FilterTyp = 'alle' | 'multiple-choice' | 'schriftlich';

export interface FrageRoh {
  id: number;
  typ: FrageTyp;
  frageText: string;
  antworten?: string[];
  loesung: string;
  erklaerung?: string;
}

export interface Frage {
  id: number;
  typ: FrageTyp;
  frageText: string;
  antworten: string[];
  loesung: string;
  richtigeAntworten: number[];
  erklaerung?: string;
  ausgewaehlteAntworten: number[];
  schriftlicheAntwort: string;
  beantwortet: boolean;
}

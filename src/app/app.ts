import { Component } from '@angular/core';
import { FragenListe } from './fragen-liste/fragen-liste';

@Component({
  selector: 'app-root',
  imports: [FragenListe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
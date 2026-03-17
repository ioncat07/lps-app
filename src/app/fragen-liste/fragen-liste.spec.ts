import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FragenListe } from './fragen-liste';

describe('FragenListe', () => {
  let component: FragenListe;
  let fixture: ComponentFixture<FragenListe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FragenListe]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FragenListe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

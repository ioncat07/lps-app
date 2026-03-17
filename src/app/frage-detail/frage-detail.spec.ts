import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrageDetail } from './frage-detail';

describe('FrageDetail', () => {
  let component: FrageDetail;
  let fixture: ComponentFixture<FrageDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrageDetail]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FrageDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

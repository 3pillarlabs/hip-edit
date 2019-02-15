import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreCardComponent } from './score-card.component';
import { MaterialModule } from '../../material.module';
import { ScoreCard } from '../data-model';
import { MAT_DIALOG_DATA } from '@angular/material';

describe('ScoreCardComponent', () => {
  let component: ScoreCardComponent;
  let fixture: ComponentFixture<ScoreCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoreCardComponent ],
      imports: [ MaterialModule ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

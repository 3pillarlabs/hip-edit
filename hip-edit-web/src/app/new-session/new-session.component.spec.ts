import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSessionComponent } from './new-session.component';
import { AppStateService } from '../app-state.service';


describe('NewSessionComponent', () => {
  let component: NewSessionComponent;
  let fixture: ComponentFixture<NewSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewSessionComponent ],
      providers: [
        {
          provide: AppStateService,
          useValue: new AppStateService()
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

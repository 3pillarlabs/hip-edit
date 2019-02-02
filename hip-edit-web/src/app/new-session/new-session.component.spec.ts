import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { NewSessionComponent } from './new-session.component';
import { AppStateService } from '../app-state.service';
import { reducers, metaReducers } from '../reducers';


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
      ],
      imports: [
        StoreModule.forRoot(reducers, { metaReducers })
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

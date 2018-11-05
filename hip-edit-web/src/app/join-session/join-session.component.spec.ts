import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { MaterialModule } from '../material.module';
import { JoinSessionComponent } from './join-session.component';
import { CodeSession } from './data-model';

describe('JoinSessionComponent', () => {
  let component: JoinSessionComponent;
  let fixture: ComponentFixture<JoinSessionComponent>;
  const sessionToken = 'c1125750-2b28-431c-b378-f49f1dc5719e';

  const simulateFormFill = (dataModel: CodeSession) => {
    Object.entries(dataModel).forEach((e) => {
      const element = fixture.debugElement.query(By.css(`input[name="${e[0]}"]`)).nativeElement;
      element.value = e[1];
      element.dispatchEvent(new Event('input'));
    });
  };

  beforeEach(async(() => {
    let routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    let titleSpy = {
      getTitle: jasmine.createSpy('getTitle').and.returnValue(sessionToken)
    };
    TestBed.configureTestingModule({
      declarations: [ JoinSessionComponent ],
      imports: [
        ReactiveFormsModule,
        MaterialModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: {
              subscribe: (observer) => {
                let params = {
                  get: () => sessionToken
                }
                observer.next(params);
              }
            }
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sessionToken from location/path param', () => {
    it('should pre-populate sessionToken input', () => {
      let el = fixture.debugElement.query(By.css('input[name="sessionToken"]')).nativeElement;
      expect(el.value).toBe(sessionToken);
    });
  });

  describe('joinSession', () => {
    it('should route to session/:id', () => {
      simulateFormFill({
        sessionToken: sessionToken,
        userAlias: '#truthy'
      });
      fixture.detectChanges();
      fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', undefined);
      let router = TestBed.get(Router);
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should check for sessionToken maximum length', () => {
      simulateFormFill({
        sessionToken: 'c1125750-2b28-431c-b378-f49f1dc5719eh',
        userAlias: '#truthy'
      });
      fixture.detectChanges();
      expect(component.joinSessionForm.valid).toBeFalsy();
    });

    it('should not allow sessionToken with dot(s)', () => {
      simulateFormFill({
        sessionToken: 'c1125750.2b28.431c.b378.f49f1dc5719e',
        userAlias: '#truthy'
      });
      fixture.detectChanges();
      expect(component.joinSessionForm.valid).toBeFalsy();
    });

    describe('invalid form', () => {
      it('should not route to session/:id', () => {
        fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', undefined);
        let router = TestBed.get(Router);
        expect(router.navigate).toHaveBeenCalledTimes(0);
      });
    });
  });
});

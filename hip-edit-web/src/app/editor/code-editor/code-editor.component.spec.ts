import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreModule } from '@ngrx/store';

import { CodeEditorComponent } from './code-editor.component';
import { MaterialModule } from '../../material.module';
import { EditorEventService } from './editor-event.service';
import { PubsubService } from '../../pubsub.service';
import { reducers, metaReducers } from '../../reducers';

describe('CodeEditorComponent', () => {
  let component: CodeEditorComponent;
  let fixture: ComponentFixture<CodeEditorComponent>;
  let textAreEl: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CodeEditorComponent
      ],
      imports: [
        FormsModule,
        MaterialModule,
        StoreModule.forRoot(reducers, { metaReducers })
      ],
      providers: [
        {
          provide: EditorEventService,
          useClass: class {
            postEvent = jasmine.createSpy('postEvent').and.returnValue({subscribe: () => {}});
          }
        },
        {
          provide: PubsubService,
          useClass: class {
            editorEventsStream = jasmine.createSpy('editorEventsStream').and.returnValue({subscribe: () => {
              return { unsubscribe: () => {} }
            }});
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: {
              subscribe: (observer: { next: (arg0: { get: () => string; }) => void; }) => {
                let params = {
                  get: () => {
                    return 'c1125750-2b28-431c-b378-f49f1dc5719e';
                  }
                }
                observer.next(params);
              }
            }
          },
        },
        {
          provide: Router,
          useValue: {
            paramMap: {
              subscribe: (observer: { next: (arg0: { get: () => string; }) => void; }) => {
                let params = {
                  get: () => 'c1125750-2b28-431c-b378-f49f1dc5719e'
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
    fixture = TestBed.createComponent(CodeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should post changes', () => {
    textAreEl = fixture.debugElement.query(By.css('textarea'));
    expect(textAreEl).toBeTruthy();
    const txtAreaVal = 'class Foo {}';
    textAreEl.nativeElement.value = txtAreaVal;
    textAreEl.triggerEventHandler('change', {});
    let editorEventService = TestBed.get(EditorEventService);
    expect(editorEventService.postEvent).toHaveBeenCalledWith(component.sessionToken, txtAreaVal);
  });
});

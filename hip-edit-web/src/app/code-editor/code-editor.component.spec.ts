import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { CodeEditorComponent } from './code-editor.component';
import { MaterialModule } from '../material.module';
import { EditorEventService } from './editor-event.service';
import { PubsubService } from '../pubsub.service';

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
        MaterialModule
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

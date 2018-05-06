import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CodeEditorComponent } from './code-editor.component';
import { MaterialModule } from '../material.module';
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
          provide: PubsubService,
          useClass: class {
            postEvent = jasmine.createSpy('postEvent').and.returnValue({subscribe: () => {}});
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
    let pubsubService = TestBed.get(PubsubService);
    expect(pubsubService.postEvent).toHaveBeenCalledWith(txtAreaVal);
  });
});

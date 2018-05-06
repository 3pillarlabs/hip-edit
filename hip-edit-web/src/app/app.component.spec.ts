import { TestBed, async } from '@angular/core/testing';
import { AppComponent }   from './app.component';
import { MockComponent } from 'ng-mocks';
import { CodeEditorComponent} from './code-editor/code-editor.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockComponent(CodeEditorComponent)
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});

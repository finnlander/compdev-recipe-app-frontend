import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { testImports } from '../../../../test/test-util';

import { FlashingTextComponent } from './flashing-text.component';

describe('FlashingTextComponent', () => {
  let component: FlashingTextComponent;
  let fixture: ComponentFixture<FlashingTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [...testImports, BrowserAnimationsModule],
      declarations: [FlashingTextComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashingTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

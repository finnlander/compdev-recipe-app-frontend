import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientEditModalComponent } from './ingredient-edit-modal.component';

describe('IngredientEditComponent', () => {
  let component: IngredientEditModalComponent;
  let fixture: ComponentFixture<IngredientEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IngredientEditModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

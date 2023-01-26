import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { testImports } from '../../../test/test-util';
import { RecipeUnit } from '../../shared/models/recipe-unit.model';

import { ShoppingListItemComponent } from './shopping-list-item.component';

describe('ShoppingListItemComponent', () => {
  let component: ShoppingListItemComponent;
  let fixture: ComponentFixture<ShoppingListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [...testImports, FormsModule],
      declarations: [ShoppingListItemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingListItemComponent);
    component = fixture.componentInstance;
    component.item = {
      ordinal: 1,
      ingredient: { name: 'testIngredient', id: 1 },
      amount: 5,
      unit: RecipeUnit.PCS,
    };
    component.newAmount = 10;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

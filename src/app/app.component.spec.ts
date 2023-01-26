import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { AppComponent } from './app.component';
import { initialAuthState } from './auth/store';
import { ErrorPageComponent } from './error-page/error-page.component';
import { HeaderComponent } from './header/header.component';
import { initialRecipeState } from './recipes/store';
import { SharedModule } from './shared/shared.module';
import { initialShoppingListState } from './shopping-list/store';
import { reducers, RootState } from './store/app.store';

const initialState: RootState = {
  auth: initialAuthState,
  recipes: initialRecipeState,
  shoppingList: initialShoppingListState,
};

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers),
        SharedModule,
      ],
      declarations: [AppComponent, HeaderComponent, ErrorPageComponent],
      providers: [
        provideMockStore<RootState>({
          initialState: initialState,
        }),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

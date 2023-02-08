import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { ActionButtonComponent } from './components/action-button/action-button.component';
import { AlertComponent } from './components/alert/alert.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { FlashingTextComponent } from './components/flashing-text/flashing-text.component';
import { IngredientInputFieldComponent } from './components/ingredient-input-field/ingredient-input-field.component';
import { DropdownDirective } from './directives/dropdown.directive';
import { RequireEqualityValidatorDirective } from './directives/require-equality-validator.directive';
import { TrackByFieldDirective } from './directives/track-by-field.directive';
import { EllipsisPipe } from './pipes/ellipsis.pipe';

@NgModule({
  declarations: [
    // Pipes
    EllipsisPipe,
    // Directives
    DropdownDirective,
    RequireEqualityValidatorDirective,
    TrackByFieldDirective,
    // Components
    ActionButtonComponent,
    AlertComponent,
    ConfirmationModalComponent,
    FlashingTextComponent,
    IngredientInputFieldComponent,
  ],
  imports: [
    // Module Imports
    CommonModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot(),
    NgxSpinnerModule.forRoot({ type: 'ball-newton-cradle' }),
    // Material UI modules
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  exports: [
    // Pipes
    EllipsisPipe,
    // Directives
    DropdownDirective,
    RequireEqualityValidatorDirective,
    TrackByFieldDirective,
    // Components
    ActionButtonComponent,
    AlertComponent,
    ConfirmationModalComponent,
    FlashingTextComponent,
    IngredientInputFieldComponent,
    // Shared Modules
    CommonModule,
    NgxSpinnerModule,
    // Material UI modules
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
})
export class SharedModule {}

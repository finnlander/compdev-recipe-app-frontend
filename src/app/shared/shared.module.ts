import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
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
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { ActionButtonComponent } from './components/action-button/action-button.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
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
    AlertDialogComponent,
    ConfirmationModalComponent,
    FlashingTextComponent,
    IngredientInputFieldComponent,
  ],
  imports: [
    // Module Imports
    CommonModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    NgxSpinnerModule.forRoot({ type: 'ball-newton-cradle' }),
    // Material UI modules
    DragDropModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
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
  exports: [
    // Pipes
    EllipsisPipe,
    // Directives
    DropdownDirective,
    RequireEqualityValidatorDirective,
    TrackByFieldDirective,
    // Components
    ActionButtonComponent,
    AlertDialogComponent,
    ConfirmationModalComponent,
    FlashingTextComponent,
    IngredientInputFieldComponent,
    // Shared Modules
    CommonModule,
    NgxSpinnerModule,
    // Material UI modules
    DragDropModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
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

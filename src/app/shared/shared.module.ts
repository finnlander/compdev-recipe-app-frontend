import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { AlertComponent } from './components/alert/alert.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { FlashingTextComponent } from './components/flashing-text/flashing-text.component';
import { DropdownDirective } from './directives/dropdown.directive';
import { RequireEqualityValidatorDirective } from './directives/require-equality-validator.directive';
import { TrackByFieldDirective } from './directives/track-by-field.directive';

@NgModule({
  declarations: [
    // Directives
    DropdownDirective,
    RequireEqualityValidatorDirective,
    TrackByFieldDirective,
    // Components
    AlertComponent,
    ConfirmationModalComponent,
    FlashingTextComponent,
  ],
  imports: [
    // Module Imports
    CommonModule,
    FontAwesomeModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot(),
    NgxSpinnerModule.forRoot({ type: 'ball-newton-cradle' }),
    // Material UI modules
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  exports: [
    // Directives
    DropdownDirective,
    RequireEqualityValidatorDirective,
    TrackByFieldDirective,
    // Components
    AlertComponent,
    ConfirmationModalComponent,
    FlashingTextComponent,
    // Shared Modules
    CommonModule,
    FontAwesomeModule,
    NgxSpinnerModule,
    MatMenuModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
})
export class SharedModule {}

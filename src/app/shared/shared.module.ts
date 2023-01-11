import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { AlertComponent } from './components/alert/alert.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { DropdownDirective } from './directives/dropdown.directive';
import { EqualityValidatorDirective } from './directives/require-equality-validator.directive';

@NgModule({
  declarations: [
    // Directives
    DropdownDirective,
    EqualityValidatorDirective,
    // Components
    AlertComponent,
    ConfirmationModalComponent,
  ],
  imports: [
    // Module Imports
    CommonModule,
    FontAwesomeModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot(),
    NgxSpinnerModule.forRoot({ type: 'ball-newton-cradle' }),
  ],
  exports: [
    // Directives
    DropdownDirective,
    EqualityValidatorDirective,
    // Components
    AlertComponent,
    ConfirmationModalComponent,
    // Shared Modules
    CommonModule,
    FontAwesomeModule,
    NgxSpinnerModule,
  ],
})
export class SharedModule {}
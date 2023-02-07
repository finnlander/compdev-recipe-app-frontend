import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { ActionButtonComponent } from './components/action-button/action-button.component';
import { AlertComponent } from './components/alert/alert.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { FlashingTextComponent } from './components/flashing-text/flashing-text.component';
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
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatSlideToggleModule,
    MatTableModule,
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
    // Shared Modules
    CommonModule,
    FontAwesomeModule,
    NgxSpinnerModule,
    MatMenuModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule,
  ],
})
export class SharedModule {}

import { Directive, Input } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

const debounceTimeMs = 500;

/**
 * Validator directive to validate input value equality compared to expected value.
 */
@Directive({
  selector: '[appRequireEquality]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: EqualityValidatorDirective,
      multi: true,
    },
  ],
})
export class EqualityValidatorDirective implements AsyncValidator {
  @Input('requireEqualityTo') requireEqualityTo: string = '';

  constructor() {}
  validate(
    control: AbstractControl<any, any>
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return timer(debounceTimeMs).pipe(
      map(() => {
        const equalityMatch = this.matchesEqualityRequirement(control.value);

        const validationResult = equalityMatch
          ? null
          : {
              notEqual: true,
            };

        return validationResult;
      })
    );
  }

  private matchesEqualityRequirement(value: string): boolean {
    const equalTo = this.requireEqualityTo;
    return value === equalTo;
  }
}

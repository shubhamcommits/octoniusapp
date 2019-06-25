import { AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';

export class InputValidators {

  static fieldCannotBeEmpty(control: AbstractControl): ValidationErrors | null {
    if (control.value && (control.value as string).trim().length === 0) {
      return { fieldCannotBeEmpty: true };
    } else {
      return null;
    }
  }


  static passwordsShouldMatch(control: FormGroup): ValidationErrors | null {
    // const password = control.get('ownerPassword').value;
    // const repeatPassword = control.get('ownerPasswordRepeat').value;

    // console.log('password', control.get('ownerPassword').value);
    // console.log('repeatPassword', control);
    console.log('Parent password', ((control.parent as FormGroup)));


    /* if (control.value && (control.value as string).trim().length === 0) {
      return { fieldCannotBeEmpty: true };
    } else {
      return null;
    } */

    return null;
  }

}

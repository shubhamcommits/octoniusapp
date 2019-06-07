import {FormControl} from '@angular/forms';

export function  isEqualPassword(c: FormControl): any {
  if (c.parent) {
    if (c.parent.value['newPassword1'] !== c.value) {
      return {isNotEqual: true};
    } else {
      return null;
    }
  }
  return null;
}

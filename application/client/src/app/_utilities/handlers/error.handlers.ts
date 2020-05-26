import {HttpErrorResponse} from '@angular/common/http';
import {throwError} from 'rxjs';


export class ErrorHandlers {

  static handleApiError(errorRes: HttpErrorResponse) {
    const errorMessage = 'An unknown error occurred!';

    switch (errorRes.error.error.message) {
      // handle cases of error here and assign appropriate error message to errorMessage variable
    }

    return throwError(errorMessage);
  }
}

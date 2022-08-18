import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { BaseFormComponent } from 'src/app/components/base-form.component';
import { LoginRequest } from '../../login-request';
import { LoginResult } from '../../login-result';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends BaseFormComponent implements OnInit {
  title?: string;
  loginResult?: LoginResult;
  isSuccess: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit() {
    this.form = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    let loginRequest = <LoginRequest>{};
    loginRequest.userName = this.form.controls['userName'].value;
    loginRequest.password = this.form.controls['password'].value;

    if (this.form.valid) {
      this.authService.register(loginRequest).subscribe({
        next: () => {
          // if registered successfuly, user logs in immideatly
          this.authService.login(loginRequest).subscribe({
            next: () => {
              this.router.navigate(['/']);
              //let snackBarRef = snackBar.open('Message archived');
            },
            error: (err: HttpErrorResponse) => this.handleError(err),
          });
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status == 401) {
      // TODO: maybe remove
      console.log(error.error);
      this.loginResult = error.error;
    }
    if (error.status == 409) {
      this.loginResult = error.error;
    }
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}

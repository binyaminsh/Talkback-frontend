import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BaseFormComponent } from 'src/app/components/base-form.component';
import { LoginRequest } from '../../login-request';
import { LoginResult } from '../../login-result';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseFormComponent implements OnInit {

  loginResult?: LoginResult;

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackbar: MatSnackBar,
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
    var loginRequest = <LoginRequest>{};
    loginRequest.userName = this.form.controls['userName'].value;
    loginRequest.password = this.form.controls['password'].value;

    if (this.form.valid) {
      this.authService.login(loginRequest).subscribe({
        next: (result: LoginResult) => {
          this.loginResult = result;

          if (result.success) {
            this.router.navigate(['/']);
            this.snackbar.open('Logged In', 'Dismiss', {
              duration: 1000
            });          
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 401) {
            this.loginResult = err.error;
          }
        },
      });
    }
  }
}

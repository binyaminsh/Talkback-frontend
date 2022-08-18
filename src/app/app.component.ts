import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { User } from './users/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'TalkBack.ui';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.init();
    if (this.authService.isAuthenticated()) {
      const user: User = JSON.parse(localStorage.getItem('user')!);
      if (user) {
        this.authService.setCurrentUser(user);
      }
    }
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { NotificationService } from '../services/notification.service';
import { User } from '../users/user';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
})
export class NavMenuComponent implements OnInit, OnDestroy {
  private destroySubject = new Subject();
  isLoggedIn: boolean = false;

  currentUser$?: Observable<User>;
  chatNotifications: string[];
  challengeNotifications: string[]; // TODO: make text area bigger

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.chatNotifications = notificationService.getChatNotifications();
    this.challengeNotifications = notificationService.getChallengeNotifications();
    
    this.authService.authStatus
      .pipe(takeUntil(this.destroySubject))
      .subscribe((result) => {
        this.isLoggedIn = result;
      });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);

    // TODO: Check if reload behaviour is needed to pervent multiple ws
    location.reload();
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleBadgeVisibility() {
    this.notificationService.emptyChatArray();
  }

  challengeAccepted() {
    this.notificationService.setChallengeStatus(true);
  }
  challengeDeclined() {
    this.notificationService.setChallengeStatus(false);
  }

  ngOnDestroy(): void {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}

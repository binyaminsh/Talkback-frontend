import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, takeUntil, Subject } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { SignalrChatService } from '../chat/services/signalr-chat.service';
import { SignalrChessService } from '../chess/services/signalr-chess.service';
import { SignalrUsersService } from '../users/services/signalr-users.service';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public users$?: Observable<User[] | null>;

  private destroySubject = new Subject();
  isLoggedIn: boolean = false;

  constructor(
    private signalrUsers: SignalrUsersService,
    private signalrChat: SignalrChatService,
    private usersService: UsersService,
    public authService: AuthService,
    private signalrChess: SignalrChessService
  ) {
    this.users$ = signalrUsers.result$;

    this.authService.authStatus
      .pipe(takeUntil(this.destroySubject))
      .subscribe((result) => {
        this.isLoggedIn = result;
      });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.fetchData();

    // TODO: add IsOnline logic
    if (this.isLoggedIn) {
      this.startChatConnection();
      this.startChessConnection();
    }
  }

  async fetchData() {
    if (this.isLoggedIn) {
      await this.signalrUsers.startConnection();
    } else {
      this.users$ = this.usersService.getAllUsers();
    }
  }

  startChatConnection() {
    this.signalrChat.startConnection();
  }

  startChessConnection() {
    this.signalrChess.startConnection();
  }

  async onChatClick(selectedUser: User) {
    this.signalrChat.setSelectedUser(selectedUser);
    await this.signalrChat.InitiateConversation(selectedUser);
  }

  async onPlayClick(selectedUser: User) {
    await this.signalrChess.RequestNewGame(selectedUser);
    // await this.signalrChess.inviteUserToChess(selectedUser);
  }

  ngOnDestroy(): void {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}

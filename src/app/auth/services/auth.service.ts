import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject, tap } from 'rxjs';
import { SignalrChatService } from 'src/app/chat/services/signalr-chat.service';
import { SignalrChessService } from 'src/app/chess/services/signalr-chess.service';
import { SignalrUsersService } from 'src/app/users/services/signalr-users.service';
import { User } from 'src/app/users/user';
import { environment } from 'src/environments/environment';
import { LoginRequest } from '../login-request';
import { LoginResult } from '../login-result';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey: string = 'token';
  private userKey: string = 'user';

  private _authStatus = new Subject<boolean>();
  public authStatus = this._authStatus.asObservable();

  private _currentUser = new ReplaySubject<User>(1);
  currentUser$ = this._currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private signalrUsers: SignalrUsersService,
    private signalrChat: SignalrChatService,
    private signalrChess: SignalrChessService,
  ) {}

  init(): void {
    if (this.isAuthenticated()) {
      this.setAuthStatus(true);
    }
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  register(item: LoginRequest): Observable<LoginResult> {
    var url = environment.authUrl + 'api/Auth/register';
    return this.http.post<LoginResult>(url, item);
  }

  login(item: LoginRequest): Observable<LoginResult> {
    var authUrl = environment.authUrl + 'api/Auth/login';
    var userUrl = environment.userUrl + 'api/Users/';

    return this.http.post<LoginResult>(authUrl, item).pipe(
      tap((loginResult) => {
        if (loginResult.success && loginResult.token) {
          localStorage.setItem(this.tokenKey, loginResult.token);
          this.setAuthStatus(true);

          this.http.get<User>(userUrl + loginResult.id).subscribe((user) => {
            this.setCurrentUser(user);
          });
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.setAuthStatus(false);

    this.signalrUsers.stopConnection();
    this.signalrChat.stopConnection();
    this.signalrChess.stopConnection();
  }

  private setAuthStatus(isAuthenticated: boolean): void {
    this._authStatus.next(isAuthenticated);
  }

  public setCurrentUser(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this._currentUser.next(user);
  }
}

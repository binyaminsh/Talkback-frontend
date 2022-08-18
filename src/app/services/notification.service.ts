import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private chatNotifications: string[] = [];
  private challengeNotifications: string[] = [];

  private _isChallengeAccepted = new Subject<boolean>();
  public IsChallengeAccepted$ = this._isChallengeAccepted.asObservable();

  constructor() {}

  addChatNotification(chatNotification: string) {
    if (this.chatNotifications.indexOf(chatNotification) === -1) {
      this.chatNotifications.push(chatNotification);
    }
  }

  addChallengeNotification(challengeNotification: string) {
    if (this.challengeNotifications.indexOf(challengeNotification) === -1) {
      this.challengeNotifications.push(challengeNotification);
      setTimeout(() => {
        const index = this.challengeNotifications.findIndex(x => x === challengeNotification)
        if (index !== -1)
        {
          this.challengeNotifications.splice(index, 1);
        }
      }, 15000);
    }
  }

  getChatNotifications(): string[] {
    return this.chatNotifications;
  }

  getChallengeNotifications(): string[] {
    return this.challengeNotifications;
  }

  emptyChatArray() {
    this.chatNotifications.length = 0;
  }

  emptyChallengeArray() {
    this.challengeNotifications.length = 0;
  }

  setChallengeStatus(status: boolean) {
    this._isChallengeAccepted.next(status);
    this.emptyChallengeArray();
  }
}

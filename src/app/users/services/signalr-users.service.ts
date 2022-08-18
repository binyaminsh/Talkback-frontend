import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../user';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalrUsersService {
  private hubConnection!: signalR.HubConnection;

  private _result: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public result$ = this._result.asObservable();

  constructor() {}

  public async startConnection() {
    if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.userUrl + 'userHub', {
          withCredentials: false,
          accessTokenFactory: () => localStorage.getItem('token')!,
        })
        .withAutomaticReconnect()
        .build();
    }

    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      console.log('Starting connection...');

      await this.hubConnection
        .start()
        .then(
          () => {
            console.log('Connection started.');
          },
          (reason: any) => {
            console.log('Connection to User Hub failed ' + reason);
          }
        )
        .catch((err) => console.log(err));

      this.addDataListeners();
    }
  }

  public async stopConnection() {
    await this.hubConnection.stop();
  }

  public async addDataListeners() {
    this.hubConnection.on('receiveUsers', (data) => {
      console.log(data);
      this._result.next(data);
    });
  }

  public async updateData() {
    console.log('Fetching data...');

    await this.hubConnection
      .invoke('sendUsers')
      .catch((err: any) => console.log(err));
  }
}

export interface Result {
  users: User[];
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject, take } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/users/user';
import { Message } from '../message';
import { Conversation } from '../conversation';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class SignalrChatService {
  private hubConnection!: signalR.HubConnection;

  private _messages = new BehaviorSubject<Message[]>([]);
  public messages$ = this._messages.asObservable();

  private _conversations = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this._conversations.asObservable();

  private _selectedUser = new ReplaySubject<any>(1);
  public selectedUser = this._selectedUser.asObservable();

  conversationId?: string;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  public async startConnection() {
    if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.chatUrl + 'chatHub', {
          withCredentials: false,
          accessTokenFactory: () => localStorage.getItem('token')!,
        })
        .withAutomaticReconnect()
        .build();
    }

    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      console.log('Starting connection to Chat Hub...');

      await this.hubConnection
        .start()
        .then(
          () => {
            console.log('Connection to Chat started.');
          },
          (reason: any) => {
            console.log('Connection to Chat failed. ' + reason);
          }
        )
        .catch((err) => console.log(err));

      await this.addDataListeners();
    }
  }

  public async stopConnection() {
    if (this.hubConnection) {
      await this.hubConnection.stop();
    }
  }

  public async addDataListeners() {
    this.hubConnection.on('NewMessage', (message: Message) => {
      this.messages$.pipe(take(1)).subscribe((messages) => {
        this._messages.next([...messages, message]);
      });
    });

    this.hubConnection.on('NewMessageNotification', (senderName) => {
      if (this.router.url !== '/chat')
        this.notificationService.addChatNotification(
          `recieved message from ${senderName}`
        );
    });

    this.hubConnection.on('UserConversations', (conversations) => {
      this._conversations.next(conversations);
    });

    // Routes the user that initiated the conversation to the specific conversation in the chat
    this.hubConnection.on('GetConversationId', (conversationId: string) => {
      this.conversationId = conversationId;
      this.router.navigate(['chat']);
      setTimeout(() => {
        this.conversationId = ''; // workaround to not "Save" the conversation ID
      }, 1000);
    });

    // Listens to incoming notifications of conversation with users
    this.hubConnection.on(
      'NotifyConversationCreated',
      (conversationId: string) => {
        // invokes a method that joins the recipient to the conversation
        this.hubConnection
          .send('AddRecipientToConversation', conversationId)
          .catch((error) => console.log(error));
      }
    );

    this.hubConnection.on('GetConversationMessages', (messages) => {
      this._messages.next(messages);
    });
  }

  public async GetUserConversations() {
    await this.hubConnection
      .invoke('GetUserConversations')
      .catch((error) => console.log(error));
  }

  // Starts/Joins a conversation with the recipient
  public async InitiateConversation(selectedUser: User) {
    await this.hubConnection
      .invoke('JoinConversation', selectedUser.displayName, selectedUser.id)
      .catch((error) => console.log(error));
  }

  public getConversationHistory(conversationId: string) {
    this.hubConnection
      .invoke('GetConversationHistory', conversationId)
      .catch((error) => console.log(error));
  }
  public async sendMessage(conversationId: string, content: string) {
    return this.hubConnection
      .invoke('SendMessage', { conversationId, content })
      .catch((error) => console.log(error));
  }

  public setSelectedUser(user: User) {
    this._selectedUser.next(user);
  }
}

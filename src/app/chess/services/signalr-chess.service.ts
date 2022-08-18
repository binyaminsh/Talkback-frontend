import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { NotificationService } from 'src/app/services/notification.service';
import { User } from 'src/app/users/user';
import { environment } from 'src/environments/environment';
import { ChessChatMessage } from '../chessMessage';
import { Game } from '../game';
import { ChessChatService } from './chess-chat.service';
import { ChessService } from './chess.service';

@Injectable({
  providedIn: 'root',
})
export class SignalrChessService {
  private hubConnection!: signalR.HubConnection;

  gameId?: string;
  invitationStatus?: boolean;

  constructor(
    private chessService: ChessService,
    private chessChatService: ChessChatService,
    private snackbar: MatSnackBar,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // TODO: MA ZE PO OSE?????????
    this.notificationService.IsChallengeAccepted$.subscribe((isAccepted) => {
      this.invitationStatus = isAccepted;
      if (this.invitationStatus === true) {
        this.hubConnection.invoke('OnInvitationAccept', this.gameId);
      } else if (this.invitationStatus === false) {
        this.hubConnection.invoke('OnInvitationDecline', this.gameId);
      }
    });
  }

  public async onDisconnected() {
    this.hubConnection.onclose(() => {
      
    })
  }

  public async startConnection() {
    if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.chessUrl + 'chessHub', {
          withCredentials: false,
          accessTokenFactory: () => localStorage.getItem('token')!,
        })
        .withAutomaticReconnect()
        .build();
    }

    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      console.log('Starting connection to Chess Hub...');

      await this.hubConnection
        .start()
        .then(
          () => {
            console.log('Connection to Chess started.');
          },
          (reason: any) => {
            console.log('Connection to Chess failed. ' + reason);
          }
        )
        .catch((err) => console.log(err));

      await this.addDataListeners();
    }
  }

  public async addDataListeners() {
    this.hubConnection.on('RoomCreated', (gameId: string) => {
      this.gameId = gameId;
    });
    
    this.hubConnection.on('userAlreadyInAGame', () => {
      debugger;
      this.snackbar.open('Cannot start a match while one of the users is in a game', 'Dismiss', {
        duration: 4000
      })
    })

    this.hubConnection.on('InvitationAccepted', (game: Game, colour: string) => {
      this.snackbar.dismiss();
      this.chessService.setInvitationAccepted(true);
      this.chessService.initGame(game, colour);
      this.chessChatService.initChatMessages();

      if (this.router.url === '/chess') {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.chessService.isSwitchedPage = false;
          this.router.navigate(['chess']);
      }); 
      }
      else {
        this.router.navigate(['chess']);
      }
    }
  );

    this.hubConnection.on('InvitationDeclined', () => {
      this.snackbar.open('Your chess invitation was declined', 'Dismiss', {
        duration: 5000,
      });
    });

    this.hubConnection.on('chessinvitation', (username) => {
      this.notificationService.addChallengeNotification(`${username} has invited you to a chess match`);

      this.snackbar.open(`${username} has invited you to a chess match`, '', {
        duration: 3000,
      });
    });

    this.hubConnection.on('waitingForInvitationResponseMessage', () => {
      this.snackbar.open('Waiting for opponnent to Accept/Decline', '', {
        duration: 15000
      })
    })

    this.hubConnection.on('move', (move) => {
      var coords = JSON.parse(move);
      if (this.chessService.myFunc) {
        this.chessService.myFunc(coords.move);
      }
    });

    this.hubConnection.on('NewMessageInChessChat', (message: ChessChatMessage) => {
        this.chessChatService.messages.push(message);
      }
    );

    this.hubConnection.on('getPgnAndFen', (pgn, fen: string) => {
      this.chessService.fen = fen;
      this.chessService.setPGN(pgn);
    })

    this.hubConnection.on('gameOver', (gameoverMessage) => {
      this.chessService.setGameoverMessage(gameoverMessage);
    })
  }

  public async stopConnection() {
    if (this.hubConnection) {
      await this.hubConnection.stop();
    }
  }

  public async RequestNewGame(selectedUser: User) {
    await this.hubConnection.invoke('CreateGame', selectedUser.displayName, selectedUser.id);
  }

  // INVOEKD IN THE SERVER
  // public async inviteUserToChess(selectedUser: User) {
  //   await this.hubConnection.invoke('InviteToChess', selectedUser.id);
  // }

  public async move(move: any, opponnent: string, gameId: string) {
    await this.hubConnection.invoke('PieceMove', move, opponnent, gameId);
  }

  public async sendMessage(content: string, recipientName: string, gameId: string) {
    await this.hubConnection.invoke('SendMessageInChess', content, recipientName, gameId);
  }

  public async GetPgnAndFen(gameId: string) {
    await this.hubConnection.invoke('GetGamePgnAndFen', gameId);
  }

  public async resign(gameId: string, reason: string) {
    await this.hubConnection.invoke('resign', gameId, reason);
  }
}

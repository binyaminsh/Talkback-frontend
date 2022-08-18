import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MoveChange,
  NgxChessBoardService,
  NgxChessBoardView,
  PieceIconInput,
} from 'ngx-chess-board';
import { ChessChatMessage } from '../../chessMessage';
import { Game } from '../../game';
import { GameState } from '../../gameState';
import { ChessChatService } from '../../services/chess-chat.service';
import { ChessService } from '../../services/chess.service';
import { SignalrChessService } from '../../services/signalr-chess.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('board', { static: false }) board?: NgxChessBoardView;

  chessServ?: ChessService;

  game?: Game;
  colour?: string;
  invitationAccepted?: boolean;
  chatMessages: ChessChatMessage[] = [];
  opponnentName?: string;
  gameoverMessage?: string;

  lightTileColor: string = '';
  darkTileColor: string = '';
  pieceIconInput: PieceIconInput;

  sourcePointColor = 'rgba(155,199,0,0.41)';
  destinationPointColor = 'rgba(155,199,0,0.41)';

  constructor(
    private signalrChess: SignalrChessService,
    public chessService: ChessService,
    private chessChatService: ChessChatService,
    private ngxChessBoardService: NgxChessBoardService,
    private cd: ChangeDetectorRef
  ) {
    this.chessServ = chessService;

    this.pieceIconInput = chessService.pieceIconInput;

    this.lightTileColor = chessService.lightTileColor;
    this.darkTileColor = chessService.darkTileColor;

    this.chessService.invitationAccepted$.subscribe((isAccepted) => {
      this.invitationAccepted = isAccepted;
    });

    this.colour = chessService.colour;
    this.game = chessService.game;
    this.chessService.pgn$.subscribe((pgn) => {
      this.board?.setPGN(pgn);
    });

    this.chatMessages = chessChatService.messages;
    chessService.gameoverMessage$.subscribe((reason) => {
      this.gameoverMessage = reason;
    });
  }

  ngOnInit(): void {
    this.chessServ?.move(this.getMove.bind(this));
  }

  ngAfterViewInit(): void {
    if (!this.game) return;

    // TODO: Handle board reverse logic when page is swtiched
    if (this.colour === 'black') {
      this.board?.reverse();
      this.opponnentName = this.game.whitePlayer;
    } else {
      this.opponnentName = this.game.blackPlayer;
    }

    this.signalrChess.GetPgnAndFen(this.game.id);

    this.cd.detectChanges();
  }

  reverse() {
    this.board?.reverse();
  }

  reset() {
    // TODO: Send request to server for reset
    this.board?.reset();
    if (this.colour === 'black') {
      this.board?.reverse();
    }
  }

  resign() {
    if (this.game) {
      // TODO: move this to chess service
      this.signalrChess.resign(this.game.id, `${this.colour} resigned`);
      // TODO: Add logic in case a user disconnects for more than a few seconds
    }
  }

  move(e: any) {
    if (this.game) {
      // In case user left the chess page and returned, cannot make a move until is in sync with the server game
      if (!this.chessService.isBoardSync(this.board?.getFEN()!))
      {
         if (!this.chessService.isSwitchedPage && this.colour === 'black') 
         {
          setTimeout(() => {
            this.reverse();
          }, 0);
         }
        return;
      }
      console.log(e);      
      // moveChange behaviour triggers the event every time a piece is moved on the board, that means that currently ==>
      // the event will be triggered also when user recieves the opponnent's move (and not only when he makes a move) ==>
      // which will cause sendnig double data to the server and causing unexpected bugs. 
      if (!this.chessService.isMoveAllowed(e.color)) return; 
      
      if (this.colour === 'white') {
        this.signalrChess.move(e, this.game.blackPlayer, this.game.id);
      } else {
        this.signalrChess.move(e, this.game.whitePlayer, this.game.id);
      }
    }
  }

  getMove(coords: string) {
    this.board?.move(coords);
  }

  sendMsg(content: string, form: NgForm) {
    if (this.game && this.opponnentName) {
      this.signalrChess.sendMessage(content, this.opponnentName, this.game?.id);
      form.resetForm();
    }
  }

  ngOnDestroy(): void {
    this.chessService.isSwitchedPage = true;
  }
}

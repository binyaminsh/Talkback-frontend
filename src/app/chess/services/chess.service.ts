import { Injectable } from '@angular/core';
import { NgxChessBoardView, PieceIconInput } from 'ngx-chess-board';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { Game } from '../game';
import { GameState } from '../gameState';

@Injectable({
  providedIn: 'root',
})
export class ChessService {
  private _invitationAccepted = new BehaviorSubject<boolean>(false);
  public invitationAccepted$ = this._invitationAccepted.asObservable();

  public game?: Game;
  public gameStateObsv$ = new Subject<number>();
  public gameState: number = GameState.gameNotStarted;
  public colour?: string;

  private _pgn = new Subject<string>();
  public pgn$ = this._pgn.asObservable();
  public fen: string = '';

  public pieceIconInput!: PieceIconInput;

  public lightTileColor: string = 'rgb(240, 217, 181)';
  public darkTileColor: string = 'rgb(181, 136, 99)';

  private _gameoverMessage = new ReplaySubject<string>(1);
  public gameoverMessage$ = this._gameoverMessage.asObservable();

  public isSwitchedPage: boolean = false;

  public myFunc?: (coords: string) => void;

  constructor() {
    this.setIcons();
  }

  initGame(game: Game, colour: string) {
    if (this.gameState === GameState.gameOver) {
      this._gameoverMessage.next('');
    }
    this.gameState = GameState.gameActive;
    this.game = game;
    this.colour = colour;
    this.isSwitchedPage = false;
  }

  setInvitationAccepted(invitationAccepted: boolean) {
    this._invitationAccepted.next(invitationAccepted);
  }

  setTileColours(lightTileColor: string, darkTileColor: string) {
    this.lightTileColor = lightTileColor;
    this.darkTileColor = darkTileColor;
  }

  setGameoverMessage(message: string) {
    this._gameoverMessage.next(message);
    
    // TODO: Move this to a new method
    this.gameState = GameState.gameOver;
    this.gameStateObsv$.next(2);
  }

  setPGN(pgn: string) {
    this._pgn.next(pgn);
  }

  move(fn: (coords: string) => void) {
    this.myFunc = fn;
  }

  isBoardSync(fen: string): boolean {
    if (this.isSwitchedPage) {
      fen === this.fen
        ? (this.isSwitchedPage = false)
        : (this.isSwitchedPage = true);

      return false;
    } else {
      return true;
    }
  }

  isMoveAllowed(colour: string): boolean {
    // TODO: switch to gamestate !== active
    if (colour !== this.colour || this.gameState !== GameState.gameActive)
    {
      return false;
    }

    return true;
  }

  setIcons() {
    this.pieceIconInput = {
      whiteKingUrl: '../../../../assets/cburnett/wK.svg',
      whiteQueenUrl: '../../../../assets/cburnett/wQ.svg',
      whiteKnightUrl: '../../../../assets/cburnett/wN.svg',
      whiteRookUrl: '../../../../assets/cburnett/wR.svg',
      whitePawnUrl: '../../../../assets/cburnett/wP.svg',
      whiteBishopUrl: '../../../../assets/cburnett/wB.svg',
      blackKingUrl: '../../../../assets/cburnett/bK.svg',
      blackQueenUrl: '../../../../assets/cburnett/bQ.svg',
      blackKnightUrl: '../../../../assets/cburnett/bN.svg',
      blackRookUrl: '../../../../assets/cburnett/bR.svg',
      blackPawnUrl: '../../../../assets/cburnett/bP.svg',
      blackBishopUrl: '../../../../assets/cburnett/bB.svg',
    };
  }
}

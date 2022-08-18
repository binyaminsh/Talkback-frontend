import { Injectable } from '@angular/core';
import { ChessChatMessage } from '../chessMessage';

@Injectable({
  providedIn: 'root'
})
export class ChessChatService {

  messages: ChessChatMessage[] = [];

  constructor() { }

  initChatMessages() {
    this.messages = [];
  }
}

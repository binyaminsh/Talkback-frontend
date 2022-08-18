import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/users/user';
import { Conversation } from '../../conversation';
import { Message } from '../../message';
import { SignalrChatService } from '../../services/signalr-chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private destroySubject = new Subject();

  conversations?: Observable<Conversation[]>;
  conversationSelectedId?: string;

  constructor(private signalrChat: SignalrChatService) {
    this.conversations = signalrChat.conversations$;
    this.conversationSelectedId = signalrChat.conversationId;
  }

  ngOnInit(): void {
    this.signalrChat.GetUserConversations();
  }

  ngOnDestroy(): void {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}

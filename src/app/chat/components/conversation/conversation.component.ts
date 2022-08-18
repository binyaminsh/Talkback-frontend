import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/users/user';
import { Message } from '../../message';
import { SignalrChatService } from '../../services/signalr-chat.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
})
export class ConversationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() conversationId?: string;
  
  private destroySubject = new Subject();
  
  messages?: Observable<Message[]>;
  currentUser?: User;
  form?: FormGroup;

  constructor(
    public signalrChat: SignalrChatService,
    public authService: AuthService
  ) {
    authService.currentUser$
      .pipe(takeUntil(this.destroySubject))
      .subscribe((user) => {
        this.currentUser = user;
      });
    this.messages = this.signalrChat.messages$;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.conversationId) {
      this.signalrChat.getConversationHistory(this.conversationId);
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      message: new FormControl(''),
    });
  }

  async sendMessage() {
    if (this.conversationId) {
      let message: string = this.form!.controls['message'].value;
      if (!this.isEmptyOrSpaces(message)) {
        await this.signalrChat.sendMessage(this.conversationId, message);
        this.form!.reset();
      }
    }
  }

  isEmptyOrSpaces(str: string): boolean{
    return str === null || str.match(/^ *$/) !== null;
}

  ngOnDestroy(): void {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}

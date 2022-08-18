import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { LoginComponent } from './auth/components/login/login.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { HomeComponent } from './home/home.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { UserComponent } from './users/components/user/user.component';
import { ChatComponent } from './chat/components/chat/chat.component';
import { ConversationComponent } from './chat/components/conversation/conversation.component';
import { GameComponent } from './chess/components/game/game.component';
import { NgxChessBoardModule } from "ngx-chess-board";


@NgModule({
  declarations: [
    LoginComponent,
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    RegisterComponent,
    UserComponent,
    ChatComponent,
    ConversationComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FormsModule,
    NgxChessBoardModule.forRoot(),
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

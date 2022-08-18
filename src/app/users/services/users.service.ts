import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private httpClient: HttpClient) {}

  public getAllUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(environment.userUrl + 'api/Users');
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from './user.interface';
import { BASE_URL } from '../shared/base-url.token';

@Injectable()
export class ProfileService {
  private http = inject(HttpClient);
  baseUrl = inject(BASE_URL);

  getUserProfile(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/api/user/settings`);
  }

  updateUserProfile(userObj: User): Observable<string> {
    const userInfo = JSON.stringify(userObj);
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}/api/user/update`, userInfo, {
      headers,
      responseType: 'text'
    });
  }
}

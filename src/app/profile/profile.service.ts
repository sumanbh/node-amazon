import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ProfileService {
  baseUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/user/settings`);
  }

  updateUserProfile(userObj): Observable<any> {
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

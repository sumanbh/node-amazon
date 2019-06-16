import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ProfileService {
  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<any> {
    return this.http
      .get(`/api/user/settings`);
  }

  updateUserProfile(userObj): Observable<any> {
    const userInfo = JSON.stringify(userObj);
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http
      .post(`/api/user/update`, userInfo, { headers });
  }
}

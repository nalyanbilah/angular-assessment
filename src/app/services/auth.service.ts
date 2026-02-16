import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://test-demo.aemenersol.com/api/account/login';
  private tokenKey = 'auth_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { username, password }, { responseType: 'text' })
      .pipe(
        tap((token: string) => {
          console.log('Raw token received:', token);
          console.log('Token type:', typeof token);
          
          // Clean the token - remove quotes if present
          const cleanToken = token.replace(/^["']|["']$/g, '');
          console.log('Cleaned token:', cleanToken);
          
          this.setToken(cleanToken);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
  }

  setToken(token: string): void {
    console.log('Setting token in localStorage:', token);
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('Getting token from localStorage:', token);
    return token;
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }
}
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    console.log('Interceptor - Token:', token);
    console.log('Interceptor - Request URL:', request.url);
    
    if (token) {
      console.log('Interceptor - Adding Authorization header');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Interceptor - Headers:', request.headers.keys());
    } else {
      console.log('Interceptor - No token available');
    }
    
    return next.handle(request);
  }
}
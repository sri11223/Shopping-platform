import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'ecommerce_session_id';

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let headers: { [key: string]: string } = {
    'X-Session-Id': getSessionId(),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const modifiedReq = req.clone({ setHeaders: headers });
  return next(modifiedReq);
};

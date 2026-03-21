import { Injectable }   from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { Router }       from '@angular/router';
import { Observable, tap } from 'rxjs';

// ── Models (mirror backend/app/models.py) ─────────────────────────────────────
import {
  UserPublic,
  UsersPublic,
  UserCreate,
  UserRegister,
  UserUpdateMe,
  UserUpdate,
  UpdatePassword,
  Message,
} from '../models/user.model';
import { TokenResponse, NewPassword } from '../models/login.model';

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API       = 'http://localhost:8000/api/v1';
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY  = 'current_user';

  constructor(private http: HttpClient, private router: Router) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): UserPublic | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  isSuperuser(): boolean {
    return this.getUser()?.is_superuser === true;
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/login/access-token
   * Uses application/x-www-form-urlencoded (OAuth2 password flow).
   * The interceptor is skipped for this endpoint.
   */
  login(email: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    return this.http.post<TokenResponse>(
      `${this.API}/login/access-token`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.access_token);
        // Pre-load the user profile after login
        this.loadUserMe().subscribe();
      })
    );
  }

  /**
   * POST /api/v1/login/test-token
   * Verifies the current JWT token. Bearer injected by interceptor.
   */
  testToken(): Observable<UserPublic> {
    return this.http.post<UserPublic>(`${this.API}/login/test-token`, {});
  }

  // ── PASSWORD RECOVERY ──────────────────────────────────────────────────────

  /**
   * POST /api/v1/password-recovery/{email}  — public
   */
  forgotPassword(email: string): Observable<Message> {
    return this.http.post<Message>(
      `${this.API}/password-recovery/${encodeURIComponent(email)}`,
      {}
    );
  }

  /**
   * POST /api/v1/reset-password/  — public
   */
  resetPassword(token: string, newPassword: string): Observable<Message> {
    const body: NewPassword = { token, new_password: newPassword };
    return this.http.post<Message>(`${this.API}/reset-password/`, body);
  }

  /**
   * POST /api/v1/password-recovery-html-content/{email}
   * Superuser only — Bearer injected by interceptor.
   */
  getPasswordRecoveryHtml(email: string): Observable<string> {
    return this.http.post(
      `${this.API}/password-recovery-html-content/${encodeURIComponent(email)}`,
      {},
      { responseType: 'text' }
    );
  }

  // ── CURRENT USER (/users/me) ───────────────────────────────────────────────

  /**
   * GET /api/v1/users/me — Bearer injected by interceptor.
   */
  loadUserMe(): Observable<UserPublic> {
    return this.http.get<UserPublic>(`${this.API}/users/me`).pipe(
      tap(user => localStorage.setItem(this.USER_KEY, JSON.stringify(user)))
    );
  }

  /**
   * PATCH /api/v1/users/me — Bearer injected by interceptor.
   */
  updateMe(data: UserUpdateMe): Observable<UserPublic> {
    return this.http.patch<UserPublic>(`${this.API}/users/me`, data).pipe(
      tap(user => localStorage.setItem(this.USER_KEY, JSON.stringify(user)))
    );
  }

  /**
   * PATCH /api/v1/users/me/password — Bearer injected by interceptor.
   */
  updatePassword(data: UpdatePassword): Observable<Message> {
    return this.http.patch<Message>(`${this.API}/users/me/password`, data);
  }

  /**
   * DELETE /api/v1/users/me — Bearer injected by interceptor.
   */
  deleteMe(): Observable<Message> {
    return this.http.delete<Message>(`${this.API}/users/me`);
  }

  // ── SELF REGISTRATION ──────────────────────────────────────────────────────

  /**
   * POST /api/v1/users/signup  — public, no auth needed.
   */
  signup(data: UserRegister): Observable<UserPublic> {
    return this.http.post<UserPublic>(`${this.API}/users/signup`, data);
  }

  // ── ADMIN: USER MANAGEMENT ─────────────────────────────────────────────────

  /**
   * GET /api/v1/users/  (superuser) — Bearer injected by interceptor.
   */
  getAllUsers(skip = 0, limit = 100): Observable<UsersPublic> {
    return this.http.get<UsersPublic>(
      `${this.API}/users/?skip=${skip}&limit=${limit}`
    );
  }

  /**
   * POST /api/v1/users/  (superuser) — Bearer injected by interceptor.
   */
  createUser(data: UserCreate): Observable<UserPublic> {
    return this.http.post<UserPublic>(`${this.API}/users/`, data);
  }

  /**
   * GET /api/v1/users/{user_id} — Bearer injected by interceptor.
   */
  getUserById(userId: string): Observable<UserPublic> {
    return this.http.get<UserPublic>(`${this.API}/users/${userId}`);
  }

  /**
   * PATCH /api/v1/users/{user_id}  (superuser) — Bearer injected by interceptor.
   */
  updateUserById(userId: string, data: UserUpdate): Observable<UserPublic> {
    return this.http.patch<UserPublic>(`${this.API}/users/${userId}`, data);
  }

  /**
   * DELETE /api/v1/users/{user_id}  (superuser) — Bearer injected by interceptor.
   */
  deleteUserById(userId: string): Observable<Message> {
    return this.http.delete<Message>(`${this.API}/users/${userId}`);
  }

  // ── PRIVATE (/private/users) ───────────────────────────────────────────────

  /**
   * POST /api/v1/private/users/  (superuser only) — Bearer injected by interceptor.
   */
  createUserPrivate(data: UserCreate): Observable<UserPublic> {
    return this.http.post<UserPublic>(`${this.API}/private/users/`, data);
  }

  // ── SESSION ────────────────────────────────────────────────────────────────

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }
}
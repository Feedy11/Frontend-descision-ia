import { Routes }                    from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/auth.guard';

import { LoginComponent }           from './auth/login/login.component';
import { ForgotPasswordComponent }  from './auth/forgot-password/forgot-password.component';
import { ResetPasswordRequestComponent } from './auth/reset-password-request/reset-password-request.component';
import { ResetPasswordConfirmComponent } from './auth/reset-password-confirm/reset-password-confirm.component';
import { ProfileComponent }         from './auth/profile/profile.component';
import { UsersComponent }           from './users/users.component';
import { DashboardComponent }       from './dashboard/dashboard.component';
import { AdminUserListComponent }   from './admin/users/admin-users-list/admin-users-list.component';
import { AdminUserFormComponent }   from './admin/users/admin-user-form/admin-user-form.component';
import { UploadComponent } from './upload/upload.component';
import { DatasetsListComponent } from './datasets-list/datasets-list.component';

export const routes: Routes = [
  // Public routes (redirect to /dashboard if already logged in)
  { path: 'login',            component: LoginComponent,          canActivate: [guestGuard] },
  { path: 'pass',             component: ForgotPasswordComponent                            },

  // New Password Reset Flow
  { path: 'reset-password',         component: ResetPasswordRequestComponent, canActivate: [guestGuard] },
  { path: 'reset-password/:token',  component: ResetPasswordConfirmComponent, canActivate: [guestGuard] },

  // Protected routes
  { path: 'dashboard',        component: DashboardComponent,      canActivate: [authGuard]  },
  { path: 'profile',          component: ProfileComponent,        canActivate: [authGuard]  },
  { path: 'users',            component: UsersComponent,          canActivate: [authGuard]  },
  {path:'upload',component:UploadComponent,canActivate:[authGuard] },
  { path: 'datasets', component: DatasetsListComponent, canActivate: [authGuard] },
  // Admin routing
  { path: 'admin/users',          component: AdminUserListComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/users/new',      component: AdminUserFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/users/:id/edit', component: AdminUserFormComponent, canActivate: [authGuard, adminGuard] },

  // Default redirect
  { path: '',                 redirectTo: 'login',    pathMatch: 'full' },
  { path: '**',               redirectTo: 'login'                       },
];

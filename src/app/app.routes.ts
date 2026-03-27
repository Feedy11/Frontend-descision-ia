import { Routes }                         from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/auth.guard';

import { LoginComponent }                  from './auth/login/login.component';
import { ForgotPasswordComponent }         from './auth/forgot-password/forgot-password.component';
import { ResetPasswordRequestComponent }   from './auth/reset-password-request/reset-password-request.component';
import { ResetPasswordConfirmComponent }   from './auth/reset-password-confirm/reset-password-confirm.component';
import { ProfileComponent }                from './auth/profile/profile.component';
import { UsersComponent }                  from './users/users.component';
import { DashboardComponent }              from './dashboard/dashboard.component';
import { AdminUserListComponent }          from './admin/users/admin-users-list/admin-users-list.component';
import { AdminUserFormComponent }          from './admin/users/admin-user-form/admin-user-form.component';
import { UploadComponent }                 from './upload/upload.component';
import { DatasetsListComponent }           from './datasets-list/datasets-list.component';
import { DataLayoutComponent }             from './shared/data-layout/data-layout.component';
import { CleaningComponent } from './cleaning/cleaning.component';

export const routes: Routes = [

  //Routes publiques
  { path: 'login',           component: LoginComponent,                 canActivate: [guestGuard] },
  { path: 'pass',            component: ForgotPasswordComponent                                    },
  { path: 'reset-password',         component: ResetPasswordRequestComponent, canActivate: [guestGuard] },
  { path: 'reset-password/:token',  component: ResetPasswordConfirmComponent, canActivate: [guestGuard] },

  //Routes protégées standard
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile',   component: ProfileComponent,   canActivate: [authGuard] },
  { path: 'users',     component: UsersComponent,     canActivate: [authGuard] },
  { path: 'cleaning', component: CleaningComponent, canActivate: [authGuard] },

  //Section Data
  {
    path     : '',
    component: DataLayoutComponent,
    canActivate: [authGuard],
    children : [
      { path: 'upload',   component: UploadComponent      },
      { path: 'datasets', component: DatasetsListComponent },

    ]
  },

  //Admin
  { path: 'admin/users',          component: AdminUserListComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/users/new',      component: AdminUserFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/users/:id/edit', component: AdminUserFormComponent, canActivate: [authGuard, adminGuard] },

  //Défaut
  { path: '',   redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login'                    },
];

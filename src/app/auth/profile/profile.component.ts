import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector   : 'app-profile',
  standalone : true,
  imports    : [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls  : ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user = {
    firstName   : 'fadi',
    lastName    : 'naffeti',
    email       : 'fadi@gmail.com',
    jobTitle    : '',
    organization: '',
    role        : 'analyste'
  };

  get initials(): string {
    const f = this.user.firstName?.charAt(0) ?? '';
    const l = this.user.lastName?.charAt(0)  ?? '';
    return (f + l).toUpperCase() || 'U';
  }
  stats = {
    analyses  : 0,
    dashboards: 0,
    kpis      : 0
  };
  passwords = {
    current: '',
    newPwd : '',
    confirm: ''
  };

  showCurrentPwd = false;
  showNewPwd     = false;
  showConfirmPwd = false;

  preferences = {
    language  : 'en',
    timezone  : 'Africa/Tunis',
    emailNotif: true,
    twoFactor : false
  };

  isSavingPersonal  = false;
  isSavingPassword  = false;

  successPersonal   = '';
  errorPersonal     = '';

  successPassword   = '';
  errorPassword     = '';

  constructor(private authService: AuthService,private toastr: ToastrService) {}
  ngOnInit(): void {
    this.authService.loadUserMe().subscribe({
      next: (me) => {
        // full_name from backend: split into firstName / lastName
        const parts = (me.full_name ?? '').split(' ');
        this.user.firstName = parts[0] ?? '';
        this.user.lastName  = parts.slice(1).join(' ');
        this.user.email     = me.email;
        this.user.role      = me.is_superuser ? 'admin' : 'analyst';
      },
      error: () => {
      }
    });
  }

  savePersonal(): void {
    this.successPersonal = '';
    this.errorPersonal   = '';

    if (!this.user.firstName.trim() || !this.user.lastName.trim()) {
      this.errorPersonal = 'Le prénom et le nom sont obligatoires.';
      return;
    }

    this.isSavingPersonal = true;

    // combine firstName + lastName back into full_name for the backend
    const fullName = `${this.user.firstName.trim()} ${this.user.lastName.trim()}`.trim();
    this.authService.updateMe({
      full_name: fullName || null,
      email    : this.user.email.trim()
    }).subscribe({
      next: () => {
        this.isSavingPersonal = false;
        this.successPersonal  = 'Profil mis à jour avec succès.';
        setTimeout(() => this.successPersonal = '', 3000);
      },
      error: (err) => {
        this.isSavingPersonal = false;
        this.errorPersonal    = err.error?.detail || 'Erreur lors de la mise à jour.';
      }
    });
  }
  changePassword(): void {
    this.successPassword = '';
    this.errorPassword   = '';

    if (!this.passwords.current) {
      this.errorPassword = 'Le mot de passe actuel est obligatoire.'; return;
    }
    if (!this.passwords.newPwd || this.passwords.newPwd.length < 8) {
      this.errorPassword = 'Le nouveau mot de passe doit contenir au moins 8 caractères.'; return;
    }
    if (this.passwords.newPwd !== this.passwords.confirm) {
      this.errorPassword = 'Les mots de passe ne correspondent pas.'; return;
    }

    this.isSavingPassword = true;

    this.authService.updatePassword({
      current_password: this.passwords.current,
      new_password    : this.passwords.newPwd
    }).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.successPassword  = 'Mot de passe modifié avec succès.';
        this.passwords = { current: '', newPwd: '', confirm: '' };
        setTimeout(() => this.successPassword = '', 3000);
      },
      error: (err) => {
        this.isSavingPassword = false;
        if (err.status === 400) {
          this.errorPassword = 'Mot de passe actuel incorrect.';
        } else {
          this.errorPassword = err.error?.detail || 'Erreur lors du changement.';
        }
      }
    });
  }
  savePreferences(): void {
    localStorage.setItem('preferences', JSON.stringify(this.preferences));
  }

  // ==== Delete Account ====
  showDeleteModal = false;
  isDeletingAccount = false;
  deleteAccountError = '';

  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
    this.deleteAccountError = '';
  }

  cancelDeleteAccount(): void {
    this.showDeleteModal = false;
    this.deleteAccountError = '';
  }

  deleteAccount(): void {
    this.isDeletingAccount = true;
    this.deleteAccountError = '';

    this.authService.deleteMe().subscribe({
      next: () => {
        this.isDeletingAccount = false;
        this.authService.clearSession();
        window.location.href = '/login'; // hard redirect to clear state
      },
      error: (err) => {
        this.isDeletingAccount = false;
        this.deleteAccountError = err.error?.detail || 'Erreur lors de la suppression de votre compte.';
      }
    });
  }
}

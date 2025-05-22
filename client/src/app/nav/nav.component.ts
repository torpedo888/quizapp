import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TitleCasePipe } from '@angular/common';
import { HasRoleDirective } from '../_directives/has-role.directive';

import { CommonModule } from '@angular/common';

import { LanguageService } from '../_services/language.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    FormsModule,
    BsDropdownModule,
    RouterLink,
    RouterLinkActive,
    TitleCasePipe,
    HasRoleDirective,
    CommonModule
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent {
  accountService = inject(AccountService);
  public languageService = inject(LanguageService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  model: any = {};

  showLoginForm = false;

  isDesktopView = true;

  languages = [
    { code: 'en', name: 'English', flag: 'assets/flags/gb.png' },
    { code: 'hu', name: 'Magyar', flag: 'assets/flags/hu.png' }
  ];

  currentLanguage = computed(() => this.languageService.language());

  login() {
    console.log(this.model);

    this.accountService.login(this.model).subscribe({
      next: (_) => {
        void this.router.navigateByUrl('/quiz');
        this.showLoginForm = false;
      },
      error: (error) => this.toastr.error(error.error),
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

  toggleLoginForm() {
    this.showLoginForm = !this.showLoginForm;
  }

  navigateToRegister() {
    this.router.navigate(['/register']); // or whatever your registration route is
  }

  checkScreenWidth() {
    this.isDesktopView = window.innerWidth > 768;
  }

  changeLanguage(lang: string) {
    this.languageService.setLanguage(lang);
    window.location.reload(); // Force full reload to reflect the new language
  }

  getLanguageName(code: string): string {
    const lang = this.languages.find(l => l.code === code);
    return lang ? lang.name : code;
  }

  getCurrentLangFlag(): string {
    const lang = this.languages.find(l => l.code === this.currentLanguage());
    return lang?.flag ?? 'assets/flags/default.png';
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TitleCasePipe } from '@angular/common';
import { HasRoleDirective } from '../_directives/has-role.directive';

import { CommonModule } from '@angular/common';

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
  private router = inject(Router);
  private toastr = inject(ToastrService);
  model: any = {};

  showLoginForm = false;

  isDesktopView = true;

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
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common'; 
import { AdminService } from '../../_services/admin.service';
import { User } from '../../_models/User';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, NgFor], // Ensure NgFor is imported
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'] // Corrected "styleUrl" to "styleUrls"
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(BsModalService);
  users: User[] = [];
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  openRolesModal(user: User) {
    const initialState = {
      title: 'User role',
      username: user.username,
      selectedRoles: [...user.roles],
      availableRoles: ['Admin', 'Moderator', 'Member'],
      users: this.users,
      rolesUpdated: false
    };

    const modalConfig: ModalOptions = { 
      class: 'modal-lg', 
      initialState 
    };

    this.bsModalRef = this.modalService.show(RolesModalComponent, modalConfig);
    this.bsModalRef.onHide?.subscribe({
      next: () => {
        if(this.bsModalRef.content && this.bsModalRef.content.rolesUpdated) {
          const selectedRoles = this.bsModalRef.content.selectedRoles;
          this.adminService.updateUserRoles(user.username, selectedRoles).subscribe({
            next: roles => user.roles = roles
          })
        }
      }
    })
  }

  getUsersWithRoles() {
    this.adminService.getUserWithRoles().subscribe({
      next: users => this.users = users
    });
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-roles-modal',
  standalone: true,
  imports: [CommonModule, NgFor], // Ensure NgFor is imported
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.css'] // Corrected "styleUrl" to "styleUrls"
})
export class RolesModalComponent implements OnInit{
  bsModalRef = inject(BsModalRef);
  username = '';
  title = '';
  availableRoles: string[] = [];
  selectedRoles: string[] = [];
  rolesUpdated = false;

  ngOnInit() {
    console.log('Available roles:', this.availableRoles);
  }

  updateChecked(checkedValue: string) {
    if(this.selectedRoles.includes(checkedValue)){
      this.selectedRoles = this.selectedRoles.filter(r=> r !== checkedValue);
    } else {
      this.selectedRoles.push(checkedValue);
    }

    console.log(this.selectedRoles);  
  }

  onSelectedRoles() {
    this.rolesUpdated = true;
    this.bsModalRef.hide();
  }

}
import { Component, inject, OnInit } from '@angular/core';
import { RegisterComponent } from '../register/register.component';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  http = inject(HttpClient);
  registerMode = false;
  users: any;

  ngOnInit(): void {

  }
}

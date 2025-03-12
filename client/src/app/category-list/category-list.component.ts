import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../_services/category.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-category-list',
  standalone: true,
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  imports: [CommonModule, RouterModule]
})
export class CategoryListComponent implements OnInit {
  categories: any[] = [];

  constructor(private categoryService: CategoryService, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  selectCategory(categoryId: number): void {
    this.router.navigate(['/quizzes', categoryId]);
  }
}

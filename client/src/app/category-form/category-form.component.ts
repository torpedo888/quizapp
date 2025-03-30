import { Component, Input, OnInit } from '@angular/core';
import { CategoryService } from '../_services/category.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class CategoryFormComponent implements OnInit {
  categoryId: number | null = null;
  categoryName: string = '';
  selectedFile: File | null = null;
  previewImage: string | null = null;
  errorMessage: string = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.categoryId = +id;
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategory(id: number): void {
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.categoryName = category.name;
        this.previewImage = `https://localhost:5001${category.imageUrl}`;
      },
      error: (err) => {
        console.error('Error loading category', err);
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0]; // Temporary variable
      this.selectedFile = file;
  
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
  
      if (file) {
        reader.readAsDataURL(file);
      }
    }
  }
  

  addCategory(): void {
    if (!this.categoryName || !this.selectedFile) {
      this.errorMessage = 'Please enter a category name and select an image.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.categoryName);
    formData.append('imageFile', this.selectedFile);

    this.categoryService.uploadCategory(formData).subscribe({
      next: () => this.router.navigate(['/categories']),
      error: (err) => {
        console.error('Error adding category', err);
        this.errorMessage = 'Failed to add category.';
      }
    });
  }

  saveCategory(): void {
    if (!this.categoryName || (!this.selectedFile && !this.categoryId)) {
      this.errorMessage = 'Please enter a category name and select an image.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.categoryName);
    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile);
    }

    this.categoryService.uploadCategory(formData).subscribe({
      next: () => this.router.navigate(['/categories']),
      error: (err) => {
        console.error('Error adding category', err);
        this.errorMessage = 'Failed to add category.';
      }
    });
  }
}

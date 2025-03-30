import { Component, OnInit } from '@angular/core';
import { Category } from '../_models/Category';
import { CategoryService } from '../_services/category.service';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-edit',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './category-edit.component.html',
  styleUrl: './category-edit.component.css'
})

export class CategoryEditComponent implements OnInit {
  categories: EditableCategory[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories(false);
  }

  loadCategories(onlyActive: boolean): void {
    this.categoryService.getCategories(onlyActive).subscribe((data: Category[]) => {
      this.categories = data.map(category => ({
        ...category,
        editing: false,
        editedName: category.name,
        editedImage: null,
        imageUrl: category.imageUrl || 'assets/default-thumbnail.jpg' // Fallback if no image
      })) as EditableCategory[];
    });
  }

  editCategory(category: EditableCategory): void {
    category.editing = true;
  }

  onFileSelected(event: Event, category: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      category.editedImage = input.files[0];
    }
  }

  saveCategory(category: any): void {
    if (!category.editedName.trim()) {
      alert("Category name cannot be empty!");
      return;
    }
  
    this.categoryService.updateCategory(category.id, category.editedName, category.editedImage)
      .subscribe(() => {
        category.name = category.editedName; // Update name in UI
        if (category.editedImage) {
          category.imageUrl = URL.createObjectURL(category.editedImage); // Show updated image
        }
        category.editing = false; // Exit edit mode
      });
  }

  cancelEdit(category: EditableCategory): void {
    category.editing = false;
    category.editedName = category.name;
  }

  deactivateCategory(categoryId: number): void {
    if (confirm('Are you sure you want to deactivate this category?')) {
      this.categoryService.setCategoryInactive(categoryId).subscribe(() => {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
          category.isActive = false; // UI updates instantly
        }
      });
    }
  }

  activateCategory(categoryId: number): void {
    this.categoryService.setCategoryActive(categoryId).subscribe(() => {
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        category.isActive = true; // UI updates instantly
      }
    });
  }
}

interface EditableCategory extends Category {
  editing: boolean;
  editedName: string;
  editedImage: File | null;
}
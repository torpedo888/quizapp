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

  newCategory: { name: string; imageUrl: string | null; imageFile: File | null } | null = null;

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

  addNewCategory(): void {
    this.newCategory = { name: '', imageUrl: null, imageFile: null };
  }
  
  onNewFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.newCategory) {
          this.newCategory.imageUrl = e.target.result; // Show preview
          this.newCategory.imageFile = file;
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
  saveNewCategory(): void {
    if (!this.newCategory?.name.trim()) {
      alert('Category name cannot be empty!');
      return;
    }
  
    // Prepare form data for API call
    const formData = new FormData();
    formData.append('name', this.newCategory.name);
    if (this.newCategory.imageFile) {
      formData.append('image', this.newCategory.imageFile);
    }
  
    this.categoryService.addCategory(formData).subscribe((newCat) => {
      this.loadCategories(false); // Reload categories after adding
      this.newCategory = null; // Reset form
    });
  }
  
  cancelNewCategory(): void {
    this.newCategory = null;
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

  deleteCategory(id: number) {
    if (confirm("Are you sure you want to delete this category?")) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== id);
        },
        error: err => {
          console.error("Error deleting category", err);
        }
      })
    }
  }
}

interface EditableCategory extends Category {
  editing: boolean;
  editedName: string;
  editedImage: File | null;
}
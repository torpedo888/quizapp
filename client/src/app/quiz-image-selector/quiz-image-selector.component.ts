import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-image-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-image-selector.component.html',
  styleUrl: './quiz-image-selector.component.css'
})
export class QuizImageSelectorComponent implements OnInit {
  @Output() imageSelected = new EventEmitter<string>();
  images: string[] = []
  loading = true;
  selectedImageUrl: string | null = null;

  private apiUrl = environment.apiUrl + 'images';

  constructor(private http: HttpClient) {};

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages() {
    this.http.get<string[]>(this.apiUrl + '/list').subscribe({
      next: (result) => {
        this.images = result;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.error('Failed to load images');
      }
    });
  }

  selectImage(img: string) {
    this.selectedImageUrl = img;
    this.imageSelected.emit(this.selectedImageUrl);
  }

}

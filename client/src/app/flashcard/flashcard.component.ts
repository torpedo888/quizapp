import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-flashcard',
  standalone: true,  // ✅ Makes the component standalone
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css']
})
export class FlashcardComponent {
  @Input() frontText: string = '';
  @Input() backText: string = '';
  
  isFlipped = false;

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
  }
}

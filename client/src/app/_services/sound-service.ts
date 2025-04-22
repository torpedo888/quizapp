import { Injectable } from '@angular/core';
import { SoundType } from '../Enums/SoundType';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  private soundPaths: Record<SoundType, string> = {
    [SoundType.Success]: '../assets/sounds/success_bell.mp3',
    [SoundType.Error]: '../assets/sounds/negative_beeps-6008.mp3',
    [SoundType.Click]: '../assets/sounds/click.mp3'
  };

  private isSoundEnabledInternal = true;

  get isSoundEnabled(): boolean {
    return this.isSoundEnabledInternal;
  }

  toggleSound(): void {
    this.isSoundEnabledInternal = !this.isSoundEnabledInternal;
  }

  playSound(type: SoundType): void {
    if (!this.isSoundEnabled) return;

    const filePath = this.soundPaths[type];
    if (!filePath) {
      console.warn('No sound path defined for type:', type);
      return;
    }

    this.tryPlayAudio(filePath, type);
  }

  private tryPlayAudio(filePath: string, type: SoundType): void {
    try {
      const audio = new Audio(filePath);
      audio.load();
      audio.play().catch(error => {
        console.error(`Sound playback (${type}) failed:`, error);
      });
    } catch (error) {
      console.error(`Error initializing audio for ${type}:`, error);
    }
  }

  getSoundStatus(): boolean {
    return this.isSoundEnabled;
  }
}

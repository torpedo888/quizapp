import { Injectable, signal } from '@angular/core';

const LANGUAGE_KEY = 'selectedLanguage';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor() { }

  private _language = signal<string>(localStorage.getItem(LANGUAGE_KEY) || 'en');
  language = this._language.asReadonly();

  setLanguage(lang: string) {
    localStorage.setItem(LANGUAGE_KEY, lang);
    this._language.set(lang);
  }

  getCurrentLanguage(): string {
    return this._language();
  }
}

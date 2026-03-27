import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-input">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        [placeholder]="placeholder()"
        [(ngModel)]="value"
        (ngModelChange)="onInput($event)"
      />
      <button class="clear-btn" *ngIf="value()" (click)="clear()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  `,
  styles: `
    .search-input {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      width: 16px;
      height: 16px;
      color: rgba(77, 138, 255, 0.5);
      pointer-events: none;
      transition: color 300ms ease;
    }

    input {
      width: 100%;
      padding: 10px 36px 10px 40px;
      background: rgba(15, 20, 40, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(77, 138, 255, 0.1);
      border-radius: 12px;
      font-size: 13px;
      color: #e8eeff;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    input:focus {
      outline: none;
      border-color: rgba(77, 138, 255, 0.4);
      background: rgba(15, 20, 40, 0.8);
      box-shadow:
        0 0 20px rgba(77, 138, 255, 0.15),
        0 0 40px rgba(77, 138, 255, 0.05),
        inset 0 0 20px rgba(77, 138, 255, 0.03);
    }

    input:focus ~ .search-icon,
    .search-input:focus-within .search-icon {
      color: #4d8aff;
    }

    input::placeholder {
      color: #4a5568;
      font-size: 12px;
    }

    .clear-btn {
      position: absolute;
      right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: rgba(77, 138, 255, 0.08);
      color: #8892b0;
      opacity: 0;
      transition: all 200ms ease;
    }

    .search-input:hover .clear-btn,
    input:focus ~ .clear-btn,
    .clear-btn:hover {
      opacity: 1;
    }

    .clear-btn svg {
      width: 14px;
      height: 14px;
    }

    .clear-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }
  `,
})
export class SearchInputComponent {
  placeholder = input<string>('Buscar...');
  value = signal<string>('');

  search = output<string>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onInput(value: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.search.emit(value);
    }, 300);
  }

  clear(): void {
    this.value.set('');
    this.search.emit('');
  }
}

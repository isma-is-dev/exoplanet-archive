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
      left: 12px;
      width: 18px;
      height: 18px;
      color: #8892b0;
      pointer-events: none;
    }

    input {
      width: 100%;
      padding: 10px 36px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      font-size: 14px;
      color: #f0f4ff;
      transition: all 150ms ease;
    }

    input:focus {
      outline: none;
      border-color: #5e8eff;
      background: rgba(255, 255, 255, 0.08);
    }

    input::placeholder {
      color: #4a5568;
    }

    .clear-btn {
      position: absolute;
      right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: #8892b0;
      opacity: 0;
      transition: opacity 150ms ease;
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
      background: rgba(239, 68, 68, 0.2);
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

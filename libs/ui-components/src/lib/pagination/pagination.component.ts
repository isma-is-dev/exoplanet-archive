import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages() > 1) {
      <div class="pagination">
        <button
          class="page-btn nav-btn"
          [disabled]="currentPage() === 1"
          (click)="goToPage(currentPage() - 1)"
        >
          ←
        </button>

        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="ellipsis">···</span>
          } @else {
            <button
              class="page-btn"
              [class.active]="page === currentPage()"
              (click)="goToPage(page)"
            >
              {{ page }}
            </button>
          }
        }

        <button
          class="page-btn nav-btn"
          [disabled]="currentPage() === totalPages()"
          (click)="goToPage(currentPage() + 1)"
        >
          →
        </button>
      </div>
    }
  `,
  styles: `
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 24px 0;
    }

    .page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 38px;
      height: 38px;
      padding: 0 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      background: rgba(15, 20, 40, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #8892b0;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
    }

    .page-btn:hover:not(:disabled) {
      background: rgba(77, 138, 255, 0.1);
      border-color: rgba(77, 138, 255, 0.2);
      color: #e8eeff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .page-btn.active {
      background: rgba(77, 138, 255, 0.15);
      border-color: rgba(77, 138, 255, 0.4);
      color: #4d8aff;
      box-shadow: 0 0 15px rgba(77, 138, 255, 0.2);
      text-shadow: 0 0 8px rgba(77, 138, 255, 0.4);
    }

    .page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .nav-btn {
      font-size: 16px;
    }

    .ellipsis {
      color: rgba(77, 138, 255, 0.3);
      padding: 0 4px;
      font-size: 14px;
      letter-spacing: 2px;
    }
  `,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();

  pageChange = output<number>();

  visiblePages = computed<number[]>(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push(-1); // -1 represents ellipsis
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      pages.push(total);
    }

    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination" *ngIf="totalPages() > 1">
      <button
        class="page-btn"
        [disabled]="currentPage() === 1"
        (click)="goToPage(currentPage() - 1)"
      >
        ←
      </button>

      <ng-container *ngFor="let page of visiblePages()">
        <button
          *ngIf="page !== '...'; else ellipsis"
          class="page-btn"
          [class.active]="page === currentPage()"
          (click)="goToPage(page as number)"
        >
          {{ page }}
        </button>
        <ng-template #ellipsis>
          <span class="ellipsis">...</span>
        </ng-template>
      </ng-container>

      <button
        class="page-btn"
        [disabled]="currentPage() === totalPages()"
        (click)="goToPage(currentPage() + 1)"
      >
        →
      </button>
    </div>
  `,
  styles: `
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 16px 0;
    }

    .page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      padding: 0 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #8892b0;
      transition: all 150ms ease;
      cursor: pointer;
    }

    .page-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.16);
      color: #f0f4ff;
    }

    .page-btn.active {
      background: rgba(94, 142, 255, 0.15);
      border-color: rgba(94, 142, 255, 0.4);
      color: #5e8eff;
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .ellipsis {
      color: #4a5568;
      padding: 0 4px;
    }
  `,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();

  pageChange = output<number>();

  visiblePages = computed<(number | string)[]>(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
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

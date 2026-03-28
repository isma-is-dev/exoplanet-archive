import { Component, input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Exoplanet } from '@exodex/shared-types';
import { renderPlanet } from '@exodex/planet-renderer';

@Component({
  selector: 'app-planet-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="planet-avatar" [class]="'planet-avatar--' + size()" [innerHTML]="svgContent()"></div>
  `,
  styles: `
    .planet-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      position: relative;
    }

    .planet-avatar--micro {
      width: 32px;
      height: 32px;
    }

    .planet-avatar--card {
      width: 120px;
      height: 120px;
      filter: drop-shadow(0 0 8px rgba(77, 138, 255, 0.15));
    }

    .planet-avatar--detail {
      width: 320px;
      height: 320px;
      filter: drop-shadow(0 0 30px rgba(77, 138, 255, 0.2)) drop-shadow(0 0 60px rgba(168, 85, 247, 0.1));
    }

    .planet-avatar :deep(svg) {
      width: 100%;
      height: 100%;
    }
  `,
})
export class PlanetAvatarComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);

  planet = input.required<Exoplanet>();
  size = input.required<'micro' | 'card' | 'detail'>();

  svgContent = signal<SafeHtml>('');

  ngOnInit(): void {
    const p = this.planet();
    const renderParams = {
      radiusEarth: p.radiusEarth,
      massEarth: p.massEarth,
      equilibriumTempK: p.equilibriumTempK,
      planetType: p.planetType,
      densityGCC: p.densityGCC,
      eccentricity: p.eccentricity,
      insolationFlux: p.insolationFlux,
      discoveryYear: p.discoveryYear,
      orbitalPeriodDays: p.orbitalPeriodDays,
      size: this.size(),
      animationsEnabled: this.size() !== 'micro',
    };

    const result = renderPlanet(renderParams, p.name);
    this.svgContent.set(this.sanitizer.bypassSecurityTrustHtml(result.svgString));
  }
}

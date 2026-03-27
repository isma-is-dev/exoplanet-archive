import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exoplanet } from '@exodex/shared-types';

@Component({
  selector: 'app-system-orbit-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="system-orbit-container">
      <div class="system-title">
        <svg class="title-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/></svg>
        {{ systemName() || 'System Map' }}
      </div>

      <!-- Habitable zone legend -->
      @if (hzBand()) {
        <div class="hz-legend">
          <span class="hz-dot"></span> Potentially Habitable
        </div>
      }

      <svg class="system-svg" viewBox="-160 -160 320 320" preserveAspectRatio="xMidYMid meet" overflow="visible">
        <defs>
          <radialGradient id="sys-star-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="60%" [attr.stop-color]="starColor()" stop-opacity="0.9" />
            <stop offset="100%" [attr.stop-color]="starColor()" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="sys-star-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" [attr.stop-color]="starColor()" stop-opacity="0.25" />
            <stop offset="100%" [attr.stop-color]="starColor()" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="sys-planet-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4d8aff" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#4d8aff" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Background scatter stars -->
        @for (star of bgStars(); track $index) {
          <circle [attr.cx]="star.x" [attr.cy]="star.y" [attr.r]="star.s" fill="white" [attr.opacity]="star.o">
            <animate attributeName="opacity" [attr.values]="star.o + ';' + (star.o * 0.3) + ';' + star.o" [attr.dur]="star.dur + 's'" repeatCount="indefinite" />
          </circle>
        }

        <!-- Habitable zone band (annular ring) -->
        @if (hzBand(); as hz) {
          <circle cx="0" cy="0" [attr.r]="(hz.inner + hz.outer) / 2"
            fill="none"
            stroke="rgba(34, 197, 94, 0.12)"
            [attr.stroke-width]="hz.outer - hz.inner"
          />
          <circle cx="0" cy="0" [attr.r]="hz.inner" fill="none" stroke="rgba(34, 197, 94, 0.15)" stroke-width="0.5" stroke-dasharray="3 3" />
          <circle cx="0" cy="0" [attr.r]="hz.outer" fill="none" stroke="rgba(34, 197, 94, 0.15)" stroke-width="0.5" stroke-dasharray="3 3" />
        }

        <!-- Orbit tracks (ellipses with eccentricity) -->
        @for (orbit of mappedOrbits(); track orbit.id) {
          <ellipse
            [attr.cx]="orbit.cx" cy="0"
            [attr.rx]="orbit.rx"
            [attr.ry]="orbit.ry"
            fill="none"
            [attr.stroke]="orbit.isCurrent ? 'rgba(77, 138, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'"
            [attr.stroke-width]="orbit.isCurrent ? 1.2 : 0.6"
          />
          @if (orbit.isCurrent) {
            <ellipse
              [attr.cx]="orbit.cx" cy="0"
              [attr.rx]="orbit.rx"
              [attr.ry]="orbit.ry"
              fill="none"
              stroke="rgba(77, 138, 255, 0.12)"
              stroke-width="6"
            />
          }
        }

        <!-- Star -->
        <circle cx="0" cy="0" r="28" fill="url(#sys-star-halo)" />
        <circle cx="0" cy="0" r="12" fill="url(#sys-star-core)" />
        <circle cx="0" cy="0" r="4" fill="#fff" opacity="0.95" />

        <!-- Planets orbiting -->
        @for (orbit of mappedOrbits(); track orbit.id) {
          <g>
            <!-- Planet dot -->
            <circle
              [attr.r]="orbit.planetR"
              [attr.fill]="orbit.isCurrent ? '#4d8aff' : orbit.color"
              [attr.opacity]="orbit.isCurrent ? 1 : 0.75"
            >
              <animateMotion
                [attr.dur]="orbit.animDur + 's'"
                repeatCount="indefinite"
                [attr.begin]="orbit.animDelay + 's'"
                [attr.path]="orbit.motionPath"
              />
            </circle>

            @if (orbit.isCurrent) {
              <!-- Glow -->
              <circle [attr.r]="orbit.planetR * 3" fill="url(#sys-planet-glow)">
                <animateMotion
                  [attr.dur]="orbit.animDur + 's'"
                  repeatCount="indefinite"
                  [attr.begin]="orbit.animDelay + 's'"
                  [attr.path]="orbit.motionPath"
                />
              </circle>
              <!-- Pulsing ring -->
              <circle [attr.r]="orbit.planetR + 3" fill="none" stroke="#4d8aff" stroke-width="1" opacity="0.6">
                <animateMotion
                  [attr.dur]="orbit.animDur + 's'"
                  repeatCount="indefinite"
                  [attr.begin]="orbit.animDelay + 's'"
                  [attr.path]="orbit.motionPath"
                />
                <animate attributeName="r" [attr.values]="(orbit.planetR + 3) + ';' + (orbit.planetR + 5) + ';' + (orbit.planetR + 3)" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
            }
          </g>
        }
      </svg>
    </div>
  `,
  styles: `
    .system-orbit-container {
      width: 100%;
      height: 240px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: radial-gradient(ellipse at center, rgba(10, 14, 35, 0.8) 0%, rgba(5, 8, 22, 0.95) 100%);
      border-radius: 14px;
      margin-bottom: 20px;
      border: 1px solid rgba(77, 138, 255, 0.08);
      position: relative;
      overflow: hidden;
    }

    .system-orbit-container::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      background: radial-gradient(circle at 30% 40%, rgba(77, 138, 255, 0.04) 0%, transparent 60%);
      pointer-events: none;
    }

    .system-title {
      position: absolute;
      top: 10px;
      left: 12px;
      font-size: 9px;
      font-family: 'Orbitron', sans-serif;
      color: rgba(77, 138, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .hz-legend {
      position: absolute;
      top: 10px;
      right: 12px;
      font-size: 9px;
      font-family: 'Inter', sans-serif;
      color: rgba(34, 197, 94, 0.7);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .hz-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.6);
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
    }

    .title-icon {
      width: 12px;
      height: 12px;
      opacity: 0.6;
    }
    
    .system-svg {
      width: 90%;
      height: 90%;
      max-width: 260px;
      max-height: 230px;
    }
  `
})
export class SystemOrbitPreviewComponent {
  planets = input.required<Exoplanet[]>();
  currentPlanetId = input.required<string>();
  systemName = input<string>('');

  starColor = computed(() => {
    const pList = this.planets();
    if (!pList || !pList.length) return '#fbd38d';
    const p = pList[0];
    if (p.stellarTempK) {
      const t = p.stellarTempK;
      if (t < 3500) return '#ff6b6b';
      if (t < 5000) return '#f6ad55';
      if (t < 6000) return '#fbd38d';
      if (t < 7500) return '#fefcbf';
      if (t < 10000) return '#ffffff';
      return '#90cdf4';
    }
    return '#fbd38d';
  });

  bgStars = computed(() => {
    const stars: { x: number; y: number; s: number; o: number; dur: number }[] = [];
    let seed = 42;
    const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: (rng() - 0.5) * 310,
        y: (rng() - 0.5) * 310,
        s: 0.3 + rng() * 0.8,
        o: 0.15 + rng() * 0.4,
        dur: 3 + rng() * 5
      });
    }
    return stars;
  });

  /** Habitable zone band based on stellar luminosity approximation */
  hzBand = computed<{ inner: number; outer: number } | null>(() => {
    const pList = this.planets();
    if (!pList || !pList.length) return null;
    const star = pList[0];
    // Rough HZ in AU: inner ~= 0.95 * sqrt(L), outer ~= 1.37 * sqrt(L)
    // L ≈ (R/R☉)^2 * (T/T☉)^4
    const R = star.stellarRadiusSun || 1;
    const T = star.stellarTempK || 5778;
    const Tsun = 5778;
    const L = R * R * Math.pow(T / Tsun, 4);
    const hzInnerAU = 0.95 * Math.sqrt(L);
    const hzOuterAU = 1.37 * Math.sqrt(L);

    // Map AU to pixel radius using the same scaling as orbits
    const orbits = this.mappedOrbits();
    if (!orbits.length) return null;
    const auValues = [...pList].sort((a, b) => (a.semiMajorAxisAU || 0) - (b.semiMajorAxisAU || 0)).map(p => p.semiMajorAxisAU || 1);
    const minAU = Math.min(...auValues);
    const maxAU = Math.max(...auValues);
    
    const mapAUtoR = (au: number): number => {
      const minR = 30, maxR = 120;
      if (maxAU === minAU) return 60;
      if (maxAU / minAU > 10) {
        const logMin = Math.log(minAU);
        const logMax = Math.log(maxAU);
        const logVal = Math.log(Math.max(au, minAU * 0.5));
        return minR + Math.max(0, Math.min(1, (logVal - logMin) / (logMax - logMin))) * (maxR - minR);
      }
      return minR + Math.max(0, Math.min(1, (au - minAU) / (maxAU - minAU))) * (maxR - minR);
    };

    const inner = mapAUtoR(hzInnerAU);
    const outer = mapAUtoR(hzOuterAU);
    if (outer - inner < 3) return { inner: inner - 5, outer: outer + 5 };
    return { inner, outer };
  });

  mappedOrbits = computed(() => {
    const pList = this.planets();
    if (!pList || !pList.length) return [] as OrbitData[];

    const sorted = [...pList].sort((a, b) => {
      const aVal = a.semiMajorAxisAU || a.orbitalPeriodDays || 0;
      const bVal = b.semiMajorAxisAU || b.orbitalPeriodDays || 0;
      return aVal - bVal;
    });

    const maxR = 120;
    const minR = 30;

    const auValues = sorted.map(p => p.semiMajorAxisAU || p.orbitalPeriodDays || 1);
    const minAU = Math.min(...auValues);
    const maxAU = Math.max(...auValues);
    const useLog = maxAU / minAU > 10;

    // Planet radii range for dot sizes
    const radii = sorted.map(p => p.radiusEarth || 1);
    const minPR = Math.min(...radii);
    const maxPR = Math.max(...radii);

    return sorted.map((p, index): OrbitData => {
      const isCurrent = p.id === this.currentPlanetId();
      let a: number; // semi-major axis in pixels

      if (sorted.length === 1) {
        a = 60;
      } else if (useLog) {
        const logMin = Math.log(minAU);
        const logMax = Math.log(maxAU);
        const logVal = Math.log(auValues[index]);
        a = minR + ((logVal - logMin) / (logMax - logMin)) * (maxR - minR);
      } else {
        a = minR + (index / (sorted.length - 1)) * (maxR - minR);
      }

      // Eccentricity: amplify visually (x3 but cap at 0.7) so small real eccentricities are visible
      const rawE = p.eccentricity || 0;
      const e = Math.min(rawE * 3, 0.7);
      const b = a * Math.sqrt(1 - e * e);
      const cx = -a * e; // offset focus to origin

      // Planet dot size proportional to radius (clamped 1.5 to 6)
      let planetR = 2.5;
      if (maxPR > minPR) {
        planetR = 1.5 + ((radii[index] - minPR) / (maxPR - minPR)) * 4.5;
      }
      if (isCurrent) planetR = Math.max(planetR, 4);

      // Animation duration proportional to orbit size
      const baseDur = 8 + (a / maxR) * 40;
      const animDelay = index * 1.3;

      // Elliptical motion path (SVG arc around offset center)
      const motionPath = `M ${a + cx},0 A ${a},${b} 0 1,1 ${-a + cx},0 A ${a},${b} 0 1,1 ${a + cx},0`;

      // Color by temperature
      let color = '#a0aec0';
      if (p.equilibriumTempK) {
        if (p.equilibriumTempK > 1500) color = '#ef4444';
        else if (p.equilibriumTempK > 800) color = '#f97316';
        else if (p.equilibriumTempK > 400) color = '#eab308';
        else if (p.equilibriumTempK > 200) color = '#22c55e';
        else color = '#38bdf8';
      }

      return {
        id: p.id,
        name: p.name,
        isCurrent,
        rx: a,
        ry: b,
        cx,
        r: a, // kept for HZ lookup
        planetR,
        animDur: baseDur,
        animDelay,
        motionPath,
        color
      };
    });
  });
}

interface OrbitData {
  id: string;
  name: string;
  isCurrent: boolean;
  rx: number;
  ry: number;
  cx: number;
  r: number;
  planetR: number;
  animDur: number;
  animDelay: number;
  motionPath: string;
  color: string;
}

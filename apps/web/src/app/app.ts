import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './core/components/footer/footer.component';

interface MeteorEmber {
  offsetY: number;
  offsetX: number;
  delay: number;
  duration: number;
}

interface MeteorConfig {
  id: number;
  top: number;
  left: number;
  angle: number;
  speed: number;
  delay: number;
  scale: number;
  embers: MeteorEmber[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, FooterComponent],
  template: `
    <!-- Twinkling stars overlay -->
    <div class="twinkle-layer">
      <div class="twinkle-star s1"></div>
      <div class="twinkle-star s2"></div>
      <div class="twinkle-star s3"></div>
      <div class="twinkle-star s4"></div>
      <div class="twinkle-star s5"></div>
      <div class="twinkle-star s6"></div>
      <div class="twinkle-star s7"></div>
      <div class="twinkle-star s8"></div>
      <div class="twinkle-star s9"></div>
      <div class="twinkle-star s10"></div>
      <div class="twinkle-star s11"></div>
      <div class="twinkle-star s12"></div>
      <div class="twinkle-star big b1"></div>
      <div class="twinkle-star big b2"></div>
      <div class="twinkle-star big b3"></div>
    </div>

    <!-- Realistic Meteorites (random positions) -->
    @for (m of meteors; track m.id) {
      <div class="meteor"
           [attr.style]="getMeteorStyle(m)">
        <div class="meteor-core"></div>
        <div class="meteor-trail"></div>
        <div class="meteor-trail trail-inner"></div>
        @for (e of m.embers; track $index) {
          <div class="ember"
               [style.top.px]="e.offsetY"
               [style.right.px]="e.offsetX"
               [style.animation-delay]="e.delay + 's'"
               [style.animation-duration]="e.duration + 's'"></div>
        }
      </div>
    }

    <router-outlet />
    <app-footer />
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      z-index: 1;
    }

    /* ═══════ TWINKLING STARS ═══════ */
    .twinkle-layer {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.1; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    @keyframes twinkleSlow {
      0%, 100% { opacity: 0.15; transform: scale(0.9); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }

    .twinkle-star {
      position: absolute;
      width: 2px;
      height: 2px;
      background: white;
      border-radius: 50%;
      animation: twinkle 3s ease-in-out infinite;
    }

    .twinkle-star.big {
      width: 3px;
      height: 3px;
      box-shadow: 0 0 6px 1px rgba(180, 200, 255, 0.6);
      animation: twinkleSlow 5s ease-in-out infinite;
    }

    .s1  { top: 8%;   left: 12%;  animation-delay: 0s;    animation-duration: 2.5s; }
    .s2  { top: 15%;  left: 45%;  animation-delay: 0.7s;  animation-duration: 3.2s; }
    .s3  { top: 22%;  left: 78%;  animation-delay: 1.3s;  animation-duration: 2.8s; }
    .s4  { top: 35%;  left: 25%;  animation-delay: 0.3s;  animation-duration: 4.0s; }
    .s5  { top: 42%;  left: 62%;  animation-delay: 2.1s;  animation-duration: 2.3s; }
    .s6  { top: 55%;  left: 8%;   animation-delay: 1.8s;  animation-duration: 3.5s; }
    .s7  { top: 60%;  left: 88%;  animation-delay: 0.5s;  animation-duration: 2.7s; }
    .s8  { top: 72%;  left: 35%;  animation-delay: 1.1s;  animation-duration: 3.8s; }
    .s9  { top: 80%;  left: 70%;  animation-delay: 2.5s;  animation-duration: 2.6s; }
    .s10 { top: 88%;  left: 15%;  animation-delay: 0.9s;  animation-duration: 3.1s; }
    .s11 { top: 5%;   left: 92%;  animation-delay: 1.5s;  animation-duration: 2.9s; }
    .s12 { top: 48%;  left: 50%;  animation-delay: 3.0s;  animation-duration: 3.6s; }
    .b1  { top: 20%;  left: 30%;  animation-delay: 0.4s; }
    .b2  { top: 65%;  left: 55%;  animation-delay: 2.2s; }
    .b3  { top: 45%;  left: 85%;  animation-delay: 1.0s; }

    /* ═══════ REALISTIC METEORITES - Optimized ═══════ */

  .meteor {
    position: fixed;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    /* Removed will-change - transform animations are GPU accelerated by default */
    animation: meteorFly var(--m-speed, 4s) linear infinite;
    animation-delay: var(--m-delay, 0s);
    animation-fill-mode: backwards;
    /* Pause animation when tab is not visible to save resources */
    animation-play-state: var(--m-play-state, running);
  }

    /*
     * The meteor moves along its LOCAL X axis via translateX.
     * rotate() is applied first, orienting that axis diagonally.
     * The trail sits at right:100% (local LEFT = BEHIND the movement).
     */
    @keyframes meteorFly {
      0% {
        transform: rotate(var(--m-angle, 30deg)) translateX(-5vw) scale(var(--m-scale, 1));
        opacity: 0;
      }
      2%  { opacity: 1; }
      70% { opacity: 0.7; }
      100% {
        transform: rotate(var(--m-angle, 30deg)) translateX(160vw) scale(var(--m-scale, 1));
        opacity: 0;
      }
    }

    /* Rocky irregular core with hot surface glow */
    .meteor-core {
      position: relative;
      width: 6px;
      height: 5px;
      background:
        radial-gradient(ellipse at 30% 40%, #d4a574 0%, #8b5e3c 30%, #4a3020 60%, #2a1a10 100%);
      border-radius: 40% 55% 45% 50% / 50% 40% 60% 45%;
      box-shadow:
        0 0 3px 1px rgba(255, 160, 50, 0.9),
        0 0 8px 3px rgba(255, 100, 20, 0.6),
        0 0 16px 5px rgba(255, 60, 0, 0.3),
        0 0 30px 8px rgba(255, 40, 0, 0.15),
        inset 0 0 3px 1px rgba(255, 200, 120, 0.5);
      z-index: 2;
    }

    /* Outer fiery trail — extends LEFT in local space (behind movement) */
    .meteor-trail {
      position: absolute;
      top: 50%;
      right: 100%;
      width: 120px;
      height: 6px;
      transform: translateY(-50%);
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 80, 0, 0.02) 10%,
        rgba(255, 100, 20, 0.08) 25%,
        rgba(255, 140, 40, 0.2) 45%,
        rgba(255, 170, 60, 0.45) 65%,
        rgba(255, 180, 80, 0.7) 80%,
        rgba(255, 200, 120, 0.9) 92%,
        rgba(255, 220, 160, 1) 100%
      );
      border-radius: 2px 0 0 2px;
      filter: blur(1px); /* Reduced blur for better performance */
      z-index: 1;
    }

    /* Inner white-hot core streak */
    .meteor-trail.trail-inner {
      width: 70px;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 200, 150, 0.1) 20%,
        rgba(255, 230, 180, 0.4) 50%,
        rgba(255, 245, 220, 0.8) 75%,
        rgba(255, 255, 240, 1) 100%
      );
      filter: blur(0.5px);
      z-index: 3;
    }

    /* Spark embers drifting off behind - optimized */
    .ember {
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(255, 180, 60, 0.9);
      border-radius: 50%;
      box-shadow: 0 0 3px 1px rgba(255, 120, 20, 0.6);
      animation: emberDrift 0.6s ease-out infinite;
      /* Removed will-change - not needed for small elements */
      z-index: 1;
    }

    @keyframes emberDrift {
      0%   { opacity: 1; transform: translate(0, 0) scale(1); }
      100% { opacity: 0; transform: translate(-6px, -7px) scale(0.2); }
    }
  `,
})
export class App implements OnInit {
  meteors: MeteorConfig[] = [];

  private animationPaused = false;

  ngOnInit(): void {
    this.generateMeteors();
    this.setupVisibilityListener();
  }

  /** Build inline style string with CSS custom properties for each meteor */
  getMeteorStyle(m: MeteorConfig): string {
    return `top:${m.top}vh;left:${m.left}vw;--m-angle:${m.angle}deg;--m-speed:${m.speed}s;--m-delay:${m.delay}s;--m-scale:${m.scale};--m-play-state:${this.animationPaused ? 'paused' : 'running'}`;
  }

  private setupVisibilityListener(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.animationPaused = document.hidden;
      });
    }
  }

  private generateMeteors(): void {
    const count = 4; /* Reduced from 10 to 4 for better performance */
    this.meteors = [];

    for (let i = 0; i < count; i++) {
      const scale = 0.35 + Math.random() * 1.6;
      const emberCount = 2 + Math.floor(Math.random() * 5);

      this.meteors.push({
        id: i,
        // Random spawn spread across the viewport
        top: -10 + Math.random() * 80,
        left: -20 + Math.random() * 60,
        // Positive angle = clockwise = moves down-right
        angle: 15 + Math.random() * 50,
        speed: 2 + Math.random() * 5,
        delay: Math.random() * 50,
        scale,
        embers: Array.from({ length: emberCount }, (_, j) => ({
          offsetY: -6 + Math.random() * 12,
          offsetX: 5 + j * 12 + Math.random() * 8,
          delay: Math.random() * 0.5,
          duration: 0.4 + Math.random() * 0.4,
        })),
      });
    }
  }
}

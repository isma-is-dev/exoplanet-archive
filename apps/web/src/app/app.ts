import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './core/components/footer/footer.component';

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

    <!-- Comets -->
    <div class="comet comet-1"></div>
    <div class="comet comet-2"></div>

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

    /* ═══════ COMETS ═══════ */
    @keyframes cometFly1 {
      0% {
        transform: translate(-100px, -50px) rotate(-35deg);
        opacity: 0;
      }
      3% { opacity: 1; }
      25% { opacity: 0.6; }
      100% {
        transform: translate(calc(100vw + 200px), calc(50vh)) rotate(-35deg);
        opacity: 0;
      }
    }

    @keyframes cometFly2 {
      0% {
        transform: translate(calc(100vw + 100px), -30px) rotate(210deg);
        opacity: 0;
      }
      3% { opacity: 0.7; }
      25% { opacity: 0.4; }
      100% {
        transform: translate(-200px, calc(40vh)) rotate(210deg);
        opacity: 0;
      }
    }

    .comet {
      position: fixed;
      pointer-events: none;
      z-index: 0;
      width: 2px;
      height: 2px;
      background: white;
      border-radius: 50%;
      box-shadow:
        0 0 4px 1px rgba(255, 255, 255, 0.8),
        0 0 12px 2px rgba(180, 200, 255, 0.5);
    }

    .comet::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 100%;
      width: 80px;
      height: 1px;
      transform: translateY(-50%);
      background: linear-gradient(90deg, transparent, rgba(180, 200, 255, 0.4), rgba(255, 255, 255, 0.8));
      border-radius: 1px;
    }

    .comet-1 {
      top: 15%;
      left: 0;
      animation: cometFly1 12s linear infinite;
      animation-delay: 3s;
    }

    .comet-2 {
      top: 30%;
      right: 0;
      animation: cometFly2 18s linear infinite;
      animation-delay: 10s;
    }
  `,
})
export class App {}

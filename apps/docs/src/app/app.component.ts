import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgOptimizedImage, RouterLinkActive],
  template: `
    <header class="flex justify-between items-center gap-16 px-4 py-2 bg-[#2A2D31] fixed w-full h-16">
      <a class="hidden sm:block" routerLink="/">
        <img alt="RealWorld Angular Logo" ngSrc="/light-logo.svg" height="55" width="185" />
      </a>
      <nav class="flex flex-1">
        <ul class="flex gap-8">
          <li>
            <a class="hover:text-[#ea2bc3]" routerLink="/news" routerLinkActive="active">News</a>
          </li>
          <li>
            <a class="hover:text-[#ea2bc3]" href="https://github.com/orgs/realworld-angular/discussions" target="_blank">Discussions</a>
          </li>
        </ul>
      </nav>
      <a class="flex gap-2 bg-[#3D4046] py-2 px-4 rounded-xl" href="https://github.com/realworld-angular" target="_blank">
        <img ngSrc="/github-mark-white.svg" height="24" width="24" alt="">
        <span class="font-semibold hidden sm:block">Discover on GitHub</span>
      </a>
    </header>
    <main class="mt-16">
      <router-outlet></router-outlet>
    </main>

  `,
  styles: [
    `
      :host {
        width: 100%;
      }

      .active {
        color: #EA2BC3;
      }
    `,
  ],
})
export class AppComponent {}

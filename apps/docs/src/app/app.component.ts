import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav>
      <a href="/">Home</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      :host {
        width: 100%;
      }
    `,
  ],
})
export class AppComponent {}

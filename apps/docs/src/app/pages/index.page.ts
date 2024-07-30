import { Component } from '@angular/core';
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  template: `
    <div class="foo px-8">
      <section class="mt-16">
          <h1 class="flex flex-col items-center text-4xl sm:text-6xl font-bold mb-8">
            <span>Discover</span>
            <span class="edo text-[#ea2bc3] text-6xl sm:text-8xl text-center">RealWorld Angular</span>
            <span>applications</span>
          </h1>
        <p class="text-xl mb-8 sm:mb-16">While most "todo" demos provide an excellent cursory glance at a framework's capabilities,
          they typically don't convey the knowledge & perspective required to actually build real applications with
          it.</p>
        <h2 class="text-center text-4xl">Roadmap</h2>
        <ol class="flex flex-col md:flex-row justify-center items-center gap-4 sm:gap-16 mt-8">
          <li class="!mt-0 !pl-0 flex flex-col items-center max-w-72">
            <h3 class="text-3xl">Server API</h3>
            <span class="border-t pt-2 text-xs mt-2">work in progress</span>
            <p class="mt-4 text-center hidden sm:block">
              Follow updates and contribute
              <a class="text-[#ea2bc3] hover:underline" href="https://github.com/realworld-angular/realworld-angular" target="_blank">here</a>
            </p>
          </li>
          <li class="!mt-0 !pl-0 flex flex-col items-center max-w-72">
            <h3 class="text-3xl">Starter kit</h3>
            <span class="border-t pt-2 text-xs mt-2">todo</span>
            <p class="mt-4 text-center hidden sm:block">
              Help shape the application by contributing
              <a class="text-[#ea2bc3] hover:underline" href="https://github.com/realworld-angular/realworld-angular-template" target="_blank">here</a>
            </p>
          </li>
          <li class="!mt-0 !pl-0 flex flex-col items-center max-w-72">
            <h3 class="text-3xl">Example apps</h3>
            <span class="border-t pt-2 text-xs mt-2">backlog</span>
            <p class="mt-4 text-center hidden sm:block">
              Submit your example suggestions already
              <a class="text-[#ea2bc3] hover:underline" href="https://github.com/orgs/realworld-angular/discussions/new?category=example-apps-candidates" target="_blank">here</a>
            </p>

          </li>
        </ol>
      </section>
      <section>
        <h2 class="text-5xl text-center md:text-start">Angular starter kit</h2>
        <div class="mt-8 flex justify-between items-start gap-16">
          <div>
            <p>The Angular starter kit is a fully functional real-world application, featuring an event platform designed to create communities, promote events, engage users with polls, and much more. It's built using Angular APIs such as:</p>
            <ul class="text-xl ml-8 my-6">
              <li>Signals, RxJS</li>
              <li>Guards, Interceptors, Router</li>
              <li>Reactive Forms, Custom Directives, ControlValueAccessor</li>
            </ul>
            <p>And examplary good practices:</p>
            <ul class="text-xl ml-8 my-6">
              <li>CSP, http-only cookie</li>
              <li>Semantic and Accessible HTML</li>
              <li>Testing</li>
            </ul>
          </div>
          <img class="hidden lg:block" ngSrc="/wip.svg" height="500" width="500" alt="work in progress" />
        </div>
      </section>
      <section>
        <h2 class="text-5xl text-center md:text-start">Example apps</h2>
        <div class="mt-8 flex justify-between items-start gap-16">
          <div>
            <p>Explore a diverse collection of example apps built on our comprehensive starter kit.</p>
            <p>Whether you're looking to understand the use of various libraries in a large-scale, complex application, or simplify your work as a library author with real-world demos, these examples have got you covered!</p>
            <ul class="text-xl ml-8 my-6">
              <li>State Management: NgRX, NGXS, Elf...</li>
              <li>UI Frameworks: Angular Material, PrimeNG...</li>
              <li>Deployment Options: SSG, SSR, Full-stack...</li>
              <li>Backend as a Service (BaaS): Firebase, Supabase, AppWrite...</li>
              <li>And more...</li>
            </ul>
          </div>
          <img class="hidden lg:block" ngSrc="/wip.svg" height="500" width="500" alt="work in progress" />
        </div>
      </section>
      <section>
        <h2 class="text-5xl text-center md:text-start">Server API</h2>
        <div class="mt-8 flex justify-between items-start gap-16">
          <div>
            <p>While most templates uses mock or in memory data, RealWorld Angular provide a real API, created in the same quality standards. It includes:</p>
            <ul class="text-xl ml-8 my-6">
              <li>Authentication, Authorization</li>
              <li>advanced error handling</li>
              <li>Websockets</li>
              <li>over 50 endpoints</li>
            </ul>
          </div>
          <img class="hidden lg:block" ngSrc="/wip.svg" height="500" width="500" alt="work in progress" />
        </div>
      </section>
    </div>

  `,
  styles: [
    `
      .foo {
        height: calc(100vh - 4rem);
        overflow-y: scroll;
        scroll-snap-type: y mandatory;
      }
      section {
        scroll-snap-align: start;
        min-height: calc(100vh - 4rem);
        padding-top: 4rem;
        margin: auto;
        max-width: 1080px;
      }

      h2, .edo {
        font-family: 'Edo', sans-serif;
      }

      ul { list-style-type: "✔️"; }

      li {
        padding-left: 1rem;
      }

      li + li {
        margin-top: 1rem;
      }
    `
  ],
})
export default class HomeComponent {
}

import { Component } from '@angular/core';
import { injectContentFiles } from '@analogjs/content';
import PostAttributes from '../../post-attributes';
import { RouterLink } from '@angular/router';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <h1 class="edo text-5xl text-center mb-8">news</h1>
    @for (post of posts;track post.attributes.slug) {
    <a class="block mb-12" [routerLink]="['/news/', post.attributes.slug]">
      <h2 class="text-center text-4xl">{{ post.attributes.title }}</h2>
      <p class="text-center italic mb-2">{{post.attributes.date | date}}</p>
      <p class="post__desc">{{ post.attributes.description }}</p>
    </a>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 780px;
        margin: auto;
        padding-top: 2rem;
      }

      .edo {
        font-family: 'Edo', sans-serif;
      }
    `,
  ],
})
export default class NewsComponent {
  readonly posts = injectContentFiles<PostAttributes>((contentFile) =>
    contentFile.filename.includes('/src/content/news/')
  );
}

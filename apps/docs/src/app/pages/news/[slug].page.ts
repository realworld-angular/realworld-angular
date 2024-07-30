import { Component } from '@angular/core';
import { injectContent, MarkdownComponent } from '@analogjs/content';
import { AsyncPipe } from '@angular/common';

import PostAttributes from '../../post-attributes';

@Component({
  selector: 'app-news-post',
  standalone: true,
  imports: [AsyncPipe, MarkdownComponent],
  template: `
    @if (post$ | async; as post) {
    <article class="prose dark:prose-invert m-auto pt-16 px-6">
      <h1 class="text-5xl text-center edo">{{post.attributes.title}}</h1>
      <analog-markdown [content]="post.content" />
    </article>
    }
  `,
  styles: [
    `
      .edo {
        font-family: 'Edo', sans-serif;
      }
    `,
  ],
})
export default class NewsPostComponent {
  readonly post$ = injectContent<PostAttributes>({
    param: 'slug',
    subdirectory: 'news'
  });
}

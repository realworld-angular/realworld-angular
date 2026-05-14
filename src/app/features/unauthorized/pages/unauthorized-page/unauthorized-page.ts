import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'rw-unauthorized-page',
  imports: [RouterLink],
  templateUrl: './unauthorized-page.html',
  styleUrl: './unauthorized-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedPage {}

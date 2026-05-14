import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PizzaLogo } from '../pizza-logo/pizza-logo';

@Component({
  selector: 'rw-spinner',
  imports: [PizzaLogo],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spinner {}

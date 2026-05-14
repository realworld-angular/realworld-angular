import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface Slice {
  readonly index: number;
  readonly path: string;
}

const CENTER = 50;
const OUTER_R = 42;
const SLICE_COUNT = 6;
const SLICE_ANGLE = 360 / SLICE_COUNT;
const ANGLE_INSET = 4;
/** Radius of rounded corners where each slice side meets the outer rim (coin-like silhouette). */
const OUTER_CORNER_R = 6.5;

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const round = (n: number): number => Math.round(n * 100) / 100;

function rimPoint(angleDeg: number, r: number): { readonly x: number; readonly y: number } {
  return {
    x: round(CENTER + r * Math.cos(toRad(angleDeg))),
    y: round(CENTER + r * Math.sin(toRad(angleDeg))),
  };
}

/** Trim angle (degrees) along the outer rim for fillet tangent point. δ ≈ chord / R_outer. */
function outerTrimDegrees(): number {
  return ((OUTER_CORNER_R / OUTER_R) * 180) / Math.PI;
}

function buildSlices(): readonly Slice[] {
  const trimDeg = outerTrimDegrees();

  return Array.from({ length: SLICE_COUNT }, (_, index): Slice => {
    const centerDeg = -90 + index * SLICE_ANGLE;
    const th1 = centerDeg - SLICE_ANGLE / 2 + ANGLE_INSET;
    const th2 = centerDeg + SLICE_ANGLE / 2 - ANGLE_INSET;

    const rad1 = toRad(th1);
    const rad2 = toRad(th2);

    const o1Corner = rimPoint(th1, OUTER_R);
    const o2Corner = rimPoint(th2, OUTER_R);

    // Points on radial lines, shortened from rim toward center for rounded outer corners (≈ octant fillet distance).
    const pr1 = roundPoint(CENTER + (OUTER_R - OUTER_CORNER_R) * Math.cos(rad1), CENTER + (OUTER_R - OUTER_CORNER_R) * Math.sin(rad1));
    const pr2 = roundPoint(CENTER + (OUTER_R - OUTER_CORNER_R) * Math.cos(rad2), CENTER + (OUTER_R - OUTER_CORNER_R) * Math.sin(rad2));

    const outerArcStart = rimPoint(th1 + trimDeg, OUTER_R);
    const outerArcEnd = rimPoint(th2 - trimDeg, OUTER_R);

    // Quadratic Bézier from pr1 toward o1Corner to outerArcStart rounds the radial→rim joint.
    const path =
      `M ${CENTER} ${CENTER} ` +
      `L ${pr1.x} ${pr1.y} ` +
      `Q ${o1Corner.x} ${o1Corner.y} ${outerArcStart.x} ${outerArcStart.y} ` +
      `A ${OUTER_R} ${OUTER_R} 0 0 1 ${outerArcEnd.x} ${outerArcEnd.y} ` +
      `Q ${o2Corner.x} ${o2Corner.y} ${pr2.x} ${pr2.y} ` +
      `Z`;

    return { index, path };
  });
}

function roundPoint(x: number, y: number): { readonly x: number; readonly y: number } {
  return { x: round(x), y: round(y) };
}

const SLICES = buildSlices();

@Component({
  selector: 'rw-pizza-logo',
  templateUrl: './pizza-logo.html',
  styleUrl: './pizza-logo.css',
  host: {
    '[class.is-animated]': 'animated()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzaLogo {
  public readonly size = input<number>(24);
  public readonly animated = input<boolean>(false);
  public readonly label = input<string | null>(null);

  /** The wedge filled white; 0 is the top slice, then clockwise. */
  protected readonly whiteSliceIndex = 2;

  protected readonly slices = SLICES;
}

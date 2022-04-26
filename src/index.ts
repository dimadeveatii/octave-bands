export type Options = {
  /**
   * Center frequency (default `1000` Hz)
   */
  center?: number;

  /**
   * The audio spectrum for center frequencies.
   * (default `[15, 21000]`)
   */
  spectrum?: [number, number];
};

/**
 * Lower, center and higher center frequencies of a band
 */
export type Band = [number, number, number];

const DEFAULT_OPTIONS = { spectrum: [15, 21000], center: 1000 };

/**
 * Calculates and returns the frequency limits for octave bands.
 * @param fraction (default `1`) octave bands fraction
 * @param options (optional) bands limit options
 * @returns an array of bands, where each band is a tuple of `[lower, center, higher]` frequencies
 */
export const octaves = (fraction = 1, options?: Options) => {
  validateFraction(fraction);

  const {
    spectrum: [min, max],
    center,
  } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const factor = Math.pow(2, fraction);
  const factor2 = Math.pow(Math.SQRT2, fraction);

  const bands: Band[] = [];

  for (let c = center; c >= min; c /= factor) {
    bands.unshift([c / factor2, c, c * factor2]);
  }

  for (let c = center * factor; c <= max; c *= factor) {
    bands.push([c / factor2, c, c * factor2]);
  }

  return bands;
};

/**
 * Calculates the fractional bandwidth per given octave band:
 * `BW = (f_high - f_low) / f_center`
 * @param fraction (default `1`) octave band fraction
 */
export const bandwidth = (fraction = 1) => {
  validateFraction(fraction);
  return (Math.pow(2, fraction) - 1) / Math.pow(2, fraction / 2);
};

const validateFraction = (fraction: number) => {
  if (fraction <= 0) {
    throw new Error('fraction should be positive');
  }
};

const bands = octaves(1 / 2, { spectrum: [100, 16000] }); // or `octaves(1)`
console.table(bands.map((x) => x.map((v) => Number(v.toFixed(3)))));

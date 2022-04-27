export type Options = {
  /**
   * Center frequency of the band to use as a starting point (default `1000` Hz)
   */
  center?: number;

  /**
   * The audio spectrum for center frequencies (default `[15, 21000]`)
   */
  spectrum?: [number, number];
};

/**
 * Lower, center and higher frequencies bounds of a band
 */
export type Band = [number, number, number];

const DEFAULT_OPTIONS: Options = { spectrum: [15, 21000], center: 1000 };

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

  validateSpectrum([min, max]);
  validateCenter(center, [min, max]);

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

/**
 * Calculates the frequency bounds for a given spectrum and number of bands
 * @param bands number of bands
 * @param spectrum the audio spectrum for bands' center frequencies (default `[15, 21000]`)
 * @returns an array of bands, where each band is a tuple of `[lower, center, higher]` frequencies
 */
export const equalizer = (
  bands: number,
  options?: Pick<Options, 'spectrum'>
) => {
  validateBands(bands);

  const { spectrum } = { ...DEFAULT_OPTIONS, ...options };
  validateSpectrum(spectrum);

  const fraction = Math.log2(spectrum[1] / spectrum[0]) / (bands - 1);

  const factor = Math.pow(2, fraction);
  const factor2 = Math.sqrt(factor);
  const result: Band[] = [
    [spectrum[0] / factor2, spectrum[0], spectrum[0] * factor2],
  ];

  while (result[result.length - 1][2] < spectrum[1]) {
    const center = result[result.length - 1][1] * factor;
    result.push([center / factor2, center, center * factor2]);
  }

  return result;
};

const validateFraction = (fraction: number) => {
  if (typeof fraction !== 'number') {
    throw new Error('fraction not a number');
  }

  if (fraction <= 0) {
    throw new Error('fraction should be positive');
  }
};

const validateBands = (bands: number) => {
  if (bands <= 0) {
    throw new Error('bands should be positive');
  }

  if (Math.floor(bands) !== bands) {
    throw new Error('bands should be integer');
  }
};

const validateSpectrum = (spectrum: [number, number]) => {
  if (typeof spectrum[0] !== 'number') {
    throw new Error('spectrum min not a number');
  }

  if (typeof spectrum[1] !== 'number') {
    throw new Error('spectrum max not a number');
  }

  if (spectrum[0] <= 0) {
    throw new Error('spectrum min should be positive');
  }

  if (spectrum[0] >= spectrum[1]) {
    throw new Error('spectrum range invalid');
  }
};

const validateCenter = (value: number, spectrum: [number, number]) => {
  if (typeof value !== 'number') {
    throw new Error('center not a number');
  }

  if (value < spectrum[0] || value > spectrum[1]) {
    throw new Error('center out of spectrum range');
  }
};

import { octaves, bandwidth, equalizer, Band } from '../src';

describe('octave-bands', () => {
  const expectBand = (received: Band, [low, center, high]: Band) => {
    expect(received[0]).toBeCloseTo(low, 3);
    expect(received[1]).toBeCloseTo(center, 3);
    expect(received[2]).toBeCloseTo(high, 3);
  };

  describe('octaves', () => {
    describe('validations', () => {
      it.each([null, Number.NEGATIVE_INFINITY, -1, -Number.EPSILON, 0])(
        'when fraction %f should throw',
        (fraction) => {
          expect(() => octaves(fraction)).toThrow(/fraction/i);
        }
      );

      it.each([
        [null, 10],
        [10, null],
        [0, 1000],
        [200, 100],
        [100, 100],
      ])('when spectrum [%p, %p] should throw', (min, max) => {
        expect(() => octaves(1, { spectrum: [min, max] })).toThrow(/spectrum/i);
      });

      it.each([null, 0, 9.99, 100.01])(
        'when center %p should throw',
        (center) => {
          expect(() => octaves(1, { center, spectrum: [10, 100] })).toThrow(
            /center/i
          );
        }
      );
    });

    it.each([
      ['default', '1', undefined],
      ['1', '1', 1],
      ['1/2', '1/2', 1 / 2],
      ['1/3', '1/3', 1 / 3],
    ])('%s-octave bands', (_, f, fraction) => {
      const actual = octaves(fraction);
      const expected = OCTAVE_BANDS[f];

      expect(actual).toHaveLength(expected.length);
      actual.forEach((band, i) => expectBand(band, expected[i]));
    });

    it('with options', () => {
      const bands = octaves(1 / 2, { center: 125, spectrum: [80, 200] });

      expect(bands).toHaveLength(3);
      expectBand(bands[0], OCTAVE_BANDS['1/2'][5]);
      expectBand(bands[1], OCTAVE_BANDS['1/2'][6]);
      expectBand(bands[2], OCTAVE_BANDS['1/2'][7]);
    });

    it.each([
      ['1', 1],
      ['1/2', 1 / 2],
      ['1/3', 1 / 3],
      ['1/4', 1 / 4],
      ['1/5', 1 / 5],
      ['1/10', 1 / 10],
    ])('%s-octave bandwidth is constant', (_, f) => {
      const [firstBand, ...bands] = octaves(f);
      const bw = ([low, center, high]: Band) => (high - low) / center;

      bands.forEach((band) => expect(bw(firstBand)).toBeCloseTo(bw(band)));
    });
  });

  describe('bandwidth', () => {
    describe('validations', () => {
      it.each([null, Number.NEGATIVE_INFINITY, -1, -Number.EPSILON, 0])(
        'when faction %p should throw',
        (fraction) => {
          expect(() => bandwidth(fraction)).toThrow(/fraction/i);
        }
      );
    });

    it.each([
      ['default', undefined, 0.707],
      ['1', 1, 0.707],
      ['1/2', 1 / 2, 0.348],
      ['1/3', 1 / 3, 0.232],
    ])('%s-octave bandwidth', (_, fraction, bw) => {
      expect(bandwidth(fraction)).toBeCloseTo(bw, 3);
    });

    it('formula', () => {
      const [band] = octaves(1 / 10);
      const bw = (band[2] - band[0]) / band[1];

      expect(bandwidth(1 / 10)).toBeCloseTo(bw, 6);
    });
  });

  describe('equalizer', () => {
    describe('validations', () => {
      it.each([null, 0, 10.1])('when bands %p should throw', (bands) => {
        expect(() => equalizer(bands)).toThrow(/bands/i);
      });

      it.each([
        [null, 10],
        [10, null],
        [0, 1000],
        [200, 100],
        [100, 100],
      ])('when spectrum [%p, %p] should throw', (min, max) => {
        expect(() => equalizer(11, { spectrum: [min, max] })).toThrow(
          /spectrum/i
        );
      });
    });

    it.each([1, 7, 11, 21, 32, 99, 200])(
      'when bands %p should verify bands count',
      (bands) => {
        const actual = equalizer(bands);
        expect(actual).toHaveLength(bands);
      }
    );

    it.each([2, 7, 11, 21, 32, 99, 200])(
      'when bands %p should verify bounds',
      (bands) => {
        const spectrum: [number, number] = [20, 20000];
        const actual = equalizer(bands, { spectrum });

        expect(actual.at(0)[1]).toBeCloseTo(spectrum[0], 3);
        expect(actual.at(-1)[1]).toBeCloseTo(spectrum[1], 3);
      }
    );

    it.each([2, 7, 11, 21, 32, 99, 200])(
      'when bands %p should verify bandwidth',
      (bands) => {
        const spectrum: [number, number] = [20, 20000];
        const [first, ...others] = equalizer(bands, { spectrum });
        const bw = ([low, center, high]: Band) => (high - low) / center;

        others.forEach((b) => expect(bw(first)).toBeCloseTo(bw(b), 5));
      }
    );
  });
});

// Source:
// https://courses.physics.illinois.edu/phys406/sp2017/Lab_Handouts/Octave_Bands.pdf
const OCTAVE_BANDS: Record<string, Band[]> = {
  '1': [
    [11.049, 15.625, 22.097],
    [22.097, 31.25, 44.194],
    [44.194, 62.5, 88.388],
    [88.388, 125, 176.777],
    [176.777, 250, 353.553],
    [353.553, 500, 707.107],
    [707.107, 1000, 1414.214],
    [1414.214, 2000, 2828.427],
    [2828.427, 4000, 5656.854],
    [5656.854, 8000, 11313.708],
    [11313.708, 16000, 22627.417],
  ],
  '1/2': [
    [13.139, 15.625, 18.581],
    [18.581, 22.097, 26.278],
    [26.278, 31.25, 37.163],
    [37.163, 44.194, 52.556],
    [52.556, 62.5, 74.325],
    [74.325, 88.388, 105.112],
    [105.112, 125, 148.651],
    [148.651, 176.777, 210.224],
    [210.224, 250, 297.302],
    [297.302, 353.553, 420.448],
    [420.448, 500, 594.604],
    [594.604, 707.107, 840.896],
    [840.896, 1000, 1189.207],
    [1189.207, 1414.214, 1681.793],
    [1681.793, 2000, 2378.414],
    [2378.414, 2828.427, 3363.586],
    [3363.586, 4000, 4756.828],
    [4756.828, 5656.854, 6727.171],
    [6727.171, 8000, 9513.657],
    [9513.657, 11313.708, 13454.343],
    [13454.343, 16000, 19027.314],
  ],
  '1/3': [
    [13.92, 15.625, 17.538],
    [17.538, 19.686, 22.097],
    [22.097, 24.803, 27.841],
    [27.841, 31.25, 35.077],
    [35.077, 39.373, 44.194],
    [44.194, 49.606, 55.681],
    [55.681, 62.5, 70.154],
    [70.154, 78.745, 88.388],
    [88.388, 99.213, 111.362],
    [111.362, 125.0, 140.308],
    [140.308, 157.49, 176.777],
    [176.777, 198.425, 222.725],
    [222.725, 250.0, 280.616],
    [280.616, 314.98, 353.553],
    [353.553, 396.85, 445.449],
    [445.449, 500.0, 561.231],
    [561.231, 629.961, 707.107],
    [707.107, 793.701, 890.899],
    [890.899, 1000.0, 1122.462],
    [1122.462, 1259.921, 1414.214],
    [1414.214, 1587.401, 1781.797],
    [1781.797, 2000.0, 2244.924],
    [2244.924, 2519.842, 2828.427],
    [2828.427, 3174.802, 3563.595],
    [3563.595, 4000.0, 4489.848],
    [4489.848, 5039.684, 5656.854],
    [5656.854, 6349.604, 7127.19],
    [7127.19, 8000.0, 8979.696],
    [8979.696, 10079.368, 11313.708],
    [11313.708, 12699.208, 14254.379],
    [14254.379, 16000.0, 17959.393],
    [17959.393, 20158.737, 22627.417],
  ],
};

# octave-bands

[![Build status](https://github.com/dimadeveatii/octave-bands/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dimadeveatii/octave-bands/actions/workflows/ci.yml?query=branch%3Amain++)
[![NPM Version](https://img.shields.io/npm/v/octave-bands.svg)](https://npmjs.org/package/octave-bands)
[![License](https://img.shields.io/npm/l/octave-bands)](https://github.com/dimadeveatii/octave-bands/blob/main/LICENSE)

Frequency limits for fractional _Octave Bands_.

A small, lightweight package for calculating the frequency bounds for fractional octave bands.  
Calculate the frequency bounds for `1/2`, `1/3`, ... `1/N` octave bands.

## Install

```sh
npm install octave-bands
```

```ts
import { octaves, bandwidth, equalizer } from 'octave-bands';
```

## Usage

Get frequency limits for 11 octave bands:

```ts
import { octaves } from 'octave-bands';

const bands = octaves(); // or `octaves(1)`
console.table(bands);

/*
┌─────────┬───────────┬────────┬───────────┐
│ (index) │     0     │   1    │     2     │
├─────────┼───────────┼────────┼───────────┤
│    0    │  11.049   │ 15.625 │  22.097   │
│    1    │  22.097   │ 31.25  │  44.194   │
│    2    │  44.194   │  62.5  │  88.388   │
│    3    │  88.388   │  125   │  176.777  │
│    4    │  176.777  │  250   │  353.553  │
│    5    │  353.553  │  500   │  707.107  │
│    6    │  707.107  │  1000  │ 1414.214  │
│    7    │ 1414.214  │  2000  │ 2828.427  │
│    8    │ 2828.427  │  4000  │ 5656.854  │
│    9    │ 5656.854  │  8000  │ 11313.708 │
│   10    │ 11313.708 │ 16000  │ 22627.417 │
└─────────┴───────────┴────────┴───────────┘
*/
```

The `octaves` function returns an array of band frequencies, where each band is a tuple of its _low_, _center_ and _high_ frequency in the form of `[low, center, high]`.

To get only the center frequencies:

```ts
import { octaves } from 'octave-bands';

const bands = octaves();
console.table(bands.map(([low, center, high]) => center));

/*
┌─────────┬────────┐
│ (index) │ Values │
├─────────┼────────┤
│    0    │ 15.625 │
│    1    │ 31.25  │
│    2    │  62.5  │
│    3    │  125   │
│    4    │  250   │
│    5    │  500   │
│    6    │  1000  │
│    7    │  2000  │
│    8    │  4000  │
│    9    │  8000  │
│   10    │ 16000  │
└─────────┴────────┘
*/
```

Get _one-third-octave_ bands:

```ts
import { octaves } from 'octave-bands';

const bands = octaves(1 / 3);
console.table(bands);

/*
┌─────────┬───────────┬───────────┬───────────┐
│ (index) │     0     │     1     │     2     │
├─────────┼───────────┼───────────┼───────────┤
│    0    │   13.92   │  15.625   │  17.538   │
│    1    │  17.538   │  19.686   │  22.097   │
...............................................
│   18    │  890.899  │   1000    │ 1122.462  │
...............................................
│   31    │ 17959.393 │ 20158.737 │ 22627.417 │
└─────────┴───────────┴───────────┴───────────┘
*/
```

Get the frequency limits for a 21-band equalizer covering an audio spectrum
from 20Hz to 20kHz

```ts
import { equalizer } from 'octave-bands';

const bands = equalizer(21, { spectrum: [20, 20000] });
console.table(bands);

/*
┌─────────┬───────────┬───────────┬───────────┐
│ (index) │     0     │     1     │     2     │
├─────────┼───────────┼───────────┼───────────┤
│    0    │  16.828   │    20     │   23.77   │
│    1    │   23.77   │  28.251   │  33.576   │
│    2    │  33.576   │  39.905   │  47.427   │
│    3    │  47.427   │  56.368   │  66.993   │
...............................................
│   19    │ 11913.243 │ 14158.916 │ 16827.903 │
│   20    │ 16827.903 │   20000   │ 23770.045 │
└─────────┴───────────┴───────────┴───────────┘
*/
```

To get the fractional bandwidth constant:

```ts
import { bandwidth } from 'octave-bands';

console.log('octave bandwidth', bandwidth()); // ~0.707
console.log('1/2 octave bandwidth', bandwidth(1 / 2)); // ~0.348
console.log('1/3 octave bandwidth', bandwidth(1 / 3)); // ~0.232
```

## API

> `octaves(fraction: number = 1, options?: Options): [number, number, number][]`

Calculates the frequencies for fractional octave bands.

Arguments:

- `fraction` - octave fraction _(defaults to `1`)_
- `options` - additional options:

```ts
type Options: {
    center?: number,
    spectrum?: [number, number]
}
```

- `center` the center frequency of the band that will be used as a starting point to calculate other bands (defaults to `1000`).
- `spectrum` - a two-numbers array representing the _min_ and _max_ values to include for center frequencies (defaults to `[15, 21000]`)

Returns:

- `[number, number, number][]` returns an array where each element represents the frequency bounds of a band `[low, center, high]`

> `equalizer(bands: number, options?: Options): [number, number, number][]`

Calculates the frequency bounds for a given number of bands that should cover an audio spectrum.  
This is similar to `octaves` function, but instead of using octave's _fraction_ to calculate the frequencies, it uses the
number of bands to output.

Arguments:

- `bands` - the number of bands to output

- `options` - additional options:

```ts
type Options: {
    spectrum?: [number, number]
}
```

- `spectrum` - a two-numbers array representing the _min_ and _max_ values to include for center frequencies (defaults to `[15, 21000]`)

Returns:

- `[number, number, number][]` returns an array where each element represents the frequency bounds of a band `[low, center, high]`

> `bandwidth(fraction: number): number`

Calculates the constant bandwidth per 1/N-octave.

Arguments:

- `fraction` - octave fraction _(defaults to `1`)_

Returns:

- `number` the bandwidth constant

## Formula

The following formula for calculating `1/N` octave bands in a given audio spectrum (ex. `~20Hz` to `~20KHz`) is used:

```js
// 1/N: one-Nth-octave

f_center_0 = 1000

// Center frequency of i-th band
f_center(i) = f_center(i-1) * 2^(1 / N) = f_center(i+1) * 1 / 2^(1 / N)

// Lower center frequency of n-th band
f_low(i) = f_center(i) * 1 / 2^(1 / 2*N)

// Higher center frequency of n-th band
f_high(i) = f_center(i) * 2^(1 / 2*N)

// And for every i-th band holds:
spectrum[0] <= f_center(i) <= spectrum[1]

// Fractional band width per 1/N-octave band (constant):
BW = (f_high - f_low) / f_center // for every one-Nth-octave band
```

## License

[MIT](LICENSE)

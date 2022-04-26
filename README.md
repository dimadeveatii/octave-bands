# octave-bands

Frequency limits for fractional _Octave Bands_.

A small, lightweight package to calculate frequency limits for fractional octave bands.  
Calculate the frequency limits for `1/2`, `1/3`, ... `1/N` octave bands.

## Install

```sh
npm install octave-bands
```

## Usage

Get frequency limits for 11 octave bands:

```ts
import { octaves } from 'octave-bands';

const bands = octaves(); // or `octaves(1)`
console.table(bands);

/**
┌─────────┬────────────────────┬────────┬───────────────────┐
│ (index) │         0          │   1    │         2         │
├─────────┼────────────────────┼────────┼───────────────────┤
│    0    │ 11.048543456039804 │ 15.625 │ 22.09708691207961 │
│    1    │ 22.097086912079607 │ 31.25  │ 44.19417382415922 │
.............................................................
│    6    │ 707.1067811865474  │  1000  │ 1414.213562373095 │
.............................................................
│   10    │ 11313.708498984759 │ 16000  │ 22627.41699796952 │
└─────────┴────────────────────┴────────┴───────────────────┘
**/
```

The `octaves` function returns an array of band frequencies, where each band is a tuple of its _low_, _center_ and _high_ frequency in the form of `[low, center, high]`.  
To get only the center frequencies:

```ts
import { octaves } from 'octave-bands';

const bands = octaves();
console.table(bands.map(([_, center, _]) => center));

/**
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
**/
```

Get _one-third_ octave bands:

```ts
import { octaves } from 'octave-bands';

const bands = octaves(1 / 3);
console.table(bands);

/**
┌─────────┬────────────────────┬────────────────────┬────────────────────┐
│ (index) │         0          │         1          │         2          │
├─────────┼────────────────────┼────────────────────┼────────────────────┤
│    0    │  13.9202924709428  │ 15.624999999999998 │ 17.53846950483395  │
│    1    │ 17.53846950483395  │ 19.68626640460739  │ 22.097086912079607 │
│    2    │ 22.097086912079607 │ 24.803141437003113 │  27.8405849418856  │
..........................................................................
│   31    │ 17959.39277294997  │ 20158.736798317972 │ 22627.41699796952  │
└─────────┴────────────────────┴────────────────────┴────────────────────┘
**/
```

Get _one-half_ octave bands in a custom audio spectrum range:

```ts
import { octaves } from 'octave-bands';

const bands = octaves(1 / 2, { spectrum: [100, 16000] });
console.table(bands);

/**
┌─────────┬────────────────────┬────────────────────┬────────────────────┐
│ (index) │         0          │         1          │         2          │
├─────────┼────────────────────┼────────────────────┼────────────────────┤
│    0    │ 105.11205190671426 │ 124.99999999999993 │ 148.65088937534006 │
│    1    │ 148.65088937534009 │ 176.7766952966368  │ 210.22410381342854 │
..........................................................................
│   13    │ 9513.656920021775  │ 11313.708498984766 │ 13454.34264405944  │
└─────────┴────────────────────┴────────────────────┴────────────────────┘
**/
```

To get the fractional band width constant:

```ts
import { bandWidth } from 'octave-bands';

console.log('octave bandwidth', bandWidth()); // ~0.707
console.log('1/2 octave bandwidth', bandWidth(1 / 2)); // ~0.348
console.log('1/3 octave bandwidth', bandWidth(1 / 3)); // ~0.232
```

## Formula

The following formula for calculating `1/N` octave bands in a given audio spectrum (ex. `~20Hz` to `~20KHz`) is used:

```js
// 1/N: one-Nth-octave

// Center frequency:
f_center(middle_band) = 1000

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

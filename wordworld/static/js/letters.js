const _LETTER_FREQUENCIES = {
 e: 11.1607,
 a: 8.4966,
 r: 7.5809,
 i: 7.5448,
 o: 7.1635,
 t: 6.9509,
 n: 6.6544,
 s: 5.7375,
 l: 5.4893,
 c: 4.5488,
 u: 3.6308,
 d: 3.3844,
 p: 3.1671,
 m: 3.0129,
 h: 3.0034,
 g: 2.4705,
 b: 2.0720,
 f: 1.8121,
 y: 1.7779,
 w: 1.2899,
 k: 1.1016,
 v: 1.0074,
 x: 0.2902,
 z: 0.2722,
 j: 0.1965,
 q: 0.1962,
};

const _SWE_LETTER_FREQUENCEIS = {
 a: 9.383,
 b: 1.535,
 c: 1.486,
 d: 4.702,
 e: 10.149,
 f: 2.027,
 g: 2.862,
 h: 2.090,
 i: 5.817,
 j: 0.614,
 k: 3.140,
 l: 5.275,
 m: 3.471,
 n: 8.542,
 o: 4.482,
 p: 1.839,
 // q: 0.020,
 r: 8.431,
 s: 6.590,
 t: 7.691,
 u: 1.919,
 v: 2.415,
 // w: 0.142,
 x: 0.159,
 y: 0.708,
 z: 0.070,
 å: 1.338,
 ä: 1.797,
 ö: 1.305,
}

const drawFromBag = (mode) => {
    const frecs = mode.indexOf("SWE") === 0 ? _SWE_LETTER_FREQUENCEIS : _LETTER_FREQUENCIES;
    const sum = Object.values(frecs)
        .reduce((acc, value) => acc + value, 0);
    let value = _STATUS.rng() * sum;
    return Object
        .keys(frecs)
        .find(k => {
            value -= frecs[k];
            if (value <= 0) return true;
            return false;
        });
    
};
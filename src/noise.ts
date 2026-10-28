const PRIMO_X = 3249723949;
const PRIMO_Y = 1698622633;
const PRIMO_Z = 2284126177;

export function hash(ix: number, iy: number, seed: number): number {
    
    let a = Math.imul(ix, PRIMO_X); 
    let b = Math.imul(iy, PRIMO_Y); 
    
    let c = a ^ b ^ seed; 
    
    let h = Math.imul(c,  PRIMO_Z); 
    h ^= h >>> 13;
    h ^= h >>> 16;

    return (h >>> 0) / 4294967296;
} 

function lerp(a: number, b: number, t: number): number {
    return a  + ( b - a ) * t; 
}

function smoothstep(t: number): number {
    return t * t * ( 3 - 2 * t ); 
}

export function valueNoise(x: number, y: number, seed: number): number {
    
    let ix = Math.floor(x); 
    let iy = Math.floor(y); 
    
    let tx = x - ix; 
    let ty = y - iy; 

    let v00 = hash(ix, iy, seed); 
    let v10 = hash(ix + 1, iy, seed); 
    let v01 = hash(ix, iy + 1, seed); 
    let v11 = hash(ix + 1, iy + 1, seed); 

    let sx = smoothstep(tx); 
    let sy = smoothstep(ty); 

    let top = lerp(v00, v10, sx); 
    let down = lerp(v01, v11, sx); 
    let result = lerp(top, down, sy); 


    return result; 
}

export function fbm(x: number, y: number, seed: number, octavas: number, lacunaridad: number, persistencia: number): number {

    let frecuencia = 1;
    let amplitud = 1; 

    let suma = 0; 
    let sumAmplitudes = 0;
    
    for (let i = 0; i < octavas; i++) {
        suma += valueNoise( x * frecuencia, y * frecuencia, seed) * amplitud; 
        sumAmplitudes += amplitud; 
        frecuencia *= lacunaridad; 
        amplitud *= persistencia; 
    }; 

    return suma / sumAmplitudes; 
}

import { fbm, lerp } from './noise.ts'

export function generateHeightMap(width: number, height: number, seed: number): Float32Array {
    
    let heights = new Float32Array(width * height);
    
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){

            const index = y * width + x; 
            heights[index] = fbm(x / 128, y / 128, seed, 6, 2, 0.5)
        }       
    }

    return heights; 
}

export function normalize(heights: Float32Array): void {

    let min = Infinity; 
    let max = -Infinity; 

    for(let i = 0; i < heights.length; i++){
        min = Math.min(min, heights[i]);
        max = Math.max(max, heights[i]); 
    }

    for(let i = 0; i < heights.length; i++){
        heights[i] = (heights[i] - min) / (max - min); 
    }
}

// Mezcla el ruido con una "cúpula" (alta en el centro, 0 en los bordes) para que
// la tierra quede en el medio y el mar alrededor. strength: 0 = solo ruido, 1 = solo cúpula.
// Recibe alturas ya normalizadas y devuelve valores entre 0 y 1
export function applyContinentMask(heights: Float32Array, width: number, height: number, strength: number): void {

    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){

            // Coordenadas centradas: (0, 0) en el centro, -1 a 1 hacia los bordes
            const nx = ((x + 0.5) / width) * 2 - 1;
            const ny = ((y + 0.5) / height) * 2 - 1;

            // Distancia al cuadrado, limitada a 1 para que las esquinas no bajen más que los bordes
            const d2 = Math.min(1, nx * nx + ny * ny);
            const dome = 1 - d2;

            const index = y * width + x;
            heights[index] = lerp(heights[index], dome, strength);
        }
    }
}

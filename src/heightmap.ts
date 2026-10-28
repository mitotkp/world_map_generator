import { fbm } from './noise.ts'

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

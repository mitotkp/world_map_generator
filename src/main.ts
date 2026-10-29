//mport { mulberry32 } from "./random.ts"; 
//import { fbm } from "./noise.ts"; 
import { generateHeightMap, applyContinentMask, normalize } from './heightmap.ts'; 
import { colorForHeight } from './color.ts';
import { computeHillshade } from './hillshade.ts';

const canvas = document.getElementById('canvap') as HTMLCanvasElement; 
const ctx = canvas.getContext('2d'); 

//const rand = mulberry32(42);

if (ctx) {
  const width = 512; 
  const height = 512;
  
  canvas.width = width; 
  canvas.height = height; 

  const imageData = ctx.createImageData(width, height); 
  const data = imageData.data; 
  const alturas = generateHeightMap(width, height, 42); 
  normalize(alturas); 
  applyContinentMask(alturas, width, height, 0.6); 
  normalize(alturas); 
  const sombras = computeHillshade(alturas, width, height, 50); 

  for (let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){

      const index = (y * width + x ) * 4; 
      const altura = alturas[y * width + x]; 
      const [r, g, b] = colorForHeight(altura); 

      // Solo se sombrea la tierra: el mar es una superficie plana
      const sombra = altura > 0.45 ? sombras[y * width + x] : 1; 

      data[index] = r * sombra; 
      data[index + 1] = g * sombra; 
      data[index + 2] = b * sombra; 
      data[index + 3] = 255;  
    }
  }

  ctx.putImageData(imageData, 0, 0); 
}
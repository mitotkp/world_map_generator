//mport { mulberry32 } from "./random.ts"; 
//import { fbm } from "./noise.ts"; 
import { generateHeightMap, normalize } from './heightmap.ts'; 

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

  for (let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){

      const index = (y * width + x ) * 4; 
      const v = Math.floor(alturas[y * width + x] * 256); 

      data[index] = v; 
      data[index + 1] = v; 
      data[index + 2] = v; 
      data[index + 3] = 255;  
    }
  }

  ctx.putImageData(imageData, 0, 0); 
}
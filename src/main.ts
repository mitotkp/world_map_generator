//mport { mulberry32 } from "./random.ts"; 
//import { fbm } from "./noise.ts"; 
import { generateHeightMap, normalize } from './heightmap.ts'; 
import { colorForHeight } from './color.ts';

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
      const [r, g, b] = colorForHeight(alturas[y * width + x]); 

      data[index] = r; 
      data[index + 1] = g; 
      data[index + 2] = b; 
      data[index + 3] = 255;  
    }
  }

  ctx.putImageData(imageData, 0, 0); 
}
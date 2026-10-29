# World Map Generator

[Español](#español) · [English](#english)

---

## Español

Generador de mundos procedurales que corre en el navegador. A partir de un solo número (la **semilla**) produce un mapa completo: relieve, mares, ríos, biomas y nombres inventados, exportable como imagen PNG. La misma semilla siempre genera el mismo mundo.

Está escrito en **TypeScript** con **Vite** y **Canvas 2D**, y no usa librerías de ruido ni de generación: cada algoritmo está implementado desde cero. Es un proyecto de aprendizaje que avanza por hitos, y cada hito incorpora una técnica nueva de generación procedural.

### Características

**Disponibles hoy**
- Generador pseudoaleatorio con semilla: los resultados son reproducibles.
- Función hash 2D que asigna un valor fijo a cada punto de la cuadrícula.
- *Value noise* suavizado con interpolación *smoothstep*.
- *fBm* (fractional Brownian motion): suma de varias octavas de ruido para dar detalle a distintas escalas.
- Mapa de alturas de 512×512 guardado en memoria (`Float32Array`), separado del dibujo.
- Normalización del mapa, para que todas las semillas usen el rango completo de 0 a 1.
- Máscara de continente: la tierra se concentra en el centro y queda rodeada de mar.
- Colores hipsométricos con degradado: mar, playa, pasto, bosque, roca y nieve.
- Sombreado de relieve, con luz desde el noroeste y sombra en las laderas opuestas.

**Planeadas**
- Ríos que bajan desde las montañas hasta el mar.
- Biomas según temperatura y humedad: desierto, bosque, tundra y otros.
- Nombres inventados para regiones.
- Controles en pantalla y exportación a PNG.

### Requisitos

- [Node.js](https://nodejs.org/) 20.19+ o 22.12+ (lo pide Vite 8).
- Un navegador moderno: Chrome, Edge, Firefox o Safari.

### Instalación y uso

```bash
git clone https://github.com/mitotkp/world_map_generator.git
cd world_map_generator
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`). Al guardar cualquier archivo de `src/`, la página se recarga sola.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Revisa los tipos con `tsc` y genera la versión estática en `dist/` |
| `npm run preview` | Sirve la versión compilada de `dist/` para probarla |
| `npx tsc --noEmit` | Solo revisa los tipos, sin compilar |

### Cómo funciona

La generación es una cadena de pasos. Cada paso usa el resultado del anterior:

```
semilla → hash 2D → value noise → fBm → mapa de alturas → normalización y continente → colores y sombreado → canvas
```

1. **Semilla y PRNG** (`random.ts`). `mulberry32` es un generador pseudoaleatorio: a partir de una semilla produce siempre la misma secuencia de números entre 0 y 1. Gracias a eso, el mundo es reproducible.

2. **Hash 2D** (`noise.ts`). Convierte una coordenada entera `(x, y)` y la semilla en un número entre 0 y 1. A diferencia del PRNG, se le puede preguntar por cualquier punto y en cualquier orden, y siempre responde lo mismo. Multiplica cada coordenada por una constante impar grande con `Math.imul` (multiplicación de enteros de 32 bits), combina los resultados con XOR y luego mezcla los bits con desplazamientos (`>>>`).

3. **Value noise** (`noise.ts`). El hash solo da ruido blanco: puntos sin relación con sus vecinos. Para lograr un terreno coherente, el hash asigna un valor a cada esquina de una cuadrícula, y cualquier punto intermedio se obtiene interpolando sus 4 esquinas. Antes de interpolar, la posición pasa por *smoothstep* (`t² · (3 − 2t)`) para que no se noten las uniones entre celdas.

4. **fBm** (`noise.ts`). Una sola capa de value noise da colinas suaves y poco realistas. El fBm suma varias capas (*octavas*): cada una con el doble de frecuencia (*lacunaridad*) y la mitad de peso (*persistencia*) que la anterior. Así aparecen continentes, cordilleras y rugosidad al mismo tiempo. El resultado se divide por la suma de los pesos para mantenerlo entre 0 y 1.

5. **Mapa de alturas** (`heightmap.ts`). Calcula el fBm para cada celda del mapa y lo guarda en un `Float32Array` plano, donde la celda `(x, y)` está en la posición `y · ancho + x`. Separar los datos del dibujo permite que los pasos siguientes (ríos, biomas) consulten las alturas de los vecinos sin recalcular el ruido.

6. **Normalización y continente** (`heightmap.ts`). `normalize` estira las alturas para que vayan exactamente de 0 a 1, con la fórmula `(h − min) / (max − min)`. Sin este paso, cada semilla tendría un rango distinto y el mismo nivel del mar inundaría más unos mundos que otros. Después, `applyContinentMask` mezcla el ruido con una "cúpula" que vale 1 en el centro y 0 en los bordes (`1 − d²`, donde `d` es la distancia al centro). La cúpula da la forma general del continente y el ruido pone la costa y las montañas. Al final se vuelve a normalizar.

7. **Colores** (`color.ts`). Una tabla de paradas de color asigna un color a cada altura: agua profunda, agua de costa, arena, pasto, bosque, roca y nieve. El nivel del mar está en `0.45`. Para una altura que cae entre dos paradas, `colorForHeight` interpola cada canal (rojo, verde y azul) con `lerp`, así que los cambios de color son suaves. El agua y la arena están casi pegadas, para que la costa tenga un corte nítido.

8. **Sombreado de relieve** (`hillshade.ts`). Para cada celda se calcula la pendiente comparando las alturas de sus vecinos (*diferencias centrales*) y, con ella, la **normal**: la dirección hacia la que mira el terreno. El *producto punto* entre la normal y la dirección de la luz (que viene del noroeste) dice cuánta luz recibe la celda. El resultado se divide por la luz que recibe un terreno plano, así que el plano conserva su color, las laderas iluminadas se aclaran y las opuestas se oscurecen. El mar no se sombrea.

9. **Dibujo** (`main.ts`). Recorre el mapa y pinta cada celda en el canvas con `ImageData`: el color de su altura, multiplicado por el sombreado si es tierra.

### Parámetros actuales

Por ahora están fijos en el código. En el hito 6 se podrán cambiar con controles en pantalla.

| Parámetro | Valor | Dónde | Efecto |
|---|---|---|---|
| Tamaño | 512 × 512 | `main.ts` | Resolución del mapa en celdas o píxeles |
| Semilla | `42` | `main.ts` | Otro número genera otro mundo |
| Escala | `1/128` | `heightmap.ts` | Tamaño de los rasgos principales; un número mayor da continentes más grandes |
| Octavas | `6` | `heightmap.ts` | Cantidad de capas de detalle |
| Lacunaridad | `2` | `heightmap.ts` | Cuánto se multiplica la frecuencia entre octavas |
| Persistencia | `0.5` | `heightmap.ts` | Cuánto pesa cada octava respecto de la anterior; más alto da un terreno más rugoso |
| Fuerza de la máscara | `0.6` | `main.ts` | 0 = solo ruido (tierra por todas partes); 1 = una isla redonda perfecta |
| Nivel del mar | `0.45` | `color.ts`, `main.ts` | Las alturas por debajo son agua |
| Exageración del relieve | `50` | `main.ts` | Más alto da sombras más marcadas |

### Estructura del proyecto

```
world_map_generator/
├── index.html        Página con el <canvas> y la carga de src/main.ts
├── src/
│   ├── random.ts     PRNG con semilla (mulberry32)
│   ├── noise.ts      Hash 2D, lerp, smoothstep, value noise y fBm
│   ├── heightmap.ts  Mapa de alturas (Float32Array), normalización y máscara de continente
│   ├── color.ts      Paradas de color y colorForHeight
│   ├── hillshade.ts  Sombreado de relieve
│   └── main.ts       Punto de entrada: genera el mapa y lo dibuja
├── public/           Archivos estáticos (íconos)
├── package.json
└── tsconfig.json
```

### Hoja de ruta

| Hito | Contenido | Estado |
|---|---|---|
| 0 | Canvas, `ImageData` y generador pseudoaleatorio con semilla | ✅ Hecho |
| 1 | Hash 2D, value noise, fBm y mapa de alturas | ✅ Hecho |
| 2 | Normalización, nivel del mar, máscara de continente, colores hipsométricos y sombreado de relieve | ✅ Hecho |
| 3 | Ríos: relleno de depresiones (*priority-flood*), dirección del agua (D8) y acumulación de flujo | ⏳ Pendiente |
| 4 | Temperatura (latitud y altura), humedad y biomas según el diagrama de Whittaker | ⏳ Pendiente |
| 5 | Nombres inventados con cadenas de Markov y etiquetas sobre el mapa | ⏳ Pendiente |
| 6 | Exportación a PNG, controles en pantalla y generación en un Web Worker | ⏳ Pendiente |

### Licencia

Distribuido bajo la licencia [MIT](LICENSE).

---

## English

A procedural world generator that runs in the browser. From a single number (the **seed**) it builds a complete map: terrain, seas, rivers, biomes and made-up place names, exportable as a PNG image. The same seed always produces the same world.

It is written in **TypeScript** with **Vite** and **Canvas 2D**, and it uses no noise or generation libraries: every algorithm is implemented from scratch. It is a learning project that grows milestone by milestone, and each milestone adds a new procedural generation technique.

### Features

**Available now**
- Seeded pseudo-random number generator, so results are reproducible.
- 2D hash function that gives every grid point a fixed value.
- Value noise, smoothed with *smoothstep* interpolation.
- *fBm* (fractional Brownian motion): several octaves of noise added together for detail at different scales.
- 512×512 heightmap stored in memory (`Float32Array`), separate from rendering.
- Map normalization, so every seed uses the full 0 to 1 range.
- Continent mask: land gathers in the center and is surrounded by sea.
- Hypsometric colors with gradients: sea, beach, grass, forest, rock and snow.
- Hillshading, with light from the northwest and shadow on the opposite slopes.

**Planned**
- Rivers flowing from the mountains down to the sea.
- Biomes based on temperature and moisture: desert, forest, tundra and more.
- Made-up names for regions.
- On-screen controls and PNG export.

### Requirements

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (required by Vite 8).
- A modern browser: Chrome, Edge, Firefox or Safari.

### Installation and usage

```bash
git clone https://github.com/mitotkp/world_map_generator.git
cd world_map_generator
npm install
npm run dev
```

Open the URL Vite prints (`http://localhost:5173` by default). The page reloads by itself whenever you save a file in `src/`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-checks with `tsc` and builds the static site into `dist/` |
| `npm run preview` | Serves the built `dist/` folder for testing |
| `npx tsc --noEmit` | Type-checks only, without building |

### How it works

Generation is a chain of steps. Each step uses the result of the one before it:

```
seed → 2D hash → value noise → fBm → heightmap → normalization and continent → colors and hillshading → canvas
```

1. **Seed and PRNG** (`random.ts`). `mulberry32` is a pseudo-random generator: from a seed it always produces the same sequence of numbers between 0 and 1. This is what makes the world reproducible.

2. **2D hash** (`noise.ts`). Turns an integer coordinate `(x, y)` and the seed into a number between 0 and 1. Unlike the PRNG, you can ask it about any point, in any order, and it always returns the same answer. It multiplies each coordinate by a large odd constant with `Math.imul` (32-bit integer multiplication), combines the results with XOR, and then mixes the bits with shifts (`>>>`).

3. **Value noise** (`noise.ts`). The hash alone only gives white noise: points with no relation to their neighbors. To get coherent terrain, the hash assigns a value to each corner of a grid, and any point in between is found by interpolating its 4 corners. Before interpolating, the position goes through *smoothstep* (`t² · (3 − 2t)`) so the seams between cells don't show.

4. **fBm** (`noise.ts`). A single layer of value noise looks like smooth, unrealistic hills. fBm adds several layers (*octaves*), each with twice the frequency (*lacunarity*) and half the weight (*persistence*) of the previous one. This gives continents, mountain ranges and roughness all at once. The result is divided by the sum of the weights to keep it between 0 and 1.

5. **Heightmap** (`heightmap.ts`). Computes fBm for every map cell and stores it in a flat `Float32Array`, where cell `(x, y)` lives at index `y · width + x`. Keeping the data separate from rendering lets later steps (rivers, biomes) read neighboring heights without recomputing the noise.

6. **Normalization and continent** (`heightmap.ts`). `normalize` stretches the heights so they go exactly from 0 to 1, using `(h − min) / (max − min)`. Without this step every seed would have a different range, and the same sea level would flood some worlds more than others. Then `applyContinentMask` blends the noise with a "dome" that is 1 at the center and 0 at the edges (`1 − d²`, where `d` is the distance to the center). The dome sets the overall shape of the continent, and the noise adds the coastline and the mountains. The map is normalized again at the end.

7. **Colors** (`color.ts`). A table of color stops gives a color to each height: deep water, coastal water, sand, grass, forest, rock and snow. Sea level is at `0.45`. For a height that falls between two stops, `colorForHeight` interpolates each channel (red, green and blue) with `lerp`, so color changes are smooth. Water and sand sit almost on top of each other, so the coastline has a sharp edge.

8. **Hillshading** (`hillshade.ts`). For each cell, the slope is computed by comparing the heights of its neighbors (*central differences*), and from it the **normal**: the direction the terrain faces. The *dot product* between the normal and the light direction (coming from the northwest) tells how much light the cell gets. The result is divided by the light a flat cell gets, so flat ground keeps its color, slopes facing the light get brighter and the opposite ones get darker. The sea is not shaded.

9. **Rendering** (`main.ts`). Walks the map and paints each cell onto the canvas through `ImageData`: the color for its height, multiplied by the shading if it is land.

### Current parameters

They are hard-coded for now. Milestone 6 will make them adjustable with on-screen controls.

| Parameter | Value | Where | Effect |
|---|---|---|---|
| Size | 512 × 512 | `main.ts` | Map resolution in cells or pixels |
| Seed | `42` | `main.ts` | A different number generates a different world |
| Scale | `1/128` | `heightmap.ts` | Size of the main features; a larger number gives bigger continents |
| Octaves | `6` | `heightmap.ts` | Number of detail layers |
| Lacunarity | `2` | `heightmap.ts` | How much the frequency is multiplied between octaves |
| Persistence | `0.5` | `heightmap.ts` | Weight of each octave relative to the previous one; higher gives rougher terrain |
| Mask strength | `0.6` | `main.ts` | 0 = noise only (land everywhere); 1 = a perfectly round island |
| Sea level | `0.45` | `color.ts`, `main.ts` | Heights below it are water |
| Relief exaggeration | `50` | `main.ts` | Higher gives stronger shadows |

### Project structure

```
world_map_generator/
├── index.html        Page with the <canvas>; loads src/main.ts
├── src/
│   ├── random.ts     Seeded PRNG (mulberry32)
│   ├── noise.ts      2D hash, lerp, smoothstep, value noise and fBm
│   ├── heightmap.ts  Heightmap (Float32Array), normalization and continent mask
│   ├── color.ts      Color stops and colorForHeight
│   ├── hillshade.ts  Hillshading
│   └── main.ts       Entry point: generates the map and draws it
├── public/           Static files (icons)
├── package.json
└── tsconfig.json
```

### Roadmap

| Milestone | Content | Status |
|---|---|---|
| 0 | Canvas, `ImageData` and seeded pseudo-random generator | ✅ Done |
| 1 | 2D hash, value noise, fBm and heightmap | ✅ Done |
| 2 | Normalization, sea level, continent mask, hypsometric colors and hillshading | ✅ Done |
| 3 | Rivers: depression filling (*priority-flood*), flow direction (D8) and flow accumulation | ⏳ Pending |
| 4 | Temperature (latitude and elevation), moisture and biomes based on the Whittaker diagram | ⏳ Pending |
| 5 | Made-up names with Markov chains and labels on the map | ⏳ Pending |
| 6 | PNG export, on-screen controls and generation in a Web Worker | ⏳ Pending |

### License

Released under the [MIT](LICENSE) license.

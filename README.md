# World Map Generator

Generador de mundos procedurales en el navegador: relieve, ríos, biomas y nombres inventados, exportable como imagen. Hecho en TypeScript con Vite y Canvas 2D, sin librerías de ruido: cada algoritmo está escrito desde cero como proyecto de aprendizaje.

*Procedural world map generator for the browser (TypeScript + Vite + Canvas 2D). Every algorithm is written from scratch as a learning project.*

## Uso

Requiere Node.js 20.19 o superior.

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

Para compilar una versión estática en `dist/`:

```bash
npm run build
```

## Estado

| Hito | Contenido | Estado |
|---|---|---|
| 0 | Canvas y generador pseudoaleatorio con semilla | ✅ |
| 1 | Hash 2D, value noise, fBm y mapa de alturas | ✅ |
| 2 | Nivel del mar, forma de continente, colores por altura y sombreado de relieve | ⏳ |
| 3 | Ríos: relleno de depresiones, dirección del agua y acumulación de flujo | ⏳ |
| 4 | Temperatura, humedad y biomas | ⏳ |
| 5 | Nombres inventados con cadenas de Markov | ⏳ |
| 6 | Exportar a PNG, controles y Web Worker | ⏳ |

## Estructura

```
src/
  random.ts     PRNG con semilla (mulberry32)
  noise.ts      hash 2D, value noise y fBm
  heightmap.ts  genera el mapa de alturas (Float32Array)
  main.ts       dibuja el mapa en el canvas
```

## Licencia

[MIT](LICENSE)

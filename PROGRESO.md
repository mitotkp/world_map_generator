# Progreso del proyecto

Recordatorio de todo lo hecho hasta el **29 de octubre de 2026**, para poder retomar el proyecto sin la conversación original. El [README](README.md) explica qué hace el generador; este archivo explica **cómo se llegó hasta aquí y cómo seguir**.

---

## 1. Forma de trabajo

- El proyecto es de **aprendizaje** y avanza **por hitos**.
- En cada hito, Claude explica la teoría y da las firmas de las funciones y el resultado esperado. Después, el autor escribe el código y Claude lo revisa.
- Claude da el código completo solo para piezas que no son el objetivo de aprendizaje (por ejemplo, el PRNG) o cuando se lo piden. Los pasos 2.2, 2.3 y 2.4 los escribió Claude, a pedido.
- Cada paso terminado se sube a GitHub con un commit propio.

**Para retomar con Claude en una conversación nueva**, basta con decirle algo como:

> Estoy haciendo el generador de mundos de este repositorio. Lee `PROGRESO.md` y el `README.md`. Vamos por el Hito 3: explícame la teoría y yo lo programo.

---

## 2. Historial de commits

| Commit | Contenido |
|---|---|
| `0fcc540` | Hitos 0 y 1: PRNG con semilla, value noise, fBm y mapa de alturas |
| `ab2a996` | README detallado en español e inglés |
| `429317a` | Hito 2.1: normalizar el mapa de alturas |
| `cbc37b1` | Hito 2.2: colores hipsométricos con degradado |
| `2fa108d` | Hito 2.3: máscara de continente |
| `67e9aec` | Hito 2.4: sombreado de relieve; cierra el Hito 2 en el README |

---

## 3. Lo que se hizo en cada hito

### Hito 0: canvas y PRNG ✅
- Proyecto creado con `npm create vite@latest`, plantilla `vanilla-ts`.
- `index.html` tiene un `<canvas id="canvap">`.
- **`ImageData`**: un array `Uint8ClampedArray` con 4 valores por píxel (R, G, B, A, de 0 a 255). El píxel `(x, y)` empieza en la posición `(y * width + x) * 4`.
- **`random.ts`**: `mulberry32(seed)`, un generador pseudoaleatorio. Devuelve **una función**, y cada llamada a esa función da el siguiente número entre 0 y 1. La misma semilla produce siempre la misma secuencia.

### Hito 1: ruido y mapa de alturas ✅
- **`hash(ix, iy, seed)`** en `noise.ts`: convierte una coordenada entera en un número entre 0 y 1.
  - Multiplica cada coordenada por una **constante impar grande** con `Math.imul`, que es la multiplicación de enteros de 32 bits. Las constantes tienen que ser impares y menores que 2³².
  - Combina los resultados con XOR (`^`) y mezcla los bits con desplazamientos (`h ^= h >>> 13`).
  - Termina con `(h >>> 0) / 4294967296` para pasar a un número entre 0 y 1.
- **`valueNoise(x, y, seed)`**: busca las 4 esquinas enteras alrededor del punto y obtiene su valor con `hash`. Después interpola entre ellas con `lerp`, pasando antes la posición por `smoothstep(t) = t² · (3 − 2t)` para que no se noten las uniones.
- **`fbm(...)`**: suma varias octavas de `valueNoise`. En cada octava la frecuencia se multiplica por la *lacunaridad* (2) y el peso por la *persistencia* (0.5). Al final divide por la suma de los pesos.
- **`heightmap.ts`**: `generateHeightMap(width, height, seed)` guarda el fBm de cada celda en un `Float32Array` plano, con índice `y * width + x`. Usa la escala `x / 128`.

### Hito 2: mapa con aspecto de atlas ✅

**2.1 Normalizar** (`normalize` en `heightmap.ts`)
- El fBm no llega de 0 a 1: con la semilla 42 iba de 0.17 a 0.85, y el rango cambia con cada semilla.
- Se modifica el array en el sitio con `(h − min) / (max − min)`. `min` empieza en `Infinity` y `max` en `-Infinity`.
- Probado: el ejemplo `[0.30, 0.70, 0.20, 0.50, 0.60]` da `[0.2, 1, 0, 0.6, 0.8]`.

**2.2 Colores** (`color.ts`, ojo: sin "s")
- `STOPS` es una tabla de paradas `{ height, color }` ordenadas de menor a mayor altura. El nivel del mar está en **0.45**.
- `colorForHeight(h)` busca las dos paradas que rodean a `h`, calcula `t = (h − a.height) / (b.height − a.height)` y hace `lerp` de cada canal.
- La arena empieza en **0.451**, pegada al agua (0.45), para que la costa tenga un corte nítido y no una franja verdosa.
- Para esto se exportó `lerp` desde `noise.ts`.

**2.3 Máscara de continente** (`applyContinentMask` en `heightmap.ts`)
- Mezcla el ruido con una **cúpula** que vale 1 en el centro y 0 en los bordes:
  `altura = lerp(altura, 1 − min(1, d²), fuerza)`, con fuerza **0.6**.
- Orden en `main.ts`: **normalizar → máscara → normalizar**.
- **Lección importante:** la primera idea fue *restar* `d² × fuerza` y luego normalizar, pero **no funcionó**. Las esquinas (`d² = 2`) quedaban tan hundidas que `normalize` gastaba casi todo el rango en ellas, y el resto del mapa subía por encima del mar. Con más fuerza salía *menos* agua. También se probó multiplicar, pero dejaba demasiado mar.
- Resultado: 42–57 % de agua según la semilla, y los bordes casi siempre son agua.

**2.4 Sombreado de relieve** (`hillshade.ts`)
- La pendiente se calcula con **diferencias centrales**: `dzdx = (derecha − izquierda) / 2`. En los bordes, los índices de los vecinos se limitan con `Math.max` y `Math.min`.
- **Normal**: `(−dzdx·k, −dzdy·k, 1)`, normalizada. `k` es la exageración vertical, con valor **50**. Con 100 la textura se veía granulada.
- **Luz** desde el noroeste: `(−1, −1, 1) / √3`. En el canvas, `y` crece hacia abajo.
- `factor = max(0, normal · luz) / 0.577`. Se divide para que el terreno plano dé 1 y conserve su color.
- En `main.ts` solo se sombrea la tierra (`altura > 0.45`); el mar queda igual.
- Comprobado: la ladera que mira a la luz da 1.34, la de espaldas 0.45 y el plano 1.00.

---

## 4. Errores frecuentes que aparecieron (para no repetirlos)

- **Escribir en el canal equivocado de `ImageData`**, por ejemplo poner el valor en el alfa (`index + 3`).
- **Usar `mulberry32(42)` como si fuera un número.** Devuelve una función: hay que guardarla y llamarla, `const rand = mulberry32(42); rand();`.
- **`Math.imul` necesita dos argumentos**, y `*` no sirve en su lugar porque desborda a decimales.
- **`(ix, iy)` no es una llamada.** Es el operador coma y devuelve solo `iy`. Lo correcto es `hash(ix, iy, seed)`.
- **`max` tiene que empezar en `-Infinity`**, no en `Infinity`. Si no, el máximo nunca cambia y todo queda en 0.
- **Imports sin usar:** `tsconfig` tiene `noUnusedLocals`, así que `tsc` da error. Hay que comentar o borrar el import.
- **Variables declaradas dentro de un bucle** no existen fuera de él (alcance de bloque).
- **El editor puede sobrescribir cambios externos.** Si alguien más (Claude u otra herramienta) modifica un archivo que tienes abierto, recárgalo antes de guardar.

---

## 5. Cómo probar

```bash
npm run dev
```
```bash
npx tsc --noEmit
```

Para probar una función suelta sin el navegador (Node 22.6 o más nuevo):

```bash
node --experimental-strip-types --no-warnings prueba.ts
```

Para que funcione, los imports del archivo de prueba tienen que llevar la extensión `.ts`, como ya hace el proyecto.

---

## 6. Parámetros actuales

| Parámetro | Valor | Dónde |
|---|---|---|
| Tamaño | 512 × 512 | `main.ts` |
| Semilla | 42 | `main.ts` |
| Escala | 1/128 | `heightmap.ts` |
| Octavas / lacunaridad / persistencia | 6 / 2 / 0.5 | `heightmap.ts` |
| Fuerza de la máscara | 0.6 | `main.ts` |
| Nivel del mar | 0.45 | `color.ts`, `main.ts` |
| Exageración del relieve | 50 | `main.ts` |

Ojo: el nivel del mar está escrito en **dos lugares** (`color.ts` y el `0.45` de `main.ts`). Si lo cambias, cámbialo en los dos. Más adelante conviene moverlo a una constante compartida.

---

## 7. Lo que sigue

### Hito 3: ríos ⏳ (el siguiente)
1. **Rellenar depresiones (*priority-flood*).** El ruido deja hoyos en los que el agua quedaría atrapada. El algoritmo "inunda" el mapa desde la costa hacia adentro con una **cola de prioridad** (siempre se procesa primero la celda más baja) y sube cada hoyo hasta el nivel por el que puede desbordarse. Hay que hacerlo sobre una **copia** de las alturas, para no alterar el mapa que se dibuja.
2. **Dirección del agua (D8).** Cada celda envía su agua al vecino **más bajo** de sus 8 vecinos.
3. **Acumulación de flujo.** Se procesan las celdas de la más alta a la más baja, y cada una le pasa su caudal acumulado (1 + lo que recibió) a su vecino de destino.
4. **Dibujar los ríos.** Se pintan de azul las celdas de tierra cuyo caudal supera un umbral; con más caudal, el río se ve más ancho u oscuro.

### Hito 4: biomas ⏳
Temperatura (según la latitud y la altura), humedad (según la distancia al mar y los ríos) y bioma según el diagrama de Whittaker.

### Hito 5: nombres ⏳
Cadenas de Markov entrenadas con una lista de nombres para inventar nombres nuevos, y etiquetas sobre el mapa.

### Hito 6: controles y exportación ⏳
Exportar a PNG, controles en pantalla (semilla, fuerza de la máscara, nivel del mar…) y generación en un Web Worker para que la página no se congele.

### Mejoras pendientes (opcionales)
- Usar `seed + i` en cada octava del fBm, para que no compartan la misma cuadrícula (la diferencia actual es muy pequeña).
- Proteger `normalize` contra la división por cero cuando `max === min` (un mapa totalmente plano).
- Sacar el nivel del mar a una constante compartida.
- Al cerrar cada hito, actualizar la tabla "Hoja de ruta" del README, en español y en inglés.

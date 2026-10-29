// Luz desde el noroeste (arriba a la izquierda) y desde arriba, ya normalizada.
// En el canvas "y" crece hacia abajo, por eso "arriba" es y negativo
const LUZ_X = -1 / Math.sqrt(3);
const LUZ_Y = -1 / Math.sqrt(3);
const LUZ_Z = 1 / Math.sqrt(3);

// Luz que recibe un terreno plano (normal (0, 0, 1)): se usa para que el plano dé factor 1
const LUZ_PLANO = LUZ_Z;

// Devuelve un factor por píxel: 1 = plano (color sin cambios), > 1 = mira a la luz, < 1 = en sombra
export function computeHillshade(heights: Float32Array, width: number, height: number, exaggeration: number): Float32Array {

    const shade = new Float32Array(width * height);

    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){

            // Vecinos, limitados a los bordes del mapa
            const xl = Math.max(0, x - 1);
            const xr = Math.min(width - 1, x + 1);
            const yu = Math.max(0, y - 1);
            const yd = Math.min(height - 1, y + 1);

            // Pendiente con diferencias centrales
            const dzdx = (heights[y * width + xr] - heights[y * width + xl]) / 2;
            const dzdy = (heights[yd * width + x] - heights[yu * width + x]) / 2;

            // Normal del terreno, exagerada y normalizada (largo 1)
            const nx = -dzdx * exaggeration;
            const ny = -dzdy * exaggeration;
            const nz = 1;
            const largo = Math.sqrt(nx * nx + ny * ny + nz * nz);

            // Producto punto: cuánto mira el terreno hacia la luz
            const luz = (nx * LUZ_X + ny * LUZ_Y + nz * LUZ_Z) / largo;

            shade[y * width + x] = Math.max(0, luz) / LUZ_PLANO;
        }
    }

    return shade;
}

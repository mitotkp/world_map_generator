import { lerp } from './noise.ts';

export type ColorStop = { height: number; color: [number, number, number] };

const STOPS: ColorStop[] = [
    { height: 0.00, color: [20, 40, 100] },    // agua profunda
    { height: 0.30, color: [35, 75, 150] },    // agua media
    { height: 0.45, color: [70, 130, 190] },   // agua de costa
    { height: 0.451, color: [210, 200, 140] }, // arena (casi pegada al agua: corte nítido)
    { height: 0.50, color: [190, 190, 120] },  // arena con pasto
    { height: 0.55, color: [80, 150, 60] },    // pasto
    { height: 0.70, color: [60, 110, 50] },    // bosque
    { height: 0.80, color: [120, 100, 80] },   // roca
    { height: 0.92, color: [240, 240, 240] },  // nieve
];

export function colorForHeight(h: number): [number, number, number] {
    for (let i = 0; i < STOPS.length - 1; i++) {
        const a = STOPS[i];
        const b = STOPS[i + 1];

        if (h < b.height) {
            const t = (h - a.height) / (b.height - a.height);
            return [
                lerp(a.color[0], b.color[0], t),
                lerp(a.color[1], b.color[1], t),
                lerp(a.color[2], b.color[2], t),
            ];
        }
    }

    return STOPS[STOPS.length - 1].color;
}

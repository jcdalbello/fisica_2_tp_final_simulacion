// src/application/BiotSavartCalculator.ts
import { Vector3D, Wire } from '../domain/entities';
import { IBiotSavartSolver } from '../domain/ports';
import { VectorMath } from '../domain/VectorMath';

export class BiotSavartCalculator implements IBiotSavartSolver {
    // Constante física: mu_0 / (4 * pi) = 10^-7 T*m/A
    private readonly MU_0_OVER_4PI = 1e-7;
    
    // Escala espacial: 1 píxel = 1 cm (0.01 metros)
    private readonly PIXEL_TO_METERS = 0.01;

    calculateFieldAt(point: Vector3D, wire: Wire): Vector3D | null {
        let bz = 0; 

        for (const seg of wire.segments) {
            // Se calcula el vector en píxeles para la tolerancia de singularidad
            const rVecPx = VectorMath.sub(point, seg.midPoint);
            const rMagPx = VectorMath.mag(rVecPx);

            // Tolerancia de singularidad (menor a 5 píxeles)
            if (rMagPx < 5) return null;

            // Se convierten las distancias a metros para la ecuación real
            const rVecM = {
                x: rVecPx.x * this.PIXEL_TO_METERS,
                y: rVecPx.y * this.PIXEL_TO_METERS,
                z: rVecPx.z * this.PIXEL_TO_METERS
            };
            const deltaLM = {
                x: seg.deltaL.x * this.PIXEL_TO_METERS,
                y: seg.deltaL.y * this.PIXEL_TO_METERS,
                z: seg.deltaL.z * this.PIXEL_TO_METERS
            };

            const rMagM = VectorMath.mag(rVecM);
            const crossProduct = VectorMath.cross(deltaLM, rVecM);
            
            // dB = (mu_0 / 4pi) * (dL x r) / r^3
            bz += this.MU_0_OVER_4PI * (crossProduct.z / Math.pow(rMagM, 3));
        }

        return { x: 0, y: 0, z: bz };
    }
}   
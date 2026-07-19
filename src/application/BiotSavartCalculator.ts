// src/application/BiotSavartCalculator.ts
import { Vector3D, Wire } from '../domain/entities';
import { IBiotSavartSolver } from '../domain/ports';
import { VectorMath } from '../domain/VectorMath';

export class BiotSavartCalculator implements IBiotSavartSolver {
    private readonly MU_0_OVER_4PI = 1e-7;
    // Singularidad a 5 centímetros (en metros)
    private readonly SINGULARITY_THRESHOLD = 0.05; 

    calculateFieldAt(point: Vector3D, wire: Wire): Vector3D | null {
        let b: Vector3D = {
            x: 0,
            y: 0,
            z: 0
        };

        for (const seg of wire.segments) {
            const rVec = VectorMath.sub(point, seg.midPoint);
            const rMag = VectorMath.mag(rVec);
            
            // Todo está en metros, la física es pura
            if (rMag < this.SINGULARITY_THRESHOLD) return null;

            const rUnit: Vector3D = VectorMath.normalize(rVec);
            const crossProduct = VectorMath.cross(seg.deltaL, rUnit);

            const inverseSquareOfDistance = 1 / Math.pow(rMag, 2);
            b = VectorMath.add(b, VectorMath.multiplyScalar(crossProduct, inverseSquareOfDistance));
        }

        b = VectorMath.multiplyScalar(b, this.MU_0_OVER_4PI);

        return b;
    }
}
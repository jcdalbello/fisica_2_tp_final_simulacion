// src/application/BiotSavartCalculator.ts
import { Vector3D, Wire } from '../domain/entities';
import { IBiotSavartSolver } from '../domain/ports';
import { VectorMath } from '../domain/VectorMath';

export class BiotSavartCalculator implements IBiotSavartSolver {
    calculateFieldAt(point: Vector3D, wire: Wire): Vector3D | null {
        let bz = 0; 

        for (const seg of wire.segments) {
            const rVec = VectorMath.sub(point, seg.midPoint);
            const rMag = VectorMath.mag(rVec);

            if (rMag < 5) return null;

            const crossProduct = VectorMath.cross(seg.deltaL, rVec);
            
            bz += crossProduct.z / Math.pow(rMag, 3);
        }

        return { x: 0, y: 0, z: bz };
    }
}